import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(query: { page?: string; limit?: string; search?: string; isFeatured?: string; isActive?: string } = {}) {
    const pageNum = Math.max(1, parseInt(query.page || '1', 10));
    const limitNum = Math.max(1, parseInt(query.limit || '9999', 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured === 'true';
    if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
    const [items, total] = await Promise.all([
      this.categoryModel.find(filter).sort({ sortOrder: 1, createdAt: -1 }).populate('parentId').skip(skip).limit(limitNum).exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    return { items, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
  }

  async findOne(id: string) {
    return this.categoryModel.findById(id).populate('parentId').exec();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryModel.findByIdAndUpdate(id, updateCategoryDto, { returnDocument: 'after' }).exec();
  }

  async remove(id: string) {
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}

