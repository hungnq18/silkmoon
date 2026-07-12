import { Controller, Post, Body, Get, Patch, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { PromotionsService } from './promotions.service';
import { ValidatePromoDto } from './dto/validate-promo.dto';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('validate')
  validate(@Body() dto: ValidatePromoDto) {
    return this.promotionsService.validate(dto);
  }
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) @Get() findAll(@Query() query:any){return this.promotionsService.findAll(query)}
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) @Post() create(@Body()data:any){return this.promotionsService.create(data)}
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) @Patch(':id') update(@Param('id')id:string,@Body()data:any){return this.promotionsService.update(id,data)}
  @UseGuards(JwtAuthGuard,RolesGuard) @Roles(UserRole.ADMIN) @Delete(':id') remove(@Param('id')id:string){return this.promotionsService.remove(id)}
}
