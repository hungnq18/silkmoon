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

export const getLowestPriceSize = (product) => {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  if (!sizes.length) return null;

  return sizes.reduce((lowest, size) => (
    !lowest || getProductSizePrice(product, size.id) < getProductSizePrice(product, lowest.id) ? size : lowest
  ), null);
};

export const getProductOriginalPrice = (product, currentPrice = getProductListPrice(product), sizeId) => {
  const basePrice = parseNonNegativePrice(product?.price) ?? 0;
  const resolvedCurrentPrice = parseNonNegativePrice(currentPrice) ?? basePrice;
  const selectedSize = sizeId
    ? (product?.sizes || []).find((size) => size.id === sizeId)
    : getLowestPriceSize(product);
  const sizeOriginalPrice = parseNonNegativePrice(selectedSize?.originalPrice);
  if (sizeOriginalPrice !== null) return sizeOriginalPrice > resolvedCurrentPrice ? sizeOriginalPrice : null;

  const originalPrice = parseNonNegativePrice(product?.originalPrice);
  if (originalPrice === null) return null;

  const resolvedOriginalPrice = originalPrice + (resolvedCurrentPrice - basePrice);
  return resolvedOriginalPrice > resolvedCurrentPrice ? resolvedOriginalPrice : null;
};

export const hasProductSale = (product) => {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  if (sizes.length) {
    return sizes.some((size) => {
      const salePrice = getProductSizePrice(product, size.id);
      const originalPrice = getProductOriginalPrice(product, salePrice, size.id);
      return originalPrice !== null && originalPrice > salePrice;
    });
  }

  const salePrice = getProductListPrice(product);
  const originalPrice = getProductOriginalPrice(product, salePrice);
  return originalPrice !== null && originalPrice > salePrice;
};
