import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import { ValidatePromoDto } from './dto/validate-promo.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
  ) { }

  async validate(dto: ValidatePromoDto) {
    const code = dto.code.trim().toUpperCase();
    const promo = await this.promotionModel.findOne({ code });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }

    // Check expiry
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      throw new BadRequestException('Mã giảm giá đã hết hạn sử dụng.');
    }

    // Check usage limit
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
    }

    return {
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
    };
  }
  async findAll(query: any = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '10', 10));
    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    const [items, total] = await Promise.all([this.promotionModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), this.promotionModel.countDocuments(filter)]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
  create(data: any) { return this.promotionModel.create({ ...data, code: data.code.toUpperCase() }) }
  update(id: string, data: any) { return this.promotionModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean() }
  remove(id: string) { return this.promotionModel.findByIdAndDelete(id).lean() }

  // Called when an order is placed to increment usage
  async markUsed(code: string) {
    const result = await this.promotionModel.findOneAndUpdate(
      {
        code: code.toUpperCase(),
        $expr: {
          $or: [
            { $eq: ["$maxUses", null] },
            { $lt: ["$usedCount", "$maxUses"] }
          ]
        }
      },
      { $inc: { usedCount: 1 } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new BadRequestException('Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng.');
    }
  }
}
