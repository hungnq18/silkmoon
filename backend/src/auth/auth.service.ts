import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes, randomInt } from 'crypto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser && existingUser.emailVerified !== false) {
      throw new BadRequestException('Email này đã được sử dụng.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);
    const otp = randomInt(100000, 1000000).toString();
    const otpHash = this.hashOtp(email, otp);
    const user = await this.usersService.savePendingRegistration(existingUser?._id?.toString(), {
      email,
      passwordHash,
      fullName: registerDto.fullName.trim(),
      phone: registerDto.phone?.trim(),
    }, otpHash, new Date(Date.now() + 10 * 60 * 1000));

    await this.mailService.sendRegistrationOtp(user.email, user.fullName, otp);
    return {
      requiresVerification: true,
      email: user.email,
      message: 'Mã OTP đã được gửi tới email của bạn.',
    };
  }

  async verifyRegistration(emailInput: string, otp: string) {
    const email = String(emailInput || '').trim().toLowerCase();
    const user = await this.usersService.findPendingVerification(email);
    if (!user) throw new BadRequestException('Không tìm thấy đăng ký đang chờ xác minh.');
    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã.');
    }
    if ((user.emailVerificationAttempts || 0) >= 5) {
      throw new BadRequestException('Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu gửi lại mã.');
    }
    const otpHash = this.hashOtp(email, otp);
    if (user.emailVerificationOtpHash !== otpHash) {
      await this.usersService.incrementVerificationAttempts(user._id.toString());
      throw new BadRequestException('Mã OTP không chính xác.');
    }
    const verified = await this.usersService.confirmEmailVerification(user._id.toString(), otpHash);
    if (!verified) throw new BadRequestException('Mã OTP không hợp lệ hoặc đã hết hạn.');
    return this.authenticationResponse(verified);
  }

  async resendRegistrationOtp(emailInput: string) {
    const email = String(emailInput || '').trim().toLowerCase();
    const user = await this.usersService.findPendingVerification(email);
    if (!user) throw new BadRequestException('Không tìm thấy đăng ký đang chờ xác minh.');
    const lastSentAt = user.emailVerificationLastSentAt?.getTime() || 0;
    const waitMs = 60_000 - (Date.now() - lastSentAt);
    if (waitMs > 0) {
      throw new BadRequestException(`Vui lòng chờ ${Math.ceil(waitMs / 1000)} giây trước khi gửi lại mã.`);
    }
    const otp = randomInt(100000, 1000000).toString();
    await this.usersService.updateVerificationOtp(user._id.toString(), this.hashOtp(email, otp), new Date(Date.now() + 10 * 60 * 1000));
    await this.mailService.sendRegistrationOtp(user.email, user.fullName, otp);
    return { message: 'Một mã OTP mới đã được gửi tới email của bạn.' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.isActive || user.emailVerified === false) {
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
    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      address: user.address,
      addressDetail: user.addressDetail,
      provinceCode: user.provinceCode,
      provinceName: user.provinceName,
      wardCode: user.wardCode,
      wardName: user.wardName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(String(email || '').trim().toLowerCase());
    if (user) {
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      await this.usersService.setResetPasswordToken(user._id.toString(), tokenHash, new Date(Date.now() + 30 * 60 * 1000));
      const frontendUrl = (this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173').replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/account?resetToken=${token}`;
      try {
        await this.mailService.sendPasswordReset(user.email, user.fullName, resetUrl);
      } catch (error) {
        this.logger.error(`Không thể gửi email đặt lại mật khẩu qua SMTP: ${error instanceof Error ? error.message : 'unknown'}`);
      }
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

  private hashOtp(email: string, otp: string) {
    return createHash('sha256').update(`${email}:${otp}`).digest('hex');
  }

  private authenticationResponse(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user._id, email: user.email, fullName: user.fullName, role: user.role },
    };
  }
}
