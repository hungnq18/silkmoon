import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
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
    const recipients = await this.subscriptionModel.find(recipientFilter).select('contact').lean().exec();
    if (!recipients.length) throw new BadRequestException('Chưa có email đang hoạt động để gửi.');

    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) throw new ServiceUnavailableException('RESEND_API_KEY chưa được cấu hình.');
    const from = this.config.get<string>('MAIL_FROM') || 'Silkmoon <no-reply@silkmoon.vn>';
    const safeMessage = dto.message.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character).replace(/\n/g, '<br/>');
    let sent = 0;

    for (let index = 0; index < recipients.length; index += 100) {
      const batch = recipients.slice(index, index + 100).map((recipient) => ({
        from,
        to: [recipient.contact],
        subject: dto.subject,
        html: `<div style="font-family:Arial,sans-serif;color:#1C2C58;line-height:1.7"><h2>SILKMOON</h2><p>${safeMessage}</p><p style="font-size:12px;color:#64748b">Anh/chị nhận email này vì đã đăng ký nhận ưu đãi tại silkmoon.vn.</p></div>`,
      }));
      await this.callResend('/emails/batch', batch);
      sent += batch.length;
    }

    await this.subscriptionModel.updateMany(
      { _id: { $in: recipients.map((recipient) => recipient._id) } },
      { lastEmailSentAt: new Date() },
    ).exec();
    return { sent };
  }

  private async sendWelcomeEmail(to: string) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) return;
    const from = this.config.get<string>('MAIL_FROM') || 'Silkmoon <no-reply@silkmoon.vn>';
    await this.callResend('/emails', {
      from,
      to: [to],
      subject: 'Đăng ký nhận ưu đãi Silkmoon thành công',
      html: '<div style="font-family:Arial,sans-serif;color:#1C2C58;line-height:1.7"><h2>Cảm ơn anh/chị đã đăng ký</h2><p>Silkmoon sẽ gửi những câu chuyện giấc ngủ và chương trình ưu đãi mới nhất tới email này.</p><p><a href="https://silkmoon.vn" style="color:#1C2C58">Khám phá Silkmoon</a></p></div>',
    });
  }

  private async callResend(path: string, body: unknown) {
    const response = await fetch(`https://api.resend.com${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.get<string>('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new ServiceUnavailableException(`Resend trả về ${response.status}: ${message}`);
    }
    return response.json();
  }
}
