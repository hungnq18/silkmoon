import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly adminService: AdminService) {}
  @Post('track')
  track(@Body() data: { type: string; path: string; label?: string; entityId?: string }) {
    return this.adminService.trackEvent(data);
  }
}
