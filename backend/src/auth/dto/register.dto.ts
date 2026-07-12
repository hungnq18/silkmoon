import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Vui lòng nhập email.' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu.' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
  password: string;

  @IsString({ message: 'Họ và tên không hợp lệ.' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên.' })
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại không hợp lệ.' })
  @Matches(/^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không đúng định dạng.' })
  phone?: string;
}
