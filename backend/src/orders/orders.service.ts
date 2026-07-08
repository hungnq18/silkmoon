import { Injectable, NotFoundException } from '@nestjs/common';
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
      
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      
      items.push({
        productId: product._id.toString(),
        name: product.name,
        spec: product.category || 'N/A',
        quantity: item.quantity,
        price: product.price,
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

  async findAll() {
    return this.orderModel.find().sort({ createdAt: -1 }).lean();
  }

  async updateStatus(id: string, status: string) {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
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
