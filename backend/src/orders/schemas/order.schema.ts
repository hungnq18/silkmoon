import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

class OrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  spec: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 0, min: 0 })
  costPriceSnapshot: number;

  @Prop()
  image: string;

  @Prop({ type: String, default: null })
  embroidery: string | null;
}

@Schema({ timestamps: true })
export class Order {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: '' })
  note: string;

  @Prop({ required: true, enum: ['payos', 'cod'] })
  paymentMethod: string;

  @Prop({
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  paymentStatus: string;

  @Prop({
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending',
  })
  orderStatus: string;

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  discountAmount: number;

  @Prop({ required: true })
  total: number;

  @Prop({ type: String, default: null })
  promoCode: string | null;

  @Prop({ type: [Object], required: true })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ orderNumber: 'text', fullName: 'text', email: 'text', phone: 'text' });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, createdAt: -1 });
