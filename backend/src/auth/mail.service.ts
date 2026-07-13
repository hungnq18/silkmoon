import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: Transporter;

  constructor(private readonly config: ConfigService) {}

  private getTransporter() {
    if (this.transporter) return this.transporter;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!user || !pass) {
      throw new ServiceUnavailableException('Dịch vụ gửi email chưa được cấu hình.');
    }
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port,
      secure: this.config.get<string>('SMTP_SECURE') === 'true' || port === 465,
      auth: { user, pass },
    });
    return this.transporter;
  }

  async sendRegistrationOtp(to: string, fullName: string, otp: string) {
    const from = this.config.get<string>('SMTP_FROM') || `Silkmoon <${this.config.get<string>('SMTP_USER')}>`;
    const name = this.escapeHtml(fullName);
    await this.getTransporter().sendMail({
      from,
      to,
      subject: `${otp} là mã xác minh tài khoản Silkmoon`,
      text: `Xin chào ${fullName},\n\nMã xác minh tài khoản Silkmoon của bạn là: ${otp}\nMã có hiệu lực trong 10 phút. Không chia sẻ mã này với bất kỳ ai.\n\nNếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.`,
      html: `<!doctype html>
<html lang="vi"><body style="margin:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#1c2c58">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f8;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(28,44,88,.10)">
        <tr><td style="background:#1c2c58;padding:30px 36px;text-align:center">
          <div style="font-size:25px;letter-spacing:7px;color:#ffffff;font-weight:600">SILKMOON</div>
          <div style="margin-top:8px;font-size:11px;letter-spacing:2px;color:#bce2ff">CHĂM CHÚT GIẤC NGỦ</div>
        </td></tr>
        <tr><td style="padding:38px 36px 34px">
          <h1 style="margin:0 0 16px;font-size:25px;line-height:1.35;color:#1c2c58">Xác minh email của bạn</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#526079">Xin chào <strong>${name}</strong>, cảm ơn bạn đã tạo tài khoản tại Silkmoon. Sử dụng mã dưới đây để hoàn tất đăng ký:</p>
          <div style="margin:26px 0;padding:20px;text-align:center;background:#eef7ff;border:1px solid #bce2ff;border-radius:12px">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#64748b">Mã xác minh</div>
            <div style="margin-top:8px;font-size:38px;line-height:1;font-weight:700;letter-spacing:10px;color:#1c2c58">${otp}</div>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#526079">Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
          <div style="height:1px;background:#e7ebf0;margin:28px 0"></div>
          <p style="margin:0;font-size:12px;line-height:1.65;color:#8490a3">Nếu bạn không thực hiện đăng ký này, bạn có thể bỏ qua email. Tài khoản sẽ không được kích hoạt khi chưa nhập đúng mã.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;background:#f8fafc;text-align:center;font-size:12px;color:#8490a3">© SILKMOON · <a href="https://silkmoon.vn" style="color:#1c2c58;text-decoration:none">silkmoon.vn</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
  }

  async sendPasswordReset(to: string, fullName: string, resetUrl: string) {
    const from = this.config.get<string>('SMTP_FROM') || `Silkmoon <${this.config.get<string>('SMTP_USER')}>`;
    const name = this.escapeHtml(fullName);
    const safeResetUrl = this.escapeHtml(resetUrl);
    await this.getTransporter().sendMail({
      from,
      to,
      subject: 'Đặt lại mật khẩu tài khoản Silkmoon',
      text: `Xin chào ${fullName},\n\nSilkmoon đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Mở liên kết sau để tạo mật khẩu mới:\n${resetUrl}\n\nLiên kết có hiệu lực trong 30 phút. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email.`,
      html: `<!doctype html>
<html lang="vi"><body style="margin:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#1c2c58">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f8;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(28,44,88,.10)">
        <tr><td style="background:#1c2c58;padding:30px 36px;text-align:center">
          <div style="font-size:25px;letter-spacing:7px;color:#ffffff;font-weight:600">SILKMOON</div>
          <div style="margin-top:8px;font-size:11px;letter-spacing:2px;color:#bce2ff">CHĂM CHÚT GIẤC NGỦ</div>
        </td></tr>
        <tr><td style="padding:38px 36px 34px">
          <h1 style="margin:0 0 16px;font-size:25px;line-height:1.35;color:#1c2c58">Đặt lại mật khẩu</h1>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#526079">Xin chào <strong>${name}</strong>, Silkmoon đã nhận được yêu cầu tạo mật khẩu mới cho tài khoản của bạn.</p>
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto"><tr><td style="border-radius:8px;background:#1c2c58">
            <a href="${safeResetUrl}" style="display:inline-block;padding:15px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.5px">TẠO MẬT KHẨU MỚI</a>
          </td></tr></table>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#526079">Liên kết có hiệu lực trong <strong>30 phút</strong> và chỉ nên được sử dụng bởi bạn.</p>
          <div style="height:1px;background:#e7ebf0;margin:28px 0"></div>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.65;color:#8490a3">Nếu nút phía trên không hoạt động, sao chép liên kết này vào trình duyệt:</p>
          <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;color:#526079">${safeResetUrl}</p>
          <p style="margin:20px 0 0;font-size:12px;line-height:1.65;color:#8490a3">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại sẽ không thay đổi.</p>
        </td></tr>
        <tr><td style="padding:20px 36px;background:#f8fafc;text-align:center;font-size:12px;color:#8490a3">© SILKMOON · <a href="https://silkmoon.vn" style="color:#1c2c58;text-decoration:none">silkmoon.vn</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
    });
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char] || char);
  }
}
