const normalizeCategoryText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .toLowerCase()
  .trim();

export const isIndividualBeddingCategory = (category) => {
  const normalized = normalizeCategoryText(category);
  if (!normalized || normalized.includes('bo chan ga goi')) return false;
  return ['chan', 'vo chan', 'ga', 'ga giuong', 'goi', 'vo goi'].some((name) => (
    normalized === name || normalized.includes(name)
  ));
};

export const getProductCategories = (product) => [...new Set([
  product?.category,
  ...(Array.isArray(product?.categories) ? product.categories : []),
].map((category) => String(category || '').trim()).filter(Boolean))];

export const isBeddingSetProduct = (product) => (
  normalizeCategoryText(`${product?.name || ''} ${getProductCategories(product).join(' ')}`).includes('bo chan ga goi')
);

export const productMatchesCategory = (product, category) => {
  const selectedCategory = normalizeCategoryText(category);
  if (!selectedCategory) return true;
  return getProductCategories(product).some((productCategory) => normalizeCategoryText(productCategory).includes(selectedCategory))
    || (isIndividualBeddingCategory(category) && isBeddingSetProduct(product));
};
