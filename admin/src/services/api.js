const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
const apiRequest = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: getHeaders(),
    cache: options.cache || "no-store",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Thao tác không thành công");
  }
  return res.status === 204 ? null : res.json().catch(() => null);
};

export const adminApi = {
  getReviews: () => apiRequest("/reviews"),
  updateReview: (id, data) =>
    apiRequest(`/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteReview: (id) => apiRequest(`/reviews/${id}`, { method: "DELETE" }),
  getPromotions: () => apiRequest("/promotions"),
  createPromotion: (data) => apiRequest("/promotions", { method: "POST", body: JSON.stringify(data) }),
  updatePromotion: (id,data) => apiRequest(`/promotions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePromotion: (id) => apiRequest(`/promotions/${id}`, { method: "DELETE" }),
  getSettings: () => apiRequest(`/settings?_=${Date.now()}`, { cache: "no-store" }),
  saveSetting: (key,data) => apiRequest(`/settings/${key}`, { method: "POST", body: JSON.stringify(data) }),
  getAnalytics: () => apiRequest("/admin/analytics"),
  getAnalyticsReport: () => apiRequest("/admin/analytics/report"),
  getAiUsage: () => apiRequest("/admin/ai-usage"),
  getFinance: ({ from, to, groupBy = "day" } = {}) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("groupBy", groupBy);
    return apiRequest(`/admin/finance?${params}`);
  },
  getBlogPosts: ({ page = 1, limit = 10 } = {}) =>
    apiRequest(`/blog/admin/posts?page=${page}&limit=${limit}`),
  createBlogPost: (data) =>
    apiRequest("/blog/posts", { method: "POST", body: JSON.stringify(data) }),
  updateBlogPost: (id, data) =>
    apiRequest(`/blog/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteBlogPost: (id) => apiRequest(`/blog/posts/${id}`, { method: "DELETE" }),
  getBlogCategories: () => apiRequest("/blog/categories"),
  createBlogCategory: (data) =>
    apiRequest("/blog/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBlogCategory: (id, data) =>
    apiRequest(`/blog/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteBlogCategory: (id) =>
    apiRequest(`/blog/categories/${id}`, { method: "DELETE" }),
  getBlogComments: () => apiRequest("/blog/admin/comments"),
  updateBlogComment: (id, data) =>
    apiRequest(`/blog/comments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteBlogComment: (id) =>
    apiRequest(`/blog/comments/${id}`, { method: "DELETE" }),
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },
  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
  getOrders: async ({ page = 1, limit = 15 } = {}) => {
    const res = await fetch(`${API_URL}/orders?page=${page}&limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },
  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
  getProducts: async ({ page = 1, limit = 20 } = {}) => {
    const res = await fetch(`${API_URL}/products?page=${page}&limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  },
  getCategories: async ({ page, limit } = {}) => {
    const params = new URLSearchParams();
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    const qs = params.toString() ? `?${params}` : '';
    const res = await fetch(`${API_URL}/categories${qs}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Không thể tải danh mục");
    const data = await res.json();
    // if paginated return as-is, else wrap for backward compat
    return data;
  },
  createCategory: async (data) => {
    const res = await fetch(`${API_URL}/categories`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Không thể tạo danh mục");
    }
    return res.json();
  },
  updateCategory: async (id, data) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Không thể cập nhật danh mục");
    }
    return res.json();
  },
  deleteCategory: async (id) => {
    const res = await fetch(`${API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || "Không thể xóa danh mục");
    }
    return res.json().catch(() => null);
  },
  createProduct: async (productData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Không thể tạo sản phẩm");
    }
    return res.json();
  },
  importProducts: (rows) =>
    apiRequest("/products/import", { method: "POST", body: JSON.stringify({ rows }) }),
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Failed to update product");
    }
    return res.json();
  },
  uploadProductImage: async (image) => {
    const res = await fetch(`${API_URL}/ar/upload`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ image }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Không thể tải ảnh lên");
    }
    const data = await res.json();
    return data.url;
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message || "Failed to delete product");
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  },
  getUsers: async ({ page = 1, limit = 20 } = {}) => {
    const res = await fetch(`${API_URL}/users?page=${page}&limit=${limit}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  },
  createUser: (data) =>
    apiRequest("/users", { method: "POST", body: JSON.stringify(data) }),
};
