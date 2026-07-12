import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async findByProduct(productId: string) {
    return this.reviewModel
      .find({ productId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(dto: CreateReviewDto) {
    const review = await this.reviewModel.create(dto);
    return review;
  }
  async findAll(query: any = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, parseInt(query.limit || '10', 10));
    const filter: any = {};
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };
    if (query.isVerified !== undefined) filter.isVerified = query.isVerified === 'true';
    const [items, total] = await Promise.all([this.reviewModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), this.reviewModel.countDocuments(filter)]);
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
  async update(id: string, data: { isVerified?: boolean }) { return this.reviewModel.findByIdAndUpdate(id, data, { returnDocument: 'after' }).lean(); }
  async remove(id: string) { return this.reviewModel.findByIdAndDelete(id).lean(); }
}
