import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';
import { BlogCategory, BlogCategorySchema } from './schemas/blog-category.schema';
import { BlogComment, BlogCommentSchema } from './schemas/blog-comment.schema';
@Module({ imports:[MongooseModule.forFeature([{name:BlogPost.name,schema:BlogPostSchema},{name:BlogCategory.name,schema:BlogCategorySchema},{name:BlogComment.name,schema:BlogCommentSchema}])], controllers:[BlogController], providers:[BlogService] })
export class BlogModule {}
