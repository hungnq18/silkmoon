import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PromotionsService } from '../promotions/promotions.service';
import { ProductsService } from '../products/products.service';
import { PayosService } from './payos.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly promotionsService: PromotionsService,
    private readonly productsService: ProductsService,
    private readonly payosService: PayosService,
    private readonly settingsService: SettingsService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SM-${timestamp}-${random}`;
  }

  async create(dto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();
    let subtotal = 0;
    const items: any[] = [];
    const sizeSetting = await this.settingsService.findByKey('product_sizes');
    const sizeCatalog = Array.isArray(sizeSetting?.value) ? sizeSetting.value : [];
    const catalogSizes = sizeCatalog.some((entry) => Array.isArray(entry?.sizes))
      ? sizeCatalog.flatMap((entry) => Array.isArray(entry?.sizes) ? entry.sizes : [])
      : sizeCatalog;
    const catalogSizesById = new Map(catalogSizes.map((size) => [size.id, size]));

    for (const item of dto.items) {
      const product = await this.productsService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${item.productId} không tồn tại`);
      }
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm "${product.name}" không đủ hàng (hiện còn ${product.stock}).`);
      }
      
      const embroidery = item.embroidery?.trim() || null;
      const isCustomSize = item.sizeId === 'custom' || Boolean(item.customSize);
      const customSize = isCustomSize ? {
        width: Math.max(0, Number(item.customSize?.width) || 0),
        length: Math.max(0, Number(item.customSize?.length) || 0),
        height: Math.max(0, Number(item.customSize?.height) || 0),
      } : null;
      const customMeasurements = isCustomSize && Array.isArray(item.customMeasurements) ? item.customMeasurements
        .filter((measurement) => measurement?.label?.trim())
        .map((measurement) => ({
          id: measurement.id || '',
          label: measurement.label.trim(),
          value: Math.max(0, Number(measurement.value) || 0),
          unit: measurement.unit?.trim() || 'cm',
        })) : [];
      if (isCustomSize && customMeasurements.length && customMeasurements.some((measurement) => !measurement.value)) throw new BadRequestException(`Vui lòng nhập đầy đủ thông số size riêng cho "${product.name}".`);
      if (isCustomSize && !customMeasurements.length && (!customSize?.width || !customSize?.length)) throw new BadRequestException(`Vui lòng nhập đầy đủ thông số size riêng cho "${product.name}".`);
      if (embroidery && embroidery.length > (product.embroideryMaxLength || 12)) throw new BadRequestException(`Nội dung may tên của "${product.name}" vượt quá số ký tự cho phép.`);
      const sizeMeasurements = Array.isArray(item.sizeMeasurements) ? item.sizeMeasurements
        .filter((measurement) => measurement?.label?.trim() && measurement.value !== undefined && measurement.value !== null)
        .map((measurement) => ({
          id: measurement.id || '',
          label: measurement.label.trim(),
          value: Number(measurement.value),
          unit: measurement.unit?.trim() || 'cm',
        })) : [];
      const sizeDetails = sizeMeasurements.map((measurement) => `${measurement.label}: ${measurement.value}${measurement.unit}`).join(' · ');
      const customSizeDetails = customMeasurements.map((measurement) => `${measurement.label}: ${measurement.value}${measurement.unit}`).join(' · ');
      const selectedSize = !isCustomSize && item.sizeId
        ? product.sizes?.find((size) => size.id === item.sizeId)
        : null;
      const catalogSize = !isCustomSize && item.sizeId ? catalogSizesById.get(item.sizeId) : null;
      const productSizePrice = selectedSize?.price as number | '' | undefined;
      const rawSizePrice = productSizePrice === '' || productSizePrice == null ? catalogSize?.price : productSizePrice;
      const configuredSizePrice = Number(rawSizePrice);
      const sizePrice = rawSizePrice !== '' && rawSizePrice != null && Number.isFinite(configuredSizePrice) && configuredSizePrice >= 0
        ? configuredSizePrice
        : Number(product.price || 0);
      const unitPrice = sizePrice + (embroidery ? Number(product.embroideryPrice || 0) : 0) + (isCustomSize ? Number(product.customSizePrice || 0) : 0);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      
      items.push({
        productId: product._id.toString(),
        name: product.name,
        spec: [product.category || 'N/A', item.sizeLabel, sizeDetails || customSizeDetails].filter(Boolean).join(' · '),
        quantity: item.quantity,
        price: unitPrice,
        costPriceSnapshot: product.costPrice || 0,
        image: product.images?.[0] || '',
        embroidery,
        sizeId: item.sizeId || '',
        sizeLabel: item.sizeLabel || '',
        sizeMeasurements,
        customSize,
        customMeasurements,
        isCustomSize,
      });
    }

    let discountAmount = 0;
    if (dto.promoCode) {
      const result = await this.promotionsService.validate({ code: dto.promoCode });
      discountAmount = Math.round(subtotal * (result.discountPercent / 100));
    }

    const total = Math.max(0, subtotal - discountAmount);
    const payosOrderCode = dto.paymentMethod === 'payos'
      ? Date.now() * 100 + Math.floor(Math.random() * 100)
      : undefined;

    const order = await this.orderModel.create({
      ...dto,
      items,
      hasEmbroidery: items.some((item) => Boolean(item.embroidery)),
      hasCustomSize: items.some((item) => item.isCustomSize),
      subtotal,
      discountAmount,
      total,
      orderNumber,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      payosOrderCode,
    });

    let paymentLink: any = null;
    if (dto.paymentMethod === 'payos') {
      try {
        paymentLink = await this.payosService.createPaymentLink(order.toObject(), payosOrderCode!);
        order.payosPaymentLinkId = paymentLink.paymentLinkId;
        await order.save();
      } catch (error) {
        await this.orderModel.findByIdAndDelete(order._id);
        throw error;
      }
    }

    // Increment promo usage if a code was used
    if (dto.promoCode) {
      await this.promotionsService.markUsed(dto.promoCode);
    }

    // Deduct stock
    for (const item of dto.items) {
      const product = await this.productsService.findById(item.productId);
      if (product) {
        await this.productsService.update(product._id.toString(), { 
          stock: Math.max(0, product.stock - item.quantity) 
        });
      }
    }

    return {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      total: order.total,
      fullName: order.fullName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      paymentStatus: order.paymentStatus,
      checkoutUrl: paymentLink?.checkoutUrl || null,
    };
  }

  async handlePayosWebhook(payload: any) {
    let verified: any;
    try {
      verified = await this.payosService.verifyWebhook(payload);
    } catch {
      throw new BadRequestException('Chữ ký webhook PayOS không hợp lệ.');
    }
    const order = await this.orderModel.findOne({ payosOrderCode: verified.orderCode });

    // payOS gửi giao dịch mẫu khi xác nhận webhook; vẫn cần trả 2xx.
    if (!order) return { success: true };
    if (order.paymentMethod !== 'payos' || order.total !== verified.amount) {
      throw new BadRequestException('Thông tin thanh toán PayOS không khớp với đơn hàng.');
    }

    if (payload.success === true && verified.code === '00' && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.payosPaymentLinkId = verified.paymentLinkId;
      order.payosReference = verified.reference;
      await order.save();
    }
    return { success: true };
  }

  async syncPayosPaymentStatus(id: string) {
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const order = await this.orderModel.findOne(isObjectId ? { _id: id } : { orderNumber: id.toUpperCase() });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.paymentMethod === 'payos' && order.payosOrderCode && order.paymentStatus !== 'paid') {
      const payment = await this.payosService.getPayment(order.payosOrderCode);
      if (payment.status === 'PAID' && payment.amountPaid >= order.total) order.paymentStatus = 'paid';
      if (['CANCELLED', 'EXPIRED', 'FAILED'].includes(payment.status)) order.paymentStatus = 'failed';
      if (order.isModified('paymentStatus')) await order.save();
    }

    return {
      orderNumber: order.orderNumber,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      total: order.total,
      fullName: order.fullName,
    };
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }

  async findAll(query: { page?: string; limit?: string; search?: string; status?: string; customization?: string } = {}) {
    const pageNum = Math.max(1, parseInt(query.page || '1', 10));
    const limitNum = Math.max(1, parseInt(query.limit || '15', 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.status) filter.orderStatus = query.status;
    if (query.customization === 'embroidery') filter.$or = [
      { hasEmbroidery: true },
      { items: { $elemMatch: { embroidery: { $exists: true, $nin: [null, ''] } } } },
    ];
    if (query.customization === 'customSize') filter.$or = [{ hasCustomSize: true }, { 'items.isCustomSize': true }];
    const [items, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { returnDocument: 'after' }
    ).lean();
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderModel
      .findOne({ orderNumber: orderNumber.toUpperCase() })
      .lean();
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }
}
