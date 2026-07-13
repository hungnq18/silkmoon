import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createByAdmin(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart')
  getCart(@Request() req: any) {
    return this.usersService.getCart(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('cart')
  updateCart(@Request() req: any, @Body() cart: any[]) {
    return this.usersService.updateCart(req.user.userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateOwnProfile(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/avatar')
  uploadAvatar(@Request() req: any, @Body('image') image: string) {
    return this.usersService.uploadAvatar(req.user.userId, image);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changeOwnPassword(req.user.userId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
