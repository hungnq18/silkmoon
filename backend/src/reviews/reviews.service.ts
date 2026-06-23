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
}
