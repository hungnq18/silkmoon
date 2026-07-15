import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterProcessor } from './newsletter.processor';
import { NewsletterSubscription, NewsletterSubscriptionSchema } from './schemas/newsletter-subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: NewsletterSubscription.name, schema: NewsletterSubscriptionSchema }]),
    BullModule.registerQueue({ 
      name: 'newsletter',
      limiter: {
        max: 1,
        duration: 61000, // 1 job per 61 seconds (để an toàn tránh Rate Limit 1 req/min)
      }
    }),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterProcessor],
})
export class NewsletterModule {}
