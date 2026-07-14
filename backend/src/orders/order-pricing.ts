export const parseNonNegativeMoney = (value: unknown): number | null => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

export const resolveProductSizePrice = (productPrice: unknown, sizePrice: unknown): number | null =>
  parseNonNegativeMoney(sizePrice) ?? parseNonNegativeMoney(productPrice);
