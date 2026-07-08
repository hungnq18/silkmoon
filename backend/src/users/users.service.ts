import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(createData);
    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll() {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async update(id: string, updateData: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash').exec();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async getCart(id: string) {
    const user = await this.userModel.findById(id).select('cart').exec();
    return user ? user.cart : [];
  }

  async updateCart(id: string, cart: { productId: string; quantity: number }[]) {
    return this.userModel.findByIdAndUpdate(id, { cart }, { new: true }).select('cart').exec();
  }
}

