import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5041/api';
//export const API_BASE_URL = 'https://ganeshtech2017.runasp.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  upgradeToPremier: (data) => api.post('/auth/upgrade-premier', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  generateCaptcha: () => api.post('/auth/generate-captcha'),
  verifyCaptcha: (data) => api.post('/auth/verify-captcha', data),
  getValidationRules: () => api.get('/auth/validation-rules'),
};

// Vendor API
export const vendorAPI = {
  register: (data) => api.post('/vendor/register', data),
  getAll: () => api.get('/vendor'),
  getById: (id) => api.get(`/vendor/${id}`),
  update: (id, data) => api.put(`/vendor/${id}`, data),
  delete: (id) => api.delete(`/vendor/${id}`),
  verify: (id) => api.post(`/vendor/${id}/verify`),
};

// Product API
export const productAPI = {
  create: (data) => api.post('/product', data),
  getAll: () => api.get('/product'),
  getById: (id) => api.get(`/product/${id}`),
  getByVendor: (vendorId) => api.get(`/product/vendor/${vendorId}`),
  getByCategory: (category) => api.get(`/product/category/${category}`),
  search: (query) => api.get('/product/search', { params: { query } }),
  update: (id, data) => api.put(`/product/${id}`, data),
  delete: (id) => api.delete(`/product/${id}`),
  toggleFeatured: (id, data) => api.post(`/product/${id}/featured`, data),
  getValidationRules: () => api.get('/product/validation-rules'),
};

// Search API
export const searchAPI = {
  searchAll: (query) => api.get('/product/search/all', { params: { query } }),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/order', data),
  getAll: () => api.get('/order'),
  getByUser: (userId) => api.get(`/order/user/${userId}`),
  getById: (id) => api.get(`/order/${id}`),
  updateStatus: (id, data) => api.put(`/order/${id}/status`, data),
  updatePayment: (id, data) => api.put(`/order/${id}/payment`, data),
  updateTracking: (id, data) => api.put(`/order/${id}/tracking`, data),
  delete: (id) => api.delete(`/order/${id}`),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/category'),
  getById: (id) => api.get(`/category/${id}`),
  getFeatured: () => api.get('/category/featured'),
  getByCategory: (category) => api.get(`/category/category/${category}`),
  getValidationRules: () => api.get('/category/validation-rules'),
  getMaxDisplayOrder: () => api.get('/category/max-display-order'),
  create: (data) => api.post('/category', data),
  update: (id, data) => api.put(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
};

// SubCategory API
export const subCategoryAPI = {
  getAll: () => api.get('/subcategory'),
  getById: (id) => api.get(`/subcategory/${id}`),
  getByCategory: (categoryId) => api.get(`/subcategory/category/${categoryId}`),
  getFeatured: () => api.get('/subcategory/featured'),
  getValidationRules: () => api.get('/subcategory/validation-rules'),
  getMaxDisplayOrder: () => api.get('/subcategory/max-display-order'),
  create: (data) => api.post('/subcategory', data),
  update: (id, data) => api.put(`/subcategory/${id}`, data),
  delete: (id) => api.delete(`/subcategory/${id}`),
};

// Company API
export const companyAPI = {
  getAll: () => api.get('/company'),
  getById: (id) => api.get(`/company/${id}`),
  getByCategory: (category) => api.get(`/company/category/${category}`),
  getFeatured: () => api.get('/company/featured'),
  create: (data) => api.post('/company', data),
  update: (id, data) => api.put(`/company/${id}`, data),
  delete: (id) => api.delete(`/company/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (data) => api.post('/cart', data),
  updateCart: (cartId, data) => api.put(`/cart/${cartId}`, data),
  updateCartItem: (cartId, itemId, data) => api.put(`/cart/${cartId}/item/${itemId}`, data),
  removeFromCart: (cartId, itemId, variantId) => api.delete(`/cart/${cartId}/item/${itemId}/${variantId}`),
  clearCart: (cartId) => api.delete(`/cart/${cartId}`),
};

// Site Configuration API
export const siteConfigAPI = {
  getConfiguration: () => api.get('/siteconfiguration'),
  updateConfiguration: (data) => api.post('/siteconfiguration', data),
  updateHeader: (data) => api.put('/siteconfiguration/header', data),
  updateFooter: (data) => api.put('/siteconfiguration/footer', data),
  updateTheme: (data) => api.put('/siteconfiguration/theme', data),
  updateValidation: (data) => api.put('/siteconfiguration/validation', data),
};

// User API
export const userAPI = {
  getAll: () => api.get('/user'),
  getById: (id) => api.get(`/user/${id}`),
  update: (id, data) => api.put(`/user/${id}`, data),
  delete: (id) => api.delete(`/user/${id}`),
  updateRole: (id, data) => api.put(`/user/${id}/role`, data),
  toggleActive: (id) => api.put(`/user/${id}/toggle-active`),
  changePassword: (id, data) => api.post(`/user/${id}/change-password`, data),
  updatePreferences: (id, data) => api.put(`/user/${id}/preferences`, data),
  addToWishlist: (id, data) => api.post(`/user/${id}/wishlist`, data),
  removeFromWishlist: (id, productId) => api.delete(`/user/${id}/wishlist/${productId}`),
  getWishlist: (id) => api.get(`/user/${id}/wishlist`),
  validateAddress: (userId, data) => api.post(`/user/${userId}/addresses/validate`, data),
  validatePaymentMethod: (userId, data) => api.post(`/user/${userId}/payment-methods/validate`, data),
};

// Payment API
export const paymentAPI = {
  checkout: (data) => api.post('/payment/checkout', data),
  getByOrder: (orderId) => api.get(`/payment/order/${orderId}`),
  getByUser: (userId) => api.get(`/payment/user/${userId}`),
  updateStatus: (id, data) => api.put(`/payment/${id}/status`, data),
  refund: (id, data) => api.post(`/payment/${id}/refund`, data),
};

// Review API
export const reviewAPI = {
  getByProduct: (productId) => api.get(`/review/product/${productId}`),
  getByUser: (userId) => api.get(`/review/user/${userId}`),
  getById: (id) => api.get(`/review/${id}`),
  create: (data) => api.post('/review', data),
  update: (id, data) => api.put(`/review/${id}`, data),
  delete: (id) => api.delete(`/review/${id}`),
  markHelpful: (id, data) => api.post(`/review/${id}/helpful`, data),
  reply: (id, data) => api.post(`/review/${id}/reply`, data),
  approve: (id, data) => api.put(`/review/${id}/approve`, data),
  getProductSummary: (productId) => api.get(`/review/product/${productId}/summary`),
};

// Seed API
export const seedAPI = {
  seedDatabase: (data) => api.post('/seed', data),
};

export default api;
