import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ARService } from '../ar/ar.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly arService: ARService,
  ) {}

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
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findPendingVerification(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase(), emailVerified: false })
      .select('+emailVerificationOtpHash +emailVerificationExpiresAt +emailVerificationLastSentAt +emailVerificationAttempts')
      .exec();
  }

  async savePendingRegistration(
    existingId: string | undefined,
    data: Pick<User, 'email' | 'passwordHash' | 'fullName'> & Partial<Pick<User, 'phone'>>,
    otpHash: string,
    expiresAt: Date,
  ): Promise<UserDocument> {
    const verification = {
      ...data,
      emailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationExpiresAt: expiresAt,
      emailVerificationLastSentAt: new Date(),
      emailVerificationAttempts: 0,
    };
    if (existingId) {
      const user = await this.userModel.findByIdAndUpdate(existingId, verification, { returnDocument: 'after' }).exec();
      if (!user) throw new BadRequestException('Không tìm thấy tài khoản chờ xác minh.');
      return user;
    }
    return this.create(verification);
  }

  async updateVerificationOtp(id: string, otpHash: string, expiresAt: Date) {
    return this.userModel.findByIdAndUpdate(id, {
      emailVerificationOtpHash: otpHash,
      emailVerificationExpiresAt: expiresAt,
      emailVerificationLastSentAt: new Date(),
      emailVerificationAttempts: 0,
    }).exec();
  }

  async incrementVerificationAttempts(id: string) {
    return this.userModel.findByIdAndUpdate(id, { $inc: { emailVerificationAttempts: 1 } }).exec();
  }

  async confirmEmailVerification(id: string, otpHash: string) {
    return this.userModel.findOneAndUpdate(
      {
        _id: id,
        emailVerified: false,
        emailVerificationOtpHash: otpHash,
        emailVerificationExpiresAt: { $gt: new Date() },
      },
      {
        $set: { emailVerified: true },
        $unset: {
          emailVerificationOtpHash: 1,
          emailVerificationExpiresAt: 1,
          emailVerificationLastSentAt: 1,
          emailVerificationAttempts: 1,
        },
      },
      { returnDocument: 'after' },
    ).exec();
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

  async updateCart(id: string, cart: any[]) {
    return this.userModel.findByIdAndUpdate(id, { cart }, { returnDocument: 'after' }).select('cart').exec();
  }

  async updateOwnProfile(id: string, data: UpdateProfileDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      {
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || '',
        address: data.address?.trim() || '',
        addressDetail: data.addressDetail?.trim() || '',
        provinceCode: data.provinceCode || null,
        provinceName: data.provinceName?.trim() || '',
        wardCode: data.wardCode || null,
        wardName: data.wardName?.trim() || '',
      },
      { returnDocument: 'after' },
    ).select('email fullName phone address addressDetail provinceCode provinceName wardCode wardName avatarUrl role').exec();
    if (!user) throw new BadRequestException('Không tìm thấy tài khoản.');
    return user;
  }

  async uploadAvatar(id: string, image: string) {
    if (!/^data:image\/(jpeg|png|webp);base64,/i.test(image || '')) {
      throw new BadRequestException('Avatar phải là ảnh JPG, PNG hoặc WebP.');
    }
    if (image.length > 3_000_000) {
      throw new BadRequestException('Ảnh đại diện không được vượt quá 2 MB.');
    }
    const avatarUrl = await this.arService.uploadImageToCloudinary(image, 'silkmoon_avatars');
    const user = await this.userModel.findByIdAndUpdate(id, { avatarUrl }, { returnDocument: 'after' })
      .select('email fullName phone address addressDetail provinceCode provinceName wardCode wardName avatarUrl role').exec();
    if (!user) throw new BadRequestException('Không tìm thấy tài khoản.');
    return user;
  }

  async changeOwnPassword(id: string, data: ChangePasswordDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new BadRequestException('Không tìm thấy tài khoản.');
    if (!(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }
    if (await bcrypt.compare(data.newPassword, user.passwordHash)) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }
    user.passwordHash = await bcrypt.hash(data.newPassword, 10);
    await user.save();
    return { message: 'Mật khẩu đã được cập nhật thành công.' };
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

