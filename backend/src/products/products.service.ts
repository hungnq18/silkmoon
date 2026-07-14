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
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search.trim() };
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

  async importRows(rows: any[]) {
    const results: any[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      try {
        if (!row.name || !row.category || !row.material || Number(row.price) < 0) {
          throw new Error('Thiếu tên, danh mục, chất liệu hoặc giá bán không hợp lệ');
        }
        const sku = String(row.sku || '').trim().toUpperCase();
        const slug = String(row.slug || row.name).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const payload = {
          sku: sku || undefined,
          slug,
          name: String(row.name).trim(),
          category: String(row.category).trim(),
          material: String(row.material).trim(),
          description: String(row.description || row.name).trim(),
          price: Number(row.price || 0),
          originalPrice: Number(row.originalPrice || 0) || undefined,
          costPrice: Number(row.costPrice || 0),
          stock: Number(row.stock || 0),
          images: String(row.images || '').split(',').map((value) => value.trim()).filter(Boolean),
          isBestSeller: ['true', '1', 'yes', 'có', 'co'].includes(String(row.isBestSeller || '').toLowerCase()),
        };
        const filter = sku ? { sku } : { slug };
        const exists = await this.productModel.exists(filter);
        await this.productModel.findOneAndUpdate(filter, { $set: payload }, { upsert: true, returnDocument: 'after', runValidators: true });
        results.push({ row: index + 2, sku, status: exists ? 'updated' : 'created' });
      } catch (error) {
        results.push({ row: index + 2, sku: row.sku || '', status: 'error', message: error instanceof Error ? error.message : 'Dữ liệu không hợp lệ' });
      }
    }
    return {
      total: rows.length,
      created: results.filter((item) => item.status === 'created').length,
      updated: results.filter((item) => item.status === 'updated').length,
      errors: results.filter((item) => item.status === 'error'),
    };
  }

  async update(id: string, data: any) {
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, data, { returnDocument: 'after' })
      .lean();
    if (!updatedProduct) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return updatedProduct;
  }

  async reserveStock(id: string, quantity: number) {
    return this.productModel
      .findOneAndUpdate(
        { _id: id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: 'after' },
      )
      .lean();
  }

  async releaseStock(id: string, quantity: number) {
    return this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stock: quantity } },
        { returnDocument: 'after' },
      )
      .lean();
  }

  async remove(id: string) {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).lean();
    if (!deletedProduct) {
      throw new NotFoundException(`Sản phẩm không tồn tại`);
    }
    return deletedProduct;
  }
}
