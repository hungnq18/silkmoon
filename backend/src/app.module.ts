import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SeedService } from './seed/seed.service';
import { Product, ProductSchema } from './products/schemas/product.schema';
import { Promotion, PromotionSchema } from './promotions/schemas/promotion.schema';
import { Review, ReviewSchema } from './reviews/schemas/review.schema';
import { Category, CategorySchema } from './categories/schemas/category.schema';
import { ARModule } from './ar/ar.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { BlogModule } from './blog/blog.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { join } from 'path';

@Module({
  imports: [
    // Config module - loads .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
    }),

    // Rate Limiting globally (default to 10 requests per 10 seconds per IP, can be overridden)
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 10,
    }]),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Bull Redis Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          // If using Upstash or other Redis Cloud, TLS might be required if URL starts with rediss://
          const isTls = redisUrl.startsWith('rediss://');
          return { 
            redis: redisUrl,
            // (Optional) config for self-signed or specific cloud services if needed
          };
        }
        return {
          redis: {
            host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
      },
      inject: [ConfigService],
    }),

    // Register schemas for SeedService
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Category.name, schema: CategorySchema },
    ]),

    // Feature modules
    ProductsModule,
    OrdersModule,
    PromotionsModule,
    ReviewsModule,
    ARModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    CategoriesModule,
    AdminModule,
    BlogModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule { }
