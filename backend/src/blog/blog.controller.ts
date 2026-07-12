import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateBlogPostDto, UpdateBlogPostDto, CreateBlogCategoryDto, UpdateBlogCategoryDto, CreateCommentDto, UpdateCommentDto } from './dto/blog.dto';
const admin = [JwtAuthGuard, RolesGuard];
@Controller('blog')
export class BlogController {
  constructor(private service: BlogService) { }
  @Get('posts') posts() { return this.service.listPosts(); }
  @Get('posts/:id') post(@Param('id') id: string) { return this.service.getPost(id); }
  @Get('categories') categories() { return this.service.listCategories(); }
  @Post('comments') comment(@Body() data: CreateCommentDto) { return this.service.createComment(data); }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Get('admin/posts') adminPosts(@Query() query: any) { return this.service.listPosts(true, query); }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Get('admin/categories') adminCategories(@Query() query: any) { return this.service.listCategories(query); }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Post('posts') createPost(@Body() d: CreateBlogPostDto) { return this.service.createPost(d) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Patch('posts/:id') updatePost(@Param('id') id: string, @Body() d: UpdateBlogPostDto) { return this.service.updatePost(id, d) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Delete('posts/:id') deletePost(@Param('id') id: string) { return this.service.deletePost(id) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Post('categories') createCategory(@Body() d: CreateBlogCategoryDto) { return this.service.createCategory(d) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Patch('categories/:id') updateCategory(@Param('id') id: string, @Body() d: UpdateBlogCategoryDto) { return this.service.updateCategory(id, d) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Delete('categories/:id') deleteCategory(@Param('id') id: string) { return this.service.deleteCategory(id) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Get('admin/comments') comments(@Query() query: any) { return this.service.listComments(query) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Patch('comments/:id') updateComment(@Param('id') id: string, @Body() d: UpdateCommentDto) { return this.service.updateComment(id, d) }
  @UseGuards(...admin) @Roles(UserRole.ADMIN) @Delete('comments/:id') deleteComment(@Param('id') id: string) { return this.service.deleteComment(id) }
}
