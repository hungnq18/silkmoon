import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: QueryProductDto) {
    const { category, search, sort, page = '1', limit = '12' } = query;

    const filter: Record<string, any> = {};

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption: Record<string, any> = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'popular') sortOption = { 'ratings.count': -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findBestSellers() {
    return this.productModel
      .find({ isBestSeller: true })
      .sort({ 'ratings.count': -1 })
      .limit(8)
      .lean();
  }

  async findBySlug(slug: string) {
    const product = await this.productModel.findOne({ slug }).lean();
    if (!product) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return product;
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).lean();
    if (!product) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return product;
  }

  async findRelated(id: string) {
    const product = await this.productModel.findById(id).lean();
    if (!product) return [];

    return this.productModel
      .find({
        _id: { $ne: id },
        category: product.category,
      })
      .limit(4)
      .lean();
  }

  async getCategories() {
    const categories = await this.productModel.distinct('category');
    return categories;
  }

  async create(data: any) {
    // Automatically generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const createdProduct = new this.productModel(data);
    return createdProduct.save();
  }

  async update(id: string, data: any) {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, data, { new: true })
      .lean();
    if (!updatedProduct) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return updatedProduct;
  }

  async remove(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).lean();
    if (!deletedProduct) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return deletedProduct;
  }
}
