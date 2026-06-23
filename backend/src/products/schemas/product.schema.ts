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
}

class RatingInfo {
  @Prop({ default: 0 })
  average: number;

  @Prop({ default: 0 })
  count: number;
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 0 })
  embroideryPrice: number;

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
