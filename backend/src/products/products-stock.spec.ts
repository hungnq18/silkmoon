import { ProductsService } from './products.service';

describe('ProductsService stock operations', () => {
  it('keeps category data untouched during a partial product update', async () => {
    const lean = jest.fn().mockResolvedValue({ _id: 'product-1', isBestSeller: true });
    const productModel = { findByIdAndUpdate: jest.fn().mockReturnValue({ lean }) };
    const service = new ProductsService(productModel as any);

    await service.update('product-1', { isBestSeller: true });
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'product-1',
      { isBestSeller: true },
      { returnDocument: 'after' },
    );
  });

  it('loads a public product catalog for chatbot advice without cost prices', async () => {
    const lean = jest.fn().mockResolvedValue([{ name: 'Ga Tencel', price: 1200000, stock: 4 }]);
    const limit = jest.fn().mockReturnValue({ lean });
    const sort = jest.fn().mockReturnValue({ limit });
    const select = jest.fn().mockReturnValue({ sort });
    const productModel = { find: jest.fn().mockReturnValue({ select }) };
    const service = new ProductsService(productModel as any);

    await expect(service.getChatbotCatalog()).resolves.toEqual([{ name: 'Ga Tencel', price: 1200000, stock: 4 }]);
    expect(productModel.find).toHaveBeenCalledWith({});
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ name: 1, price: 1, stock: 1, sizes: 1, colors: 1 }));
    expect(select.mock.calls[0][0]).not.toHaveProperty('costPrice');
    expect(limit).toHaveBeenCalledWith(80);
  });

  it('reserves stock with one conditional atomic update', async () => {
    const lean = jest.fn().mockResolvedValue({ _id: 'product-1', stock: 0 });
    const productModel = {
      findOneAndUpdate: jest.fn().mockReturnValue({ lean }),
    };
    const service = new ProductsService(productModel as any);

    await expect(service.reserveStock('product-1', 1)).resolves.toEqual({ _id: 'product-1', stock: 0 });
    expect(productModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'product-1', stock: { $gte: 1 } },
      { $inc: { stock: -1 } },
      { returnDocument: 'after' },
    );
  });

  it('returns null when another checkout already took the remaining stock', async () => {
    const productModel = {
      findOneAndUpdate: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) }),
    };
    const service = new ProductsService(productModel as any);

    await expect(service.reserveStock('product-1', 1)).resolves.toBeNull();
  });

  it('releases a reservation with an atomic increment', async () => {
    const lean = jest.fn().mockResolvedValue({ _id: 'product-1', stock: 1 });
    const productModel = {
      findByIdAndUpdate: jest.fn().mockReturnValue({ lean }),
    };
    const service = new ProductsService(productModel as any);

    await expect(service.releaseStock('product-1', 1)).resolves.toEqual({ _id: 'product-1', stock: 1 });
    expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'product-1',
      { $inc: { stock: 1 } },
      { returnDocument: 'after' },
    );
  });
});
