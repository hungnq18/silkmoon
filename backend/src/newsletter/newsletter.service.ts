import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Model } from 'mongoose';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SendCampaignDto } from './dto/send-campaign.dto';
import {
  NewsletterContactType,
  NewsletterSubscription,
  NewsletterSubscriptionDocument,
  NewsletterSubscriptionStatus,
} from './schemas/newsletter-subscription.schema';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectModel(NewsletterSubscription.name)
    private readonly subscriptionModel: Model<NewsletterSubscriptionDocument>,
    private readonly config: ConfigService,
    @InjectQueue('newsletter') private readonly newsletterQueue: Queue,
  ) {}

  private normalizeContact(raw: string) {
    const value = String(raw || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return { contact: value.toLowerCase(), type: NewsletterContactType.EMAIL };
    }
    const phone = value.replace(/[\s.-]/g, '');
    if (/^(0|\+84)\d{9,10}$/.test(phone)) {
      return { contact: phone, type: NewsletterContactType.PHONE };
    }
    throw new BadRequestException('Email hoặc số điện thoại không đúng định dạng.');
  }

  async subscribe(dto: CreateSubscriptionDto) {
    const normalized = this.normalizeContact(dto.contact);
    const existing = await this.subscriptionModel.findOne({ contact: normalized.contact }).exec();
    if (existing?.status === NewsletterSubscriptionStatus.ACTIVE) {
      return { message: 'Thông tin này đã được đăng ký nhận ưu đãi.', alreadySubscribed: true };
    }

    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { contact: normalized.contact },
      {
        $set: { type: normalized.type, status: NewsletterSubscriptionStatus.ACTIVE, source: 'footer' },
        $setOnInsert: { contact: normalized.contact },
      },
      { upsert: true, returnDocument: 'after' },
    ).exec();

    if (normalized.type === NewsletterContactType.EMAIL) {
      this.sendWelcomeEmail(normalized.contact).catch((error) => {
        this.logger.error(`Không thể gửi email xác nhận newsletter: ${error instanceof Error ? error.message : 'unknown'}`);
      });
    }

    return { message: 'Đăng ký nhận ưu đãi thành công.', subscription };
  }

  async findAll(query: { page?: string; limit?: string; search?: string; status?: string; type?: string }) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.contact = { $regex: escaped, $options: 'i' };
    }
    const [items, total] = await Promise.all([
      this.subscriptionModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.subscriptionModel.countDocuments(filter),
    ]);
    return { items, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) };
  }

  async updateStatus(id: string, status: NewsletterSubscriptionStatus) {
    if (!Object.values(NewsletterSubscriptionStatus).includes(status)) {
      throw new BadRequestException('Trạng thái đăng ký không hợp lệ.');
    }
    const subscription = await this.subscriptionModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' }).exec();
    if (!subscription) throw new NotFoundException('Không tìm thấy đăng ký.');
    return subscription;
  }

  async remove(id: string) {
    const subscription = await this.subscriptionModel.findByIdAndDelete(id).exec();
    if (!subscription) throw new NotFoundException('Không tìm thấy đăng ký.');
    return { deleted: true };
  }

  async sendCampaign(dto: SendCampaignDto) {
    const recipientFilter: Record<string, unknown> = {
      type: NewsletterContactType.EMAIL,
      status: NewsletterSubscriptionStatus.ACTIVE,
    };
    if (dto.recipientIds?.length) recipientFilter._id = { $in: dto.recipientIds };
    
    const recipients = await this.subscriptionModel.find(recipientFilter).select('_id contact').lean().exec();
    if (!recipients.length) throw new BadRequestException('Chưa có email đang hoạt động để gửi.');

    // Chia thành các batch tối đa 100 email và đẩy từng batch vào Queue (tránh rate limit)
    let batches = 0;
    for (let index = 0; index < recipients.length; index += 100) {
      const batchRecipients = recipients.slice(index, index + 100);
      await this.newsletterQueue.add('send-campaign-batch', {
        subject: dto.subject,
        message: dto.message,
        recipients: batchRecipients,
      }, {
        attempts: 3, // Thử lại tối đa 3 lần nếu có lỗi
        backoff: 65000, // Chờ 65 giây trước khi thử lại
      });
      batches++;
    }

    return { 
      message: `Đã đưa chiến dịch vào hàng đợi xử lý (${batches} batch)`, 
      sent: recipients.length 
    };
  }

  private async sendWelcomeEmail(to: string) {
    const apiKey = this.config.get<string>('MAILERSEND_API_KEY');
    if (!apiKey) return;
    const fromStr = this.config.get<string>('MAIL_FROM') || 'Silkmoon <no-reply@silkmoon.vn>';
    const match = fromStr.match(/^(.*?)\s*<(.+)>$/);
    const from = match ? { name: match[1].trim(), email: match[2].trim() } : { email: fromStr.trim(), name: 'Silkmoon' };

    await this.callMailerSend('/email', {
      from,
      to: [{ email: to }],
      subject: 'Đăng ký nhận ưu đãi Silkmoon thành công',
      html: '<div style="font-family:Arial,sans-serif;color:#1C2C58;line-height:1.7"><h2>Cảm ơn anh/chị đã đăng ký</h2><p>Silkmoon sẽ gửi những câu chuyện giấc ngủ và chương trình ưu đãi mới nhất tới email này.</p><p><a href="https://silkmoon.vn" style="color:#1C2C58">Khám phá Silkmoon</a></p></div>',
    });
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
