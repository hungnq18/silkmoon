import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get('best-sellers')
  findBestSellers() {
    return this.productsService.findBestSellers();
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id/related')
  findRelated(@Param('id') id: string) {
    return this.productsService.findRelated(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Support both MongoDB _id and slug
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    if (isObjectId) {
      return this.productsService.findById(id);
    }
    return this.productsService.findBySlug(id);
  }
}
