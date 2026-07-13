import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import {
  Promotion,
  PromotionDocument,
} from '../promotions/schemas/promotion.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    private settingsService: SettingsService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedCategories();
    await this.seedProducts();
    await this.seedProductSizes();
    await this.seedPromotions();
    await this.seedReviews();
  }

  private parseSizeLabel(label = '') {
    const match = label.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*[x×]\s*(\d+(?:[.,]\d+)?))?/i);
    const numberValue = (value?: string) => value ? Number(value.replace(',', '.')) : undefined;
    const cleanLabel = label
      .replace(/\(\s*\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?)?\s*\)/i, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*-\s*|\s*-\s*$/g, '')
      .trim() || label.trim() || 'Size';
    return { label: cleanLabel, width: numberValue(match?.[1]), length: numberValue(match?.[2]), height: numberValue(match?.[3]) };
  }

  private sizeSlug(value: string) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  private async seedProductSizes() {
    const [products, currentSetting] = await Promise.all([
      this.productModel.find({ 'sizes.0': { $exists: true } }).select('_id name category sizes').lean(),
      this.settingsService.findByKey('product_sizes'),
    ]);
    const existing = Array.isArray(currentSetting?.value) ? currentSetting.value : [];
    const categories = new Map<string, any>();
    const ensureCategory = (name: string, source: any = {}) => {
      const key = name.trim().toLowerCase();
      if (!categories.has(key)) categories.set(key, {
        id: source.id || this.sizeSlug(name) || `size-category-${Date.now()}`,
        name: name.trim() || 'Danh mục size',
        productId: source.productId,
        productName: source.productName,
        productCategory: source.productCategory,
        isActive: source.isActive !== false,
        sizes: [],
      });
      return categories.get(key);
    };
    const addSize = (category: any, item: any) => {
      const parsed = this.parseSizeLabel(item.label);
      const normalized = { ...item, label: parsed.label, width: item.width ?? parsed.width, length: item.length ?? parsed.length, height: item.height ?? parsed.height, unit: item.unit || 'cm', isActive: item.isActive !== false };
      const key = [normalized.label, normalized.width || '', normalized.length || '', normalized.height || ''].join('|').toLowerCase();
      if (!category.sizes.some((size: any) => [size.label, size.width || '', size.length || '', size.height || ''].join('|').toLowerCase() === key)) category.sizes.push(normalized);
    };

    for (const entry of existing) {
      if (Array.isArray(entry.sizes)) {
        const category = ensureCategory(entry.name || entry.group || 'Danh mục size', entry);
        entry.sizes.forEach((size: any) => addSize(category, size));
      } else {
        const category = ensureCategory(entry.group || 'Khác', entry);
        addSize(category, entry);
      }
    }

    for (const product of products) {
      const category = ensureCategory(product.name, { id: `product-${product._id}`, productId: product._id.toString(), productName: product.name, productCategory: product.category });
      for (const size of product.sizes || []) {
        const parsed = this.parseSizeLabel(size.label);
        addSize(category, { ...size, id: this.sizeSlug(`${product.name}-${parsed.label}-${size.width ?? parsed.width ?? ''}-${size.length ?? parsed.length ?? ''}-${size.height ?? parsed.height ?? ''}`) });
      }
    }

    const result = [...categories.values()]
      .map((category) => ({ ...category, sizes: category.sizes.sort((a: any, b: any) => a.label.localeCompare(b.label, 'vi')) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    const sizeCount = result.reduce((total, category) => total + category.sizes.length, 0);
    await this.settingsService.upsert('product_sizes', { value: result, description: 'Danh mục kích thước; mỗi danh mục chứa các size riêng' });
    this.logger.log(`Seeded ${result.length} size categories with ${sizeCount} sizes from ${products.length} products`);
  }

  private async seedCategories() {
    const categories = [
      { name: 'Chăn Ga Gối', slug: 'chan-ga-goi', description: 'Êm ái từ cái chạm đầu tiên', isFeatured: true, coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi68zqwIVtcVZ9xD7d69hOdwmxPOd9F-qjyv64Qs8OaR5v2NEmeJ3KlmfQVRBiEn5mYfrzSBhPlXlWbCVLEWyFYndHW9Vd0l8LZE1oOy7wvBAv7u8A8U5GMRa_E5ge9RBIYonFsgXtFuVYLS84ytjRrfY7vUwj4R5wllGGcle5MSdrOZNIAXTPxdfeV6NZCB5eEx7Gf9rkLYWRZmHC1Vw39Eyno7Ah-gHx2dgET1FvFhUJmoP7y2ELlfns40xjvdh-tklHUH_Pf8Y' },
      { name: 'Chăn', slug: 'chan', description: 'Ôm trọn từng giấc êm', isFeatured: true, coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJbhsTCwF4xH7z1WLMrs5fPQu5V4ZbldfAuJIgsFgzDHlmSxs5dQeKRUQVt3VZCB9U8spht-Jbzg44VON0lkHD7kWAJogxqL13ZX8Qevx50d7U9in2bKbZcKiG1U6pOGKYCIh11lZgF6HMeCeRHe3xeIy6M38G9cuKv1w8ZCdUBOjrqyhDNy_Xgo4l1lnaa31iwwjHvwCyIavTvcTdohgfmrFw0vDOJio96HieIuSK-jqXpZojQQyisDWzYKy9N4afpwQLh4IgREY' },
      { name: 'Gối', slug: 'goi', description: 'Nâng niu làn da & mái tóc', isFeatured: true, coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGTC7hToMtDZJJIiLTwC-XhTakzhpN03VH61HzaCZRV8Ob4RmRu5-mbRCpSX2FnqacZH7R0SNG4Sx8zZYj7jHC_j8ovC3vsTTCDx2FNS4Lh2cOHYEsQKa8fAcxZ7P36eeVmg0K6PQWdGVmXlAZ3CoA19rWu_qOJGKrRAWJrjdU7FN87d3BvSVtiH6KkZUv_b8OXAifptf1u_m35-Xfo1hi0m0mxNcuMO8kuoR51mtGDDsUzLsdbGvNq2bIMtYO_9Ih0vDV85ibUlU' },
      { name: 'Đồ Ngủ', slug: 'do-ngu', description: 'Tự do trong từng chuyển động, nhẹ nhàng trong từng hơi thở.', isFeatured: true, coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-9vCtOEhZSSVUnVCp_QcJsw1QVKcajQqAak1kCppQWN4vJQyabIVs1eaRPn7wlyp81-NdfBJONHyOrIHIWVHAvHVCzPKkv7F-ybmJdueIIPnBeFFPB0gyVNT8vaCA44j_5YnSdkf1Ql2JLtww9HJa9_rplcdByntqvuiNcODKYT6qxHqMMSqiLN-_QszLwCb4mazPwmEOLej58npNchvkdXWErBWdgkflbHm99vq1eu9EyPtWufwpZ8ygZwsrrfDCbDnEzlh2fxM' },
      { name: 'Phụ Kiện', slug: 'phu-kien', description: 'Phụ kiện dành cho phòng ngủ và sản phẩm Silkmoon.', isFeatured: false, coverImage: '' },
    ];

    await this.categoryModel.bulkWrite(categories.map(category => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: { ...category, categoryType: 'product', isActive: true } },
        upsert: true,
      },
    })));
    this.logger.log(`Seeded ${categories.length} product categories`);
  }

  private async seedProducts() {
    const count = await this.productModel.countDocuments();
    if (count > 0) {
      await this.productModel.bulkWrite([
        { updateOne: { filter: { slug: 'bo-ga-giuong-organic-cloud' }, update: { $set: { originalPrice: 3100000 } } } },
        { updateOne: { filter: { slug: 'chan-chan-tencel-silk' }, update: { $set: { originalPrice: 4500000 } } } },
      ]);
      return;
    }

    this.logger.log('🌱 Seeding products...');

    // -------------------------------------------------------
    // Data lấy từ BestSellers.jsx + Shop.jsx + ProductInfoPanel.jsx
    // -------------------------------------------------------
    const products = [
      // ── BEST SELLERS ──────────────────────────────────────
      {
        name: 'Bộ Ga Giường Lụa Mulberry 22 Momme',
        slug: 'bo-ga-giuong-lua-mulberry-22-momme',
        description:
          'Được dệt từ 100% lụa Mulberry nguyên chất với chỉ số 22 Momme, bộ chăn ga gối này mang lại cảm giác mềm mại, thoáng mát vượt trội. Phù hợp với mọi loại da, kể cả da nhạy cảm. Thiết kế tối giản, thanh lịch phù hợp với mọi phong cách nội thất.',
        price: 4500000,
        embroideryPrice: 250000,
        material: 'Lụa Mulberry',
        momme: 22,
        images: [
          'https://images.unsplash.com/photo-1522771731478-44fb896da52d?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'queen', label: 'Queen (160x200)' },
          { id: 'king', label: 'King (180x200)' },
          { id: 'super-king', label: 'Super King (220x200)' },
        ],
        colors: [
          { id: 'champagne', hex: '#E5D5C5', label: 'Champagne Silk' },
          { id: 'white', hex: '#E8E8E5', label: 'White Silk' },
          { id: 'sage', hex: '#567E73', label: 'Sage Silk' },
          { id: 'slate', hex: '#334641', label: 'Slate Silk' },
        ],
        stock: 50,
        isBestSeller: true,
        category: 'Chăn Ga Gối',
        ratings: { average: 4.9, count: 124 },
      },
      {
        name: 'Bộ Chăn Ga Signature Cotton',
        slug: 'bo-chan-ga-signature-cotton',
        description:
          'Bộ chăn ga được làm từ sợi cotton tự nhiên 100%, thiết kế tối giản sang trọng. Chất liệu mềm mịn, thoáng khí, phù hợp với mọi thời tiết.',
        price: 2450000,
        embroideryPrice: 200000,
        material: 'Cotton',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'single', label: 'Single (120x200)' },
          { id: 'queen', label: 'Queen (160x200)' },
          { id: 'king', label: 'King (180x200)' },
        ],
        colors: [
          { id: 'slate', hex: '#334641', label: 'Slate Deep' },
          { id: 'sage', hex: '#567E73', label: 'Sage Haze' },
          { id: 'sand', hex: '#D8B59F', label: 'Sand Silk' },
        ],
        stock: 80,
        isBestSeller: true,
        category: 'Chăn Ga Gối',
        ratings: { average: 4.7, count: 89 },
      },
      {
        name: 'Vỏ Gối Tơ Tằm 22 Momme',
        slug: 'vo-goi-to-tam-22-momme',
        description:
          'Vỏ gối làm từ 100% tơ tằm 22 Momme, cực kỳ mềm mịn và mát. Giúp bảo vệ da mặt và tóc khi ngủ. Combo 2 chiếc.',
        price: 850000,
        embroideryPrice: 150000,
        material: 'Lụa Mulberry',
        momme: 22,
        images: [
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'standard', label: 'Standard (50x70) - Combo 2' },
          { id: 'king', label: 'King (50x90) - Combo 2' },
        ],
        colors: [
          { id: 'linen', hex: '#FCFCF9', label: 'Linen White' },
          { id: 'cream', hex: '#E5D3C2', label: 'Cream' },
        ],
        stock: 120,
        isBestSeller: true,
        category: 'Gối',
        ratings: { average: 4.8, count: 67 },
      },
      {
        name: 'Bộ Đồ Ngủ Bamboo Cloud',
        slug: 'bo-do-ngu-bamboo-cloud',
        description:
          'Bộ đồ ngủ làm từ sợi tre tự nhiên (Bamboo), siêu nhẹ và thoáng mát. Kháng khuẩn tự nhiên, thấm hút mồ hôi tốt. Phù hợp với khí hậu nhiệt đới Việt Nam.',
        price: 1250000,
        embroideryPrice: 0,
        material: 'Bamboo',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'S', label: 'S' },
          { id: 'M', label: 'M' },
          { id: 'L', label: 'L' },
          { id: 'XL', label: 'XL' },
        ],
        colors: [
          { id: 'sage', hex: '#567E73', label: 'Sage Haze' },
          { id: 'slate', hex: '#334641', label: 'Slate Deep' },
        ],
        stock: 60,
        isBestSeller: true,
        category: 'Đồ Ngủ',
        ratings: { average: 4.6, count: 43 },
      },
      {
        name: 'Chăn Chần Bông Cao Cấp',
        slug: 'chan-chan-bong-cao-cap',
        description:
          'Chăn chần bông cao cấp với lớp bông gòn tự nhiên dày dặn, giữ ấm hoàn hảo trong mùa lạnh. Đường chần tinh xảo, không bị xê dịch.',
        price: 3150000,
        embroideryPrice: 0,
        material: 'Cotton',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'queen', label: 'Queen (200x220)' },
          { id: 'king', label: 'King (220x240)' },
        ],
        colors: [
          { id: 'bone', hex: '#F2F1ED', label: 'Bone' },
        ],
        stock: 35,
        isBestSeller: true,
        category: 'Chăn',
        ratings: { average: 4.9, count: 201 },
      },

      // ── SHOP PAGE PRODUCTS ────────────────────────────────
      {
        name: 'Bộ Ga Giường Organic Cloud',
        slug: 'bo-ga-giuong-organic-cloud',
        description:
          'Chất liệu 100% Cotton Hữu Cơ GOTS certified. Siêu mềm mại, không chứa hóa chất độc hại, an toàn cho cả gia đình và trẻ nhỏ. Ra mắt bộ sưu tập mới nhất 2024.',
        price: 2450000,
        originalPrice: 3100000,
        embroideryPrice: 200000,
        material: 'Cotton',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'single', label: 'Single (120x200)' },
          { id: 'queen', label: 'Queen (160x200)' },
          { id: 'king', label: 'King (180x200)' },
        ],
        colors: [
          { id: 'beige', hex: '#E8DCC8', label: 'Beige' },
          { id: 'white', hex: '#FFFFFF', label: 'White' },
        ],
        stock: 45,
        isBestSeller: false,
        category: 'Chăn Ga Gối',
        tag: 'NEW',
        ratings: { average: 4.7, count: 32 },
      },
      {
        name: 'Gối Ngủ Công Thái Học Serene',
        slug: 'goi-ngu-cong-thai-hoc-serene',
        description:
          'Gối Memory Foam than hoạt tính, thiết kế theo công thái học hỗ trợ cột sống cổ. Lõi foam thông minh tự điều chỉnh theo tư thế ngủ. Phù hợp cả nằm ngửa và nằm nghiêng.',
        price: 1150000,
        embroideryPrice: 0,
        material: 'Cotton',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1522771731478-44fb896da52d?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'standard', label: 'Standard (50x70)' },
          { id: 'queen', label: 'Queen (50x90)' },
        ],
        colors: [
          { id: 'slate', hex: '#334641', label: 'Slate' },
          { id: 'white', hex: '#F8F8F8', label: 'White' },
        ],
        stock: 70,
        isBestSeller: false,
        category: 'Gối',
        ratings: { average: 4.5, count: 58 },
      },
      {
        name: 'Chăn Chần Tencel Silk',
        slug: 'chan-chan-tencel-silk',
        description:
          'Chăn Tencel kết hợp Silk, siêu mát lạnh và mềm mịn như nhung. Phù hợp sử dụng quanh năm, đặc biệt lý tưởng cho mùa hè nhiệt đới.',
        price: 3890000,
        originalPrice: 4500000,
        embroideryPrice: 0,
        material: 'Tencel',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'queen', label: 'Queen (200x220)' },
          { id: 'king', label: 'King (220x240)' },
        ],
        colors: [
          { id: 'sand', hex: '#D8B59F', label: 'Sand' },
          { id: 'sage', hex: '#567E73', label: 'Sage' },
        ],
        stock: 25,
        isBestSeller: false,
        category: 'Chăn',
        tag: '-15%',
        ratings: { average: 4.8, count: 44 },
      },
      {
        name: 'Bộ Sưu Tập Minimalist',
        slug: 'bo-suu-tap-minimalist',
        description:
          'Combo đầy đủ 5 món: Chăn + Ga trải + 2 Vỏ gối + 1 Gối ôm. Thiết kế tối giản, tông màu trung tính sang trọng. Phù hợp làm quà tặng cao cấp.',
        price: 5200000,
        embroideryPrice: 300000,
        material: 'Linen',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'queen', label: 'Queen Set' },
          { id: 'king', label: 'King Set' },
        ],
        colors: [
          { id: 'slate', hex: '#334641', label: 'Slate' },
          { id: 'bone', hex: '#F2F1ED', label: 'Bone' },
        ],
        stock: 20,
        isBestSeller: false,
        category: 'Chăn Ga Gối',
        ratings: { average: 4.9, count: 15 },
      },
      {
        name: 'Topper Nệm Memory Cloud',
        slug: 'topper-nem-memory-cloud',
        description:
          'Topper nệm Memory Foam cao cấp dày 5cm, giúp cải thiện độ êm ái của nệm hiện có. Chất liệu thoáng khí, phân bổ trọng lượng đều. Dễ dàng vệ sinh.',
        price: 2100000,
        embroideryPrice: 0,
        material: 'Cotton',
        momme: 0,
        images: [
          'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&q=80&w=800',
        ],
        sizes: [
          { id: 'single', label: 'Single (100x200)' },
          { id: 'queen', label: 'Queen (160x200)' },
          { id: 'king', label: 'King (180x200)' },
        ],
        colors: [
          { id: 'platinum', hex: '#E0E0E0', label: 'Platinum' },
          { id: 'white', hex: '#FFFFFF', label: 'White' },
        ],
        stock: 30,
        isBestSeller: false,
        category: 'Phụ Kiện',
        ratings: { average: 4.6, count: 27 },
      },
    ];

    await this.productModel.insertMany(products);
    this.logger.log(`✅ Seeded ${products.length} products`);
  }

  private async seedPromotions() {
    const count = await this.promotionModel.countDocuments();
    if (count > 0) return;

    this.logger.log('🌱 Seeding promotions...');

    const promotions = [
      {
        code: 'SILKMOON10',
        discountPercent: 10,
        isActive: true,
        expiresAt: new Date('2027-12-31'),
        maxUses: 1000,
        usedCount: 0,
      },
      {
        code: 'WELCOME15',
        discountPercent: 15,
        isActive: true,
        expiresAt: new Date('2026-12-31'),
        maxUses: 500,
        usedCount: 0,
      },
      {
        code: 'SUMMER20',
        discountPercent: 20,
        isActive: true,
        expiresAt: new Date('2026-08-31'),
        maxUses: 200,
        usedCount: 0,
      },
    ];

    await this.promotionModel.insertMany(promotions);
    this.logger.log(`✅ Seeded ${promotions.length} promotions`);
  }

  private async seedReviews() {
    const count = await this.reviewModel.countDocuments();
    if (count > 0) return;

    // Lấy product IDs
    const products = await this.productModel.find().select('_id').lean();
    if (products.length === 0) return;

    this.logger.log('🌱 Seeding reviews...');

    const p = (i: number) =>
      products[i % products.length]._id.toString();

    // Tổng hợp từ CustomerFeedback.jsx + ProductReviews.jsx
    const reviews = [
      // ── Từ CustomerFeedback.jsx ──
      {
        productId: p(0),
        authorName: 'Mai Anh',
        rating: 5,
        comment:
          'Bộ chăn ga lụa tơ tằm của silkMoon thực sự làm thay đổi giấc ngủ của mình. Vải cực kỳ mềm mại, mát rượi vào mùa hè và giữ ấm tốt vào mùa đông. Chắc chắn sẽ ủng hộ thêm!',
        isVerified: true,
      },
      {
        productId: p(1),
        authorName: 'Hoàng Hải',
        rating: 5,
        comment:
          'Mình rất khó ngủ do hay bị dị ứng bụi vải. Từ ngày đổi sang dùng ga giường của silkMoon thì tình trạng giảm hẳn, sáng dậy thấy tinh thần vô cùng sảng khoái.',
        isVerified: true,
      },
      {
        productId: p(2),
        authorName: 'Lan Phương',
        rating: 5,
        comment:
          'Thích nhất là thiết kế tối giản, tông màu trơn cực kỳ sang trọng và dễ phối với nội thất phòng ngủ. Giao hàng nhanh và đóng gói hộp quà tặng rất chỉn chu.',
        isVerified: true,
      },
      // ── Từ ProductReviews.jsx ──
      {
        productId: p(0),
        authorName: 'taixexe@',
        rating: 5,
        comment:
          'nếu thích cảm giác nằm chắc chắn thì nên cân nhắc. Chất lượng vải tốt, đúng như mô tả.',
        isVerified: false,
      },
      {
        productId: p(0),
        authorName: 'ngochai.nguyen',
        rating: 5,
        comment:
          'Chất liệu rất xịn, nằm vô cùng mát và mượt mà. Giấc ngủ được cải thiện rõ rệt từ ngày dùng ga lụa này.',
        isVerified: true,
      },
      // ── Thêm reviews cho các sản phẩm khác ──
      {
        productId: p(3),
        authorName: 'Nguyễn Thị Lan',
        rating: 5,
        comment:
          'Bộ đồ ngủ Bamboo mát lắm, mùa hè mặc thoải mái không bị dính người. Chất vải mềm mịn, giặt xong vẫn không bị nhăn.',
        isVerified: true,
      },
      {
        productId: p(4),
        authorName: 'Trần Văn Hùng',
        rating: 5,
        comment:
          'Chăn chần bông cao cấp thật sự ấm mà nhẹ. Mùa đông năm nay không cần lo nữa. Đường chần đẹp, không bị xô bông.',
        isVerified: true,
      },
      {
        productId: p(2),
        authorName: 'Phạm Minh Châu',
        rating: 4,
        comment:
          'Vỏ gối tơ tằm rất mịn, da mặt không bị hằn sau khi ngủ. Tuy nhiên giá hơi cao, nhưng chất lượng xứng đáng.',
        isVerified: false,
      },
      {
        productId: p(7),
        authorName: 'Lê Thị Mai',
        rating: 5,
        comment:
          'Chăn Tencel Silk mát hơn mình nghĩ. Mùa hè ở Sài Gòn mà đắp vẫn ok, không nóng bức. Rất hài lòng với mua hàng lần này.',
        isVerified: true,
      },
      {
        productId: p(5),
        authorName: 'Hoàng Đức Anh',
        rating: 4,
        comment:
          'Bộ ga Organic Cloud chất lượng tốt, vải mềm và an toàn cho bé nhà mình. Màu sắc đẹp đúng như ảnh. Sẽ mua thêm.',
        isVerified: true,
      },
    ];

    await this.reviewModel.insertMany(reviews);
    this.logger.log(`✅ Seeded ${reviews.length} reviews`);
  }
}
