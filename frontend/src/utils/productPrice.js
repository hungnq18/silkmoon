const parseNonNegativePrice = (value) => {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
};

export const getNonNegativePrice = (value, fallback = 0) => (
  parseNonNegativePrice(value) ?? fallback
);

export const getProductCustomizationPrice = (product, item) => (
  (item?.embroidery ? getNonNegativePrice(product?.embroideryPrice) : 0) +
  ((item?.sizeId === 'custom' || item?.customSize) ? getNonNegativePrice(product?.customSizePrice) : 0)
);

export const getProductSizePrice = (product, sizeId) => {
  const fallbackPrice = parseNonNegativePrice(product?.price) ?? 0;
  if (!sizeId || sizeId === 'custom') return fallbackPrice;

  const size = (product?.sizes || []).find((item) => item.id === sizeId);
  return parseNonNegativePrice(size?.price) ?? fallbackPrice;
};

export const getProductListPrice = (product) => {
  const fallbackPrice = parseNonNegativePrice(product?.price) ?? 0;
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  if (!sizes.length) return fallbackPrice;

  return Math.min(...sizes.map((size) => getProductSizePrice(product, size.id)));
};

export const getProductOriginalPrice = (product, currentPrice = getProductListPrice(product)) => {
  const originalPrice = parseNonNegativePrice(product?.originalPrice);
  if (originalPrice === null) return null;

  const basePrice = parseNonNegativePrice(product?.price) ?? 0;
  const resolvedCurrentPrice = parseNonNegativePrice(currentPrice) ?? basePrice;
  return originalPrice + (resolvedCurrentPrice - basePrice);
};

export const getLowestPriceSize = (product) => {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  if (!sizes.length) return null;

  return sizes.reduce((lowest, size) => (
    !lowest || getProductSizePrice(product, size.id) < getProductSizePrice(product, lowest.id) ? size : lowest
  ), null);
};
