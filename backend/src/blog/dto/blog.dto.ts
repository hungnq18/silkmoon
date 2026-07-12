import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBlogPostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  layout?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}

export class CreateBlogCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBlogCategoryDto extends PartialType(CreateBlogCategoryDto) {}

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @IsOptional()
  status?: string;
}
