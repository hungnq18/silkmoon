import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    if (isObjectId) {
      return this.ordersService.findById(id);
    }
    return this.ordersService.findByOrderNumber(id);
  }
}
