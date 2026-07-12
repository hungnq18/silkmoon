import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEvent, AnalyticsEventSchema } from './analytics-event.schema';
import { AiUsage, AiUsageSchema } from '../ar/ai-usage.schema';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    SettingsModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: AnalyticsEvent.name, schema: AnalyticsEventSchema },
      { name: AiUsage.name, schema: AiUsageSchema }
    ])
  ],
  controllers: [AdminController, AnalyticsController],
  providers: [AdminService],
})
export class AdminModule { }
