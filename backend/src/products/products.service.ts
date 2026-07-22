import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { QueryProductDto } from './dto/query-product.dto';

const normalizeCategoryText = (value: string) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .toLowerCase()
  .trim();

const isIndividualBeddingCategory = (category: string) => {
  const normalized = normalizeCategoryText(category);
  if (!normalized || normalized.includes('bo chan ga goi')) return false;
  return ['chan', 'vo chan', 'ga', 'ga giuong', 'goi', 'vo goi'].some((name) => normalized === name || normalized.includes(name));
};

const normalizeProductPayload = (data: any) => {
  if (!Object.prototype.hasOwnProperty.call(data, 'category') && !Object.prototype.hasOwnProperty.call(data, 'categories')) return data;
  const requestedCategories = [...new Set(
    (Array.isArray(data.categories) ? data.categories : [data.category])
      .map((category) => String(category || '').trim())
      .filter(Boolean),
  )];
  const primaryCategory = String(data.category || requestedCategories[0] || '').trim();
  const categories = [...new Set([primaryCategory, ...requestedCategories].filter(Boolean))];
  return { ...data, category: primaryCategory, categories };
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: QueryProductDto) {
    const { category, search, sort, page = '1', limit = '12' } = query;

    const filter: Record<string, any> = {};

    if (category) {
      filter.$or = isIndividualBeddingCategory(category)
        ? [
            { category },
            { categories: category },
            { name: /bộ chăn ga gối/i },
            { category: /bộ chăn ga gối/i },
            { categories: /bộ chăn ga gối/i },
          ]
        : [{ category }, { categories: category }];
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

    const productCategories = [...new Set([product.category, ...(product.categories || [])].filter(Boolean))];

    return this.productModel
      .find({
        _id: { $ne: id },
        $or: [
          { category: { $in: productCategories } },
          { categories: { $in: productCategories } },
        ],
      })
      .limit(4)
      .lean();
  }

  async getCategories() {
    const [primaryCategories, additionalCategories] = await Promise.all([
      this.productModel.distinct('category'),
      this.productModel.distinct('categories'),
    ]);
    return [...new Set([...primaryCategories, ...additionalCategories].filter(Boolean))].sort();
  }

  async getChatbotCatalog(limit = 80) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return this.productModel
      .find({})
      .select({
        _id: 0,
        name: 1,
        slug: 1,
        sku: 1,
        category: 1,
        categories: 1,
        material: 1,
        description: 1,
        materialCare: 1,
        returnPolicy: 1,
        technicalSpecs: 1,
        packageIncludes: 1,
        price: 1,
        originalPrice: 1,
        stock: 1,
        sizes: 1,
        colors: 1,
        allowCustomSize: 1,
        customSizePrice: 1,
        allowEmbroidery: 1,
        embroideryPrice: 1,
        embroideryMaxLength: 1,
        isBestSeller: 1,
        ratings: 1,
      })
      .sort({ isBestSeller: -1, 'ratings.count': -1, createdAt: -1 })
      .limit(safeLimit)
      .lean();
  }

  async create(data: any) {
    // Automatically generate slug if not provided
    if (!data.slug && data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    const createdProduct = new this.productModel(normalizeProductPayload(data));
    return createdProduct.save();
  }

  async importRows(rows: any[]) {
    const results: any[] = [];
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      try {
        if (!row.name || (!row.category && !row.categories) || !row.material || Number(row.price) < 0) {
          throw new Error('Thiếu tên, danh mục, chất liệu hoặc giá bán không hợp lệ');
        }
        const sku = String(row.sku || '').trim().toUpperCase();
        const slug = String(row.slug || row.name).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const importedCategories = [...new Set(String(row.categories || row.category).split(/[|,]/).map((value) => value.trim()).filter(Boolean))];
        const payload = {
          sku: sku || undefined,
          slug,
          name: String(row.name).trim(),
          category: String(row.category || importedCategories[0]).trim(),
          categories: importedCategories,
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
      .findByIdAndUpdate(id, normalizeProductPayload(data), { returnDocument: 'after' })
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
