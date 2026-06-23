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
  ) {}

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

  // Called when an order is placed to increment usage
  async markUsed(code: string) {
    await this.promotionModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
    );
  }
}
