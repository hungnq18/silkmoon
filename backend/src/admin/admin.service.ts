import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getDashboardStats() {
    // 1. Total Revenue from completed orders
    const orders = await this.orderModel.find({ orderStatus: { $ne: 'cancelled' } }).lean();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
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
}
