import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập email hoặc số điện thoại.' })
  @MaxLength(160)
  contact: string;
}
