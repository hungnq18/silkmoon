import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
  @Get('finance') finance(@Query() query: any){return this.adminService.getFinanceReport(query)}
  @Get('analytics') analytics(){return this.adminService.getAnalyticsStatus()}
  @Get('analytics/report') analyticsReport(){return this.adminService.getAnalyticsReport()}
  @Get('ai-usage') aiUsage(){return this.adminService.getAiUsageReport()}
}
