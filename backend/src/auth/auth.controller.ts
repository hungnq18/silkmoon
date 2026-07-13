import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyRegistrationDto } from './dto/verify-registration.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify-registration')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  verifyRegistration(@Body() dto: VerifyRegistrationDto) {
    return this.authService.verifyRegistration(dto.email, dto.otp);
  }

  @HttpCode(HttpStatus.OK)
  @Post('resend-registration-otp')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  resendRegistrationOtp(@Body('email') email: string) {
    return this.authService.resendRegistrationOtp(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() request: any) {
    return this.authService.profile(request.user.userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetForgottenPassword(body.token, body.password);
  }
}
