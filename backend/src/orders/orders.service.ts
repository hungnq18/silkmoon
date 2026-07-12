import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PromotionsService } from '../promotions/promotions.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly promotionsService: PromotionsService,
    private readonly productsService: ProductsService,
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

    for (const item of dto.items) {
      const product = await this.productsService.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${item.productId} không tồn tại`);
      }
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm "${product.name}" không đủ hàng (hiện còn ${product.stock}).`);
      }
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      items.push({
        productId: product._id.toString(),
        name: product.name,
        spec: product.category || 'N/A',
        quantity: item.quantity,
        price: product.price,
        costPriceSnapshot: product.costPrice || 0,
        image: product.images?.[0] || '',
        embroidery: null, // Depending on custom requirements
      });
    }

    let discountAmount = 0;
    if (dto.promoCode) {
      const result = await this.promotionsService.validate({ code: dto.promoCode });
      discountAmount = Math.round(subtotal * (result.discountPercent / 100));
    }

    const total = Math.max(0, subtotal - discountAmount);

    const order = await this.orderModel.create({
      ...dto,
      items,
      subtotal,
      discountAmount,
      total,
      orderNumber,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

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
    };
  }

  async findById(id: string) {
    const order = await this.orderModel.findById(id).lean();
    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }
    return order;
  }

  async findAll(query: { page?: string; limit?: string; search?: string; status?: string } = {}) {
    const pageNum = Math.max(1, parseInt(query.page || '1', 10));
    const limitNum = Math.max(1, parseInt(query.limit || '15', 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.status) filter.orderStatus = query.status;
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
