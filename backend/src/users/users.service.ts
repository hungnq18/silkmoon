import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createData: Partial<User>): Promise<UserDocument> {
    const newUser = new this.userModel(createData);
    return newUser.save();
  }

  async createByAdmin(data: CreateUserDto) {
    const email = data.email.trim().toLowerCase();
    if (await this.userModel.exists({ email })) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.userModel.create({
      email,
      passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone?.trim() || '',
      role: data.role,
    });

    const { passwordHash: _passwordHash, ...result } = user.toObject();
    return result;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(query: { page?: string; limit?: string; search?: string; role?: string } = {}) {
    const pageNum = Math.max(1, parseInt(query.page || '1', 10));
    const limitNum = Math.max(1, parseInt(query.limit || '20', 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.role) filter.role = query.role;
    const [items, total] = await Promise.all([
      this.userModel.find(filter).select('-passwordHash').skip(skip).limit(limitNum).exec(),
      this.userModel.countDocuments(filter),
    ]);

    return { items, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  }

  async update(id: string, updateData: UpdateUserDto) {
    const { password, ...fields } = updateData;
    const changes: Partial<User> = { ...fields };
    if (password) changes.passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.findByIdAndUpdate(id, changes, { returnDocument: 'after' }).select('-passwordHash').exec();
  }

  async remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async getCart(id: string) {
    const user = await this.userModel.findById(id).select('cart').exec();
    return user ? user.cart : [];
  }

  async updateCart(id: string, cart: { productId: string; quantity: number }[]) {
    return this.userModel.findByIdAndUpdate(id, { cart }, { returnDocument: 'after' }).select('cart').exec();
  }

  async setResetPasswordToken(id: string, tokenHash: string, expiresAt: Date) {
    return this.userModel.findByIdAndUpdate(id, { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: expiresAt }).exec();
  }

  async resetPassword(tokenHash: string, passwordHash: string) {
    return this.userModel.findOneAndUpdate(
      { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: { $gt: new Date() } },
      { $set: { passwordHash }, $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 } },
      { returnDocument: 'after' },
    ).exec();
  }
}

