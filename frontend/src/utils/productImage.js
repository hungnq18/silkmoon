const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

export const getOptimizedProductImage = (source, { width = 640 } = {}) => {
  if (typeof source !== 'string' || !source.includes('res.cloudinary.com') || !source.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return source;
  }

  // Reuse just two deterministic WebP variants everywhere. A single stable URL
  // means a card warmed on one page is already cached on every other page.
  const cachedWidth = width <= 320 ? 320 : 640;
  const transformations = `f_webp,q_auto:eco,w_${cachedWidth},c_limit`;

  return source.replace(CLOUDINARY_UPLOAD_SEGMENT, `${CLOUDINARY_UPLOAD_SEGMENT}${transformations}/`);
};
