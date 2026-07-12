import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AnalyticsEvent, AnalyticsEventDocument } from './analytics-event.schema';
import { AiUsage, AiUsageDocument } from '../ar/ai-usage.schema';
import { SettingsService } from '../settings/settings.service';

const DEFAULT_FINANCE_CONFIG = {
  revenueBasis: 'total' as 'total' | 'subtotal',
  includePaidOrders: true,
  codStatuses: ['delivered', 'completed'],
  paymentFeePercent: 0,
  shippingCostPerOrder: 0,
  otherCostPercent: 0,
  fixedOperatingCost: 0,
};
type FinanceConfig = typeof DEFAULT_FINANCE_CONFIG;

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(AnalyticsEvent.name) private analyticsModel: Model<AnalyticsEventDocument>,
    @InjectModel(AiUsage.name) private aiUsageModel: Model<AiUsageDocument>,
    private settingsService: SettingsService,
  ) {}

  private async getFinanceConfig(): Promise<FinanceConfig> {
    const saved = (await this.settingsService.findByKey('finance_config'))?.value || {};
    const safeNumber = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
    return {
      revenueBasis: saved.revenueBasis === 'subtotal' ? 'subtotal' : 'total',
      includePaidOrders: saved.includePaidOrders !== false,
      codStatuses: Array.isArray(saved.codStatuses)
        ? saved.codStatuses.filter((status: string) => ['pending', 'processing', 'shipped', 'delivered', 'completed'].includes(status))
        : DEFAULT_FINANCE_CONFIG.codStatuses,
      paymentFeePercent: safeNumber(saved.paymentFeePercent),
      shippingCostPerOrder: safeNumber(saved.shippingCostPerOrder),
      otherCostPercent: safeNumber(saved.otherCostPercent),
      fixedOperatingCost: safeNumber(saved.fixedOperatingCost),
    };
  }

  private recognizesRevenue(order: any, config: FinanceConfig) {
    return (config.includePaidOrders && order.paymentStatus === 'paid')
      || (order.paymentMethod === 'cod' && config.codStatuses.includes(order.orderStatus));
  }

  async getDashboardStats() {
    const config = await this.getFinanceConfig();
    const candidateOrders = await this.orderModel.find({ orderStatus: { $ne: 'cancelled' } }).lean();
    const orders = candidateOrders.filter(order => this.recognizesRevenue(order, config));
    const totalRevenue = orders.reduce((sum, order) => sum + (order[config.revenueBasis] || 0), 0);

    // 2. Active Users
    const activeUsersCount = await this.userModel.countDocuments({ isActive: true });
    
    // 3. New Orders (Pending)
    const newOrdersCount = await this.orderModel.countDocuments({ orderStatus: 'pending' });

    // Recent orders for the dashboard table
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      totalRevenue,
      activeUsersCount,
      newOrdersCount,
      recentOrders
    };
  }
  async getFinanceReport(query: { from?: string; to?: string; groupBy?: string } = {}) {
    const config = await this.getFinanceConfig();
    const now = new Date();
    const from = query.from ? new Date(`${query.from}T00:00:00+07:00`) : new Date(now.getTime() - 29 * 86400000);
    const to = query.to ? new Date(`${query.to}T23:59:59.999+07:00`) : now;
    const groupBy = ['day', 'week', 'month', 'quarter', 'year'].includes(query.groupBy || '') ? query.groupBy! : 'day';
    const candidateOrders = await this.orderModel.find({
      createdAt: { $gte: from, $lte: to },
      orderStatus: { $ne: 'cancelled' },
    }).sort({ createdAt: 1 }).lean();
    const orders = candidateOrders.filter(order => this.recognizesRevenue(order, config));
    const products = await this.productModel.find().select('_id costPrice').lean();
    const costs = new Map(products.map(p => [p._id.toString(), p.costPrice || 0]));
    const buckets = new Map<string, { label: string; revenue: number; cost: number; profit: number; orderCount: number }>();
    const productTotals = new Map<string, { name: string; revenue: number; cost: number; profit: number; quantity: number }>();
    let revenue = 0, cost = 0, missingCostSnapshots = 0;
    const dateParts = (date: Date) => Object.fromEntries(
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(date).map(part => [part.type, part.value]),
    );
    const bucketKey = (date: Date) => {
      const p = dateParts(date);
      if (groupBy === 'year') return p.year;
      if (groupBy === 'quarter') return `${p.year}-Q${Math.ceil(Number(p.month) / 3)}`;
      if (groupBy === 'month') return `${p.year}-${p.month}`;
      if (groupBy === 'week') {
        const local = new Date(`${p.year}-${p.month}-${p.day}T00:00:00Z`);
        local.setUTCDate(local.getUTCDate() - ((local.getUTCDay() + 6) % 7));
        const start = Date.UTC(local.getUTCFullYear(), 0, 1);
        return `${local.getUTCFullYear()}-W${String(Math.ceil((((local.getTime() - start) / 86400000) + 1) / 7)).padStart(2, '0')}`;
      }
      return `${p.year}-${p.month}-${p.day}`;
    };
    for (const order of orders) {
      const orderRevenue = order[config.revenueBasis] || 0;
      let orderCost = 0;
      const revenueFactor = order.subtotal ? orderRevenue / order.subtotal : 0;
      for (const item of order.items || []) {
        const hasSnapshot = typeof item.costPriceSnapshot === 'number';
        if (!hasSnapshot) missingCostSnapshots += 1;
        const unitCost = hasSnapshot ? item.costPriceSnapshot : (costs.get(item.productId) || 0);
        const itemCost = unitCost * item.quantity;
        const itemRevenue = item.price * item.quantity * revenueFactor;
        orderCost += itemCost;
        const current = productTotals.get(item.productId) || { name: item.name, revenue: 0, cost: 0, profit: 0, quantity: 0 };
        current.revenue += itemRevenue;
        current.cost += itemCost;
        const variableCosts = itemRevenue * ((config.paymentFeePercent + config.otherCostPercent) / 100);
        const shippingShare = orderRevenue ? config.shippingCostPerOrder * (itemRevenue / orderRevenue) : 0;
        current.profit = current.revenue - current.cost - variableCosts - shippingShare;
        current.quantity += item.quantity;
        productTotals.set(item.productId, current);
      }
      revenue += orderRevenue;
      cost += orderCost;
      const key = bucketKey(new Date(order.createdAt as any));
      const bucket = buckets.get(key) || { label: key, revenue: 0, cost: 0, profit: 0, orderCount: 0 };
      bucket.revenue += orderRevenue;
      bucket.cost += orderCost;
      bucket.orderCount += 1;
      const variableCosts = bucket.revenue * ((config.paymentFeePercent + config.otherCostPercent) / 100);
      bucket.profit = bucket.revenue - bucket.cost - variableCosts - bucket.orderCount * config.shippingCostPerOrder;
      buckets.set(key, bucket);
    }
    const discount = orders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const grossProfit = revenue - cost;
    const paymentFees = revenue * config.paymentFeePercent / 100;
    const shippingCosts = orders.length * config.shippingCostPerOrder;
    const otherCosts = revenue * config.otherCostPercent / 100;
    const netProfit = grossProfit - paymentFees - shippingCosts - otherCosts - config.fixedOperatingCost;
    const fixedPerOrder = orders.length ? config.fixedOperatingCost / orders.length : 0;
    for (const bucket of buckets.values()) bucket.profit -= bucket.orderCount * fixedPerOrder;
    for (const product of productTotals.values()) {
      product.profit -= revenue ? config.fixedOperatingCost * (product.revenue / revenue) : 0;
    }
    return {
      period: { from: from.toISOString(), to: to.toISOString(), groupBy },
      revenue, cost, discount, grossProfit, netProfit, paymentFees, shippingCosts, otherCosts,
      margin: revenue ? (netProfit / revenue) * 100 : 0,
      orderCount: orders.length,
      series: [...buckets.values()],
      topProducts: [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
      missingCostSnapshots, config,
      formula: {
        revenue: `${config.revenueBasis === 'total' ? 'Tổng thanh toán' : 'Tạm tính trước giảm giá'} của đơn đủ điều kiện ghi nhận.`,
        grossProfit: 'Doanh thu - giá vốn sản phẩm.',
        netProfit: 'Lợi nhuận gộp - phí thanh toán - vận chuyển - chi phí khác - chi phí vận hành cố định.',
      },
    };
  }

  getAnalyticsStatus() {
    const hasPropertyId = Boolean(process.env.GA4_PROPERTY_ID);
    const hasCredentials = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);

    return {
      connected: hasPropertyId && hasCredentials,
      propertyId: process.env.GA4_PROPERTY_ID || null,
      message: hasPropertyId
        ? 'Cần cấu hình Google service account để đọc dữ liệu GA4.'
        : 'Chưa cấu hình GA4_PROPERTY_ID.'
    };
  }

  async trackEvent(data: { type: string; path: string; label?: string; entityId?: string }) {
    const allowed = ['page_view', 'product_view', 'click', 'ar_open', 'chatbot_open'];
    if (!allowed.includes(data.type) || !data.path) return { tracked: false };
    await this.analyticsModel.create({ type: data.type, path: data.path.slice(0, 500), label: (data.label || '').slice(0, 200), entityId: (data.entityId || '').slice(0, 80) });
    return { tracked: true };
  }

  async getAnalyticsReport() {
    const since = new Date(Date.now() - 30 * 86400000);
    const group = async (match: any, field: string) => this.analyticsModel.aggregate([
      { $match: { ...match, createdAt: { $gte: since } } },
      { $group: { _id: `$${field}`, views: { $sum: 1 }, label: { $last: '$label' } } },
      { $sort: { views: -1 } }, { $limit: 10 },
    ]);
    const [topPages, topProducts, totals] = await Promise.all([
      group({ type: 'page_view' }, 'path'), group({ type: 'product_view' }, 'entityId'),
      this.analyticsModel.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: '$type', count: { $sum: 1 } } }]),
    ]);
    return { periodDays: 30, topPages, topProducts, totals: Object.fromEntries(totals.map(item => [item._id, item.count])) };
  }

  async getAiUsageReport() {
    const since = new Date(Date.now() - 30 * 86400000);
    const rows = await this.aiUsageModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { feature: '$feature', model: '$modelName' }, requests: { $sum: 1 }, promptTokens: { $sum: '$promptTokens' }, outputTokens: { $sum: '$outputTokens' }, totalTokens: { $sum: '$totalTokens' } } },
      { $sort: { totalTokens: -1 } },
    ]);
    return { periodDays: 30, rows, totalTokens: rows.reduce((sum, row) => sum + row.totalTokens, 0), totalRequests: rows.reduce((sum, row) => sum + row.requests, 0) };
  }
}
