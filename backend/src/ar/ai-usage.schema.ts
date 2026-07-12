import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AiUsageDocument = AiUsage & Document;

@Schema({ timestamps: true, collection: 'ai_usage' })
export class AiUsage {
  createdAt: Date;
  @Prop({ required: true }) feature: string;
  @Prop({ required: true }) provider: string;
  @Prop({ required: true }) modelName: string;
  @Prop({ default: 0 }) promptTokens: number;
  @Prop({ default: 0 }) outputTokens: number;
  @Prop({ default: 0 }) totalTokens: number;
  @Prop({ default: true }) success: boolean;
}

export const AiUsageSchema = SchemaFactory.createForClass(AiUsage);
AiUsageSchema.index({ createdAt: -1, feature: 1 });
