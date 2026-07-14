import { ProductsService } from './products.service';

describe('ProductsService stock operations', () => {
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
