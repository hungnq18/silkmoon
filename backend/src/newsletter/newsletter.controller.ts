import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendCampaignDto } from './dto/send-campaign.dto';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscriptionStatus } from './schemas/newsletter-subscription.schema';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @UseGuards(ThrottlerGuard)
  @Post('subscriptions')
  subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.newsletterService.subscribe(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('subscriptions')
  findAll(@Query() query: { page?: string; limit?: string; search?: string; status?: string; type?: string }) {
    return this.newsletterService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch('subscriptions/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: NewsletterSubscriptionStatus) {
    return this.newsletterService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('subscriptions/:id')
  remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('campaigns')
  sendCampaign(@Body() dto: SendCampaignDto) {
    return this.newsletterService.sendCampaign(dto);
  }
}
