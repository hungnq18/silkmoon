import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePromoDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
