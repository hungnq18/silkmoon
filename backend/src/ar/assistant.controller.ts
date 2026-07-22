import { Body, Controller, Post, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ARService } from './ar.service';
import { SettingsService } from '../settings/settings.service';
import { ProductsService } from '../products/products.service';

@Controller('assistant')
export class AssistantController {
  constructor(
    private readonly arService: ARService,
    private readonly settingsService: SettingsService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('chat')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async chat(@Body('message') message: string, @Body('history') history: Array<{ role: string; text: string }> = []) {
    const [setting, products] = await Promise.all([
      this.settingsService.findByKey('assistant_config'),
      this.productsService.getChatbotCatalog(),
    ]);
    const config = setting?.value?.chatbot || {};
    if (config.enabled === false) throw new ServiceUnavailableException('Chatbot đang tạm tắt');
    return this.arService.chat(message, config.systemPrompt, Array.isArray(history) ? history : [], products);
  }
}
