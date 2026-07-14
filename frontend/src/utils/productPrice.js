export const getProductSizePrice = (product, sizeId) => {
  const fallbackPrice = Number(product?.price || 0);
  if (!sizeId || sizeId === 'custom') return fallbackPrice;

  const size = (product?.sizes || []).find((item) => item.id === sizeId);
  if (size?.price === '' || size?.price == null) return fallbackPrice;

  const sizePrice = Number(size.price);
  return Number.isFinite(sizePrice) && sizePrice >= 0 ? sizePrice : fallbackPrice;
};
