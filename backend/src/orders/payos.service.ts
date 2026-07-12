import { BadGatewayException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

@Injectable()
export class PayosService {
  private readonly client: PayOS | null;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.config.get<string>('PAYOS_API_KEY');
    const checksumKey = this.config.get<string>('PAYOS_CHECKSUM_KEY');
    this.frontendUrl = (this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173').replace(/\/$/, '');
    this.client = clientId && apiKey && checksumKey
      ? new PayOS({ clientId, apiKey, checksumKey })
      : null;
  }

  private getClient() {
    if (!this.client) {
      throw new ServiceUnavailableException('PayOS chưa được cấu hình. Vui lòng bổ sung PAYOS_CLIENT_ID, PAYOS_API_KEY và PAYOS_CHECKSUM_KEY.');
    }
    return this.client;
  }

  async createPaymentLink(order: any, orderCode: number) {
    const resultUrl = `${this.frontendUrl}/checkout?order=${encodeURIComponent(order.orderNumber)}`;
    try {
      return await this.getClient().paymentRequests.create({
        orderCode,
        amount: order.total,
        description: `SILKMOON ${order.orderNumber}`.slice(0, 25),
        buyerName: order.fullName,
        buyerEmail: order.email || undefined,
        buyerPhone: order.phone,
        buyerAddress: `${order.address}, ${order.city}`,
        items: (order.items || []).map((item: any) => ({
          name: item.name.slice(0, 100),
          quantity: item.quantity,
          price: item.price,
        })),
        cancelUrl: `${resultUrl}&payment=cancelled`,
        returnUrl: `${resultUrl}&payment=success`,
        expiredAt: Math.floor(Date.now() / 1000) + 30 * 60,
      });
    } catch (error: any) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new BadGatewayException(error?.message || 'Không thể tạo liên kết thanh toán PayOS.');
    }
  }

  verifyWebhook(payload: any) {
    return this.getClient().webhooks.verify(payload);
  }

  getPayment(orderCode: number) {
    return this.getClient().paymentRequests.get(orderCode);
  }
}
