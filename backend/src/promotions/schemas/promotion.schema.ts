import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true, min: 1, max: 100 })
  discountPercent: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Number, default: null })
  maxUses: number | null;

  @Prop({ default: 0 })
  usedCount: number;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
PromotionSchema.index({ code: 'text' });
PromotionSchema.index({ isActive: 1, createdAt: -1 });
