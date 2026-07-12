import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ default: 'product', enum: ['product'] })
  categoryType: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  coverImage?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ name: 'text', slug: 'text', description: 'text' });
CategorySchema.index({ isFeatured: 1, isActive: 1, createdAt: -1 });
