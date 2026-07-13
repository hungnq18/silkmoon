import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NewsletterSubscriptionDocument = NewsletterSubscription & Document;

export enum NewsletterSubscriptionStatus {
  ACTIVE = 'active',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum NewsletterContactType {
  EMAIL = 'email',
  PHONE = 'phone',
}

@Schema({ timestamps: true })
export class NewsletterSubscription {
  @Prop({ required: true, unique: true, trim: true })
  contact: string;

  @Prop({ required: true, enum: NewsletterContactType })
  type: NewsletterContactType;

  @Prop({ enum: NewsletterSubscriptionStatus, default: NewsletterSubscriptionStatus.ACTIVE })
  status: NewsletterSubscriptionStatus;

  @Prop({ default: 'footer' })
  source: string;

  @Prop({ type: Date, default: null })
  lastEmailSentAt: Date | null;
}

export const NewsletterSubscriptionSchema = SchemaFactory.createForClass(NewsletterSubscription);
NewsletterSubscriptionSchema.index({ status: 1, createdAt: -1 });
NewsletterSubscriptionSchema.index({ type: 1, createdAt: -1 });
