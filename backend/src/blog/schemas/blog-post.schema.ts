import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type BlogPostDocument = BlogPost & Document;
@Schema({ timestamps: true, collection: 'blogposts' })
export class BlogPost {
  @Prop({ required: true }) title: string;
  @Prop({ required: true, unique: true }) slug: string;
  @Prop({ required: true }) excerpt: string;
  @Prop({ required: true }) content: string;
  @Prop() featuredImage?: string;
  @Prop({ required: true }) categoryId: string;
  @Prop({ default: 'Brand Silkmoon' }) author: string;
  @Prop({ default: 'draft', enum: ['draft', 'published'] }) status: string;
  @Prop({ default: 'standard', enum: ['standard', 'featured', 'editorial', 'guide', 'split', 'gallery'] }) layout: string;
  @Prop({ type: [String], default: [] }) galleryImages: string[];
  @Prop() publishedAt?: Date;
}
export const BlogPostSchema = SchemaFactory.createForClass(BlogPost);
