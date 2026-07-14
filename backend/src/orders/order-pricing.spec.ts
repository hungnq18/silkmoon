import { parseNonNegativeMoney, resolveProductSizePrice } from './order-pricing';

describe('order pricing', () => {
  it.each([undefined, null, '', '   ', 'invalid', -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid money value %p',
    (value) => expect(parseNonNegativeMoney(value)).toBeNull(),
  );

  it.each([[0, 0], ['0', 0], [1250000, 1250000], ['1250000', 1250000]])(
    'accepts non-negative money value %p',
    (value, expected) => expect(parseNonNegativeMoney(value)).toBe(expected),
  );

  it('uses the product price when size price is blank', () => {
    expect(resolveProductSizePrice(1150000, '')).toBe(1150000);
  });

  it('uses the size price when configured', () => {
    expect(resolveProductSizePrice(1150000, 1350000)).toBe(1350000);
  });
});
