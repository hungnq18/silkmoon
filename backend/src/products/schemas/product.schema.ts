import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

class SizeOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  label: string;
}

class ColorOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  hex: string;

  @Prop({ required: true })
  label: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

class RatingInfo {
  @Prop({ default: 0 })
  average: number;

  @Prop({ default: 0 })
  count: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ unique: true, sparse: true, trim: true, uppercase: true })
  sku?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;
  @Prop({ default: 0, min: 0 }) costPrice: number;

  @Prop({ default: 0 })
  embroideryPrice: number;

  @Prop({ default: false })
  allowEmbroidery: boolean;

  @Prop({ default: 12, min: 1, max: 50 })
  embroideryMaxLength: number;

  @Prop({ default: false })
  allowCustomSize: boolean;

  @Prop({ default: 0, min: 0 })
  customSizePrice: number;

  @Prop({ required: true })
  material: string;

  @Prop()
  momme: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [Object], default: [] })
  sizes: SizeOption[];

  @Prop({ type: [Object], default: [] })
  colors: ColorOption[];

  @Prop({ default: 100 })
  stock: number;

  @Prop({ default: false })
  isBestSeller: boolean;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Object, default: { average: 0, count: 0 } })
  ratings: RatingInfo;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ category: 1 });
ProductSchema.index({ isBestSeller: 1, 'ratings.count': -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', material: 'text' });
