import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendCampaignDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  recipientIds: string[];
}
