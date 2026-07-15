import { OrdersService } from './orders.service';

describe('OrdersService stock reservation rollback', () => {
  it('releases reserved stock when order creation fails', async () => {
    const product = {
      _id: { toString: () => 'product-1' },
      name: 'Silk product',
      category: 'Bedding',
      price: 100000,
      costPrice: 50000,
      stock: 1,
      sizes: [{ id: 'M', label: 'M', price: 120000, costPrice: 70000 }],
      images: [],
      allowEmbroidery: false,
      allowCustomSize: false,
    };
    const orderModel = {
      create: jest.fn().mockRejectedValue(new Error('database unavailable')),
      findByIdAndDelete: jest.fn(),
    };
    const productsService = {
      findById: jest.fn().mockResolvedValue(product),
      reserveStock: jest.fn().mockResolvedValue({ ...product, stock: 0 }),
      releaseStock: jest.fn().mockResolvedValue({ ...product, stock: 1 }),
    };
    const service = new OrdersService(
      orderModel as any,
      {} as any,
      productsService as any,
      {} as any,
    );

    await expect(
      service.create({
        fullName: 'Customer',
        phone: '0900000000',
        address: 'Address',
        city: 'City',
        paymentMethod: 'cod',
        items: [{ productId: 'product-1', quantity: 1, sizeId: 'M' }],
      }),
    ).rejects.toThrow('database unavailable');

    expect(productsService.reserveStock).toHaveBeenCalledWith('product-1', 1);
    expect(productsService.releaseStock).toHaveBeenCalledWith('product-1', 1);
    expect(orderModel.create).toHaveBeenCalledWith(expect.objectContaining({
      items: [expect.objectContaining({ sizeId: 'M', price: 120000, costPriceSnapshot: 70000 })],
    }));
  });
});
