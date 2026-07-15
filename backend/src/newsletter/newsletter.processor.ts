import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendCampaignDto } from './dto/send-campaign.dto';
import {
  NewsletterContactType,
  NewsletterSubscription,
  NewsletterSubscriptionDocument,
  NewsletterSubscriptionStatus,
} from './schemas/newsletter-subscription.schema';

@Processor('newsletter')
export class NewsletterProcessor {
  private readonly logger = new Logger(NewsletterProcessor.name);

  constructor(
    @InjectModel(NewsletterSubscription.name)
    private readonly subscriptionModel: Model<NewsletterSubscriptionDocument>,
    private readonly config: ConfigService,
  ) {}

  @Process('send-campaign-batch')
  async handleSendCampaignBatch(job: Job<{ subject: string; message: string; recipients: Array<{ _id: string; contact: string }> }>) {
    this.logger.log(`Start processing campaign batch send for job ${job.id}`);
    const { subject, message, recipients } = job.data;
    
    try {
      const apiKey = this.config.get<string>('MAILERSEND_API_KEY');
      if (!apiKey) throw new Error('MAILERSEND_API_KEY chưa được cấu hình.');
      
      const fromStr = this.config.get<string>('MAIL_FROM') || 'Silkmoon <no-reply@silkmoon.vn>';
      const match = fromStr.match(/^(.*?)\s*<(.+)>$/);
      const from = match ? { name: match[1].trim(), email: match[2].trim() } : { email: fromStr.trim(), name: 'Silkmoon' };

      const safeMessage = message.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character).replace(/\n/g, '<br/>');

      const batch = recipients.map((recipient) => ({
        from,
        to: [{ email: recipient.contact }],
        subject,
        html: `<div style="font-family:Arial,sans-serif;color:#1C2C58;line-height:1.7"><h2>SILKMOON</h2><p>${safeMessage}</p><p style="font-size:12px;color:#64748b">Anh/chị nhận email này vì đã đăng ký nhận ưu đãi tại silkmoon.vn.</p></div>`,
      }));
      
      await this.callMailerSend('/bulk-email', batch);
      
      await this.subscriptionModel.updateMany(
        { _id: { $in: recipients.map((r) => r._id) } },
        { lastEmailSentAt: new Date() },
      ).exec();
      
      this.logger.log(`Campaign batch send completed. Sent ${recipients.length} emails.`);
      return { sent: recipients.length };
    } catch (error) {
      this.logger.error(`Error sending campaign batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async callMailerSend(path: string, body: unknown) {
    const response = await fetch(`https://api.mailersend.com/v1${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.get<string>('MAILERSEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new ServiceUnavailableException(`MailerSend trả về ${response.status}: ${message}`);
    }
    return { success: true };
  }
}
