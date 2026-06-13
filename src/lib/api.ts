const API_BASE = "https://adhunik-electric-backend.onrender.com/api";

let authToken = localStorage.getItem("token") || "";

export function setToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

export function getToken() {
  return authToken;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  // SEED
  seed: {
    run: () => request("/seed", { method: "POST" }),
  },

  // AUTH
  auth: {
    register: (body: any) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: any) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    logout: () => request("/auth/logout", { method: "POST" }),
  },

  // USERS
  users: {
    getMe: () => request("/users/me"),
    updateMe: (body: any) => request("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
    list: () => request("/users"),
    update: (id: string, body: any) => request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  },

  // PRODUCTS
  products: {
    list: (params: Record<string, any> = {}) => {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          qs.append(key, String(val));
        }
      });
      return request(`/products?${qs.toString()}`);
    },
    getFeatured: () => request("/products/featured"),
    get: (id: string) => request(`/products/${id}`),
    create: (body: any) => request("/products", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/products/${id}`, { method: "DELETE" }),
  },

  // CATEGORIES
  categories: {
    list: () => request("/categories"),
    create: (body: any) => request("/categories", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/categories/${id}`, { method: "DELETE" }),
  },

  // BRANDS
  brands: {
    list: () => request("/brands"),
    create: (body: any) => request("/brands", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/brands/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/brands/${id}`, { method: "DELETE" }),
  },

  // REVIEWS
  reviews: {
    listForProduct: (productId: string) => request(`/reviews/product/${productId}`),
    create: (body: any) => request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  },

  // CART
  cart: {
    get: () => request("/cart"),
    add: (body: any) => request("/cart/add", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, quantity: number) => request(`/cart/update/${id}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
    remove: (id: string) => request(`/cart/remove/${id}`, { method: "DELETE" }),
    sync: (items: any[]) => request("/cart/sync", { method: "POST", body: JSON.stringify({ items }) }),
  },

  // WISHLIST
  wishlist: {
    get: () => request("/wishlist"),
    add: (productId: string) => request("/wishlist/add", { method: "POST", body: JSON.stringify({ productId }) }),
    remove: (productId: string) => request("/wishlist/remove", { method: "DELETE", body: JSON.stringify({ productId }) }),
  },

  // ORDERS
  orders: {
    list: () => request("/orders"),
    listMine: () => request("/orders/mine"),
    get: (id: string) => request(`/orders/${id}`),
    create: (body: any) => request("/orders", { method: "POST", body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string) => request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // BANNERS
  banners: {
    list: () => request("/banners"),
    create: (body: any) => request("/banners", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/banners/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/banners/${id}`, { method: "DELETE" }),
  },

  // COUPONS
  coupons: {
    list: () => request("/coupons"),
    create: (body: any) => request("/coupons", { method: "POST", body: JSON.stringify(body) }),
    validate: (code: string, orderAmount: number) => request("/coupons/validate", { method: "POST", body: JSON.stringify({ code, orderAmount }) }),
    update: (id: string, body: any) => request(`/coupons/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/coupons/${id}`, { method: "DELETE" }),
  },

  // DASHBOARD
  dashboard: {
    getStats: () => request("/dashboard/stats"),
  },
};
export default api;
