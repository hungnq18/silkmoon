import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class VerifyRegistrationDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mã OTP.' })
  @Matches(/^\d{6}$/, { message: 'Mã OTP phải gồm 6 chữ số.' })
  otp: string;
}

