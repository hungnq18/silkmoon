export const getSizeMeasurements = (size) => {
  if (Array.isArray(size?.measurements)) {
    return size.measurements.filter((item) => item.label && item.value !== undefined && item.value !== null && item.value !== '');
  }

  return [['width', 'Rộng'], ['length', 'Dài'], ['height', 'Dày/Cao']]
    .filter(([key]) => size?.[key] !== undefined && size?.[key] !== null && size?.[key] !== '')
    .map(([key, label]) => ({ id: key, label, value: size[key], unit: size.unit || 'cm' }));
};

export const applyLatestSizeCatalog = (product, setting) => {
  const categories = Array.isArray(setting?.value) ? setting.value : [];
  const catalogSizes = categories.some((item) => Array.isArray(item.sizes))
    ? categories.filter((item) => item.isActive !== false).flatMap((item) => (item.sizes || []).filter((size) => size.isActive !== false))
    : categories.filter((item) => item.isActive !== false);
  const catalogById = new Map(catalogSizes.map((size) => [size.id, size]));

  return {
    ...product,
    sizes: (product?.sizes || []).map((size) => {
      const latest = catalogById.get(size.id);
      if (!latest) return size;
      const merged = { ...size, ...latest };
      return size.price === '' || size.price == null ? merged : { ...merged, price: size.price };
    }),
  };
};
