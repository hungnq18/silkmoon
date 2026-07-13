import { Module } from '@nestjs/common';
import { ARController } from './ar.controller';
import { ARService } from './ar.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AiUsage, AiUsageSchema } from './ai-usage.schema';
import { SettingsModule } from '../settings/settings.module';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AiUsage.name, schema: AiUsageSchema }]), SettingsModule],
  controllers: [ARController, AssistantController],
  providers: [ARService],
  exports: [ARService],
})
export class ARModule {}
