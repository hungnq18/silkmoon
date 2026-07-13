import { IsInt, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
  @MaxLength(100)
  fullName: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^(0|\+84)\d{9,10}$/, { message: 'Số điện thoại không đúng định dạng.' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressDetail?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  provinceCode?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provinceName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  wardCode?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  wardName?: string;
}
