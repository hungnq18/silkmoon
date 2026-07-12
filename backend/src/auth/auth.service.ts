import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      phone: registerDto.phone,
    });

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu chưa chính xác.');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu chưa chính xác.');
    }

    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async profile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return { id: user._id, email: user.email, fullName: user.fullName, phone: user.phone, role: user.role };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(String(email || '').trim().toLowerCase());
    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      await this.usersService.setResetPasswordToken(user._id.toString(), tokenHash, new Date(Date.now() + 30 * 60 * 1000));
      const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/account?resetToken=${token}`;
      const apiKey = this.configService.get<string>('RESEND_API_KEY');
      if (apiKey) {
        try {
          await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: this.configService.get<string>('MAIL_FROM') || 'Silkmoon <no-reply@silkmoon.online>', to: [user.email], subject: 'Đặt lại mật khẩu Silkmoon', html: `<p>Xin chào ${user.fullName},</p><p>Nhấn vào liên kết dưới đây để đặt lại mật khẩu. Liên kết có hiệu lực trong 30 phút.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Nếu anh/chị không yêu cầu, vui lòng bỏ qua email này.</p>` }) });
        } catch (error) { this.logger.error(`Không thể gửi email đặt lại mật khẩu: ${error instanceof Error ? error.message : 'unknown'}`); }
      } else this.logger.warn('RESEND_API_KEY chưa được cấu hình; email đặt lại mật khẩu chưa được gửi.');
    }
    return { message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi trong ít phút.' };
  }

  async resetForgottenPassword(token: string, password: string) {
    if (!token || !password || password.length < 6) throw new BadRequestException('Thông tin đặt lại mật khẩu không hợp lệ.');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const updated = await this.usersService.resetPassword(tokenHash, await bcrypt.hash(password, 10));
    if (!updated) throw new BadRequestException('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    return { message: 'Mật khẩu đã được cập nhật.' };
  }
}
