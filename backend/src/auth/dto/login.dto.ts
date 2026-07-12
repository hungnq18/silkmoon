import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Vui lòng nhập email.' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu.' })
  password: string;
}
