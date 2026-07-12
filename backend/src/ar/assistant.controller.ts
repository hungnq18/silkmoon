import { Body, Controller, Post, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ARService } from './ar.service';
import { SettingsService } from '../settings/settings.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly arService: ARService, private readonly settingsService: SettingsService) {}

  @Post('chat')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async chat(@Body('message') message: string) {
    const setting = await this.settingsService.findByKey('assistant_config');
    const config = setting?.value?.chatbot || {};
    if (config.enabled === false) throw new ServiceUnavailableException('Chatbot đang tạm tắt');
    return this.arService.chat(message, config.systemPrompt);
  }
}
