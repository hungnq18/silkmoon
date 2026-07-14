import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from './schemas/order.schema';
import { PromotionsModule } from '../promotions/promotions.module';
import { ProductsModule } from '../products/products.module';
import { PayosService } from './payos.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PromotionsModule,
    ProductsModule,
    SettingsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PayosService],
})
export class OrdersModule {}
