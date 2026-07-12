import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AnalyticsEventDocument = AnalyticsEvent & Document;

@Schema({ timestamps: true, collection: 'analytics_events' })
export class AnalyticsEvent {
  createdAt: Date;
  @Prop({ required: true, enum: ['page_view', 'product_view', 'click', 'ar_open', 'chatbot_open'] }) type: string;
  @Prop({ required: true, maxlength: 500 }) path: string;
  @Prop({ default: '', maxlength: 200 }) label: string;
  @Prop({ default: '', maxlength: 80 }) entityId: string;
}

export const AnalyticsEventSchema = SchemaFactory.createForClass(AnalyticsEvent);
AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ path: 1, createdAt: -1 });
