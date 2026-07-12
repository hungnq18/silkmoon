const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Có lỗi xảy ra');
  }

  return res.json();
}

export const analyticsApi = {
  track: (data) => request('/analytics/track', { method: 'POST', body: JSON.stringify(data) }).catch(() => null),
};

export const assistantApi = {
  chat: (message) => request('/assistant/chat', { method: 'POST', body: JSON.stringify({ message }) }),
};

// ── Products ──────────────────────────────────────────────
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  getBestSellers: () => request('/products/best-sellers'),

  getById: (id) => request(`/products/${id}`),

  getRelated: (id) => request(`/products/${id}/related`),

  getCategories: () => request('/products/categories'),
};
export const categoriesApi = {
  getAll: async () => {
    const response = await request('/categories');
    return Array.isArray(response) ? response : (response?.items || []);
  },
};
export const blogApi = {
  getPosts: async () => {
    const response = await request('/blog/posts');
    return Array.isArray(response) ? response : (response?.items || []);
  },
  getPost: (id) => request(`/blog/posts/${id}`),
  getCategories: () => request('/blog/categories'),
  createComment: (data) => request('/blog/comments', { method: 'POST', body: JSON.stringify(data) }),
};
export const settingsApi = { get: (key) => request(`/settings/${key}`) };

// ── Promotions ────────────────────────────────────────────
export const promotionsApi = {
  validate: (code) =>
    request('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};

// ── Orders ────────────────────────────────────────────────
export const ordersApi = {
  create: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getById: (id) => request(`/orders/${id}`),
};

// ── Reviews ───────────────────────────────────────────────
export const reviewsApi = {
  getByProduct: (productId) => request(`/reviews/product/${productId}`),

  create: (reviewData) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};

// ── AR ────────────────────────────────────────────────────
export const arApi = {
  detectBed: (data) =>
    request('/ar/detect-bed', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generatePreview: (data) =>
    request('/ar/generate-preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  inpaintBed: (data) =>
    request('/ar/inpaint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadImage: (data) =>
    request('/ar/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  autoTryOn: (data) =>
    request('/ar/auto-tryon', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => request('/auth/profile'),
};

// ── Cart (For Logged-in Users) ────────────────────────────
export const cartApi = {
  getCart: () => request('/users/cart'),
  
  updateCart: (cart) =>
    request('/users/cart', {
      method: 'PUT',
      body: JSON.stringify(cart),
    }),
};
