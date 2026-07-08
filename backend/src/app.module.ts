import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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

@Module({
  imports: [
    // Config module - loads .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
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
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule { }
