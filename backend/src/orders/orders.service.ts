import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { PromotionsService } from '../promotions/promotions.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly promotionsService: PromotionsService,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SM-${timestamp}-${random}`;
  }

  async create(dto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();

    const order = await this.orderModel.create({
      ...dto,
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
