import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || '/backend';

const USE_BACKEND_AUTH_API = import.meta.env.VITE_USE_BACKEND_AUTH_API === 'true';

const authEndpoint = (backendPath, serverlessPath) => (
  USE_BACKEND_AUTH_API ? backendPath : serverlessPath
);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const registrationApi = axios.create({
  baseURL: USE_BACKEND_AUTH_API ? API_BASE_URL : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const normalizeApiError = (error) => {
  const serverMessage = error.response?.data?.error || error.response?.data?.message;

  if (serverMessage && /cors/i.test(serverMessage) && error.response?.data) {
    error.response.data.error = 'Backend connection blocked. Add this frontend URL to backend CORS settings and redeploy Render.';
  }

  if (!error.response && (error.code === 'ERR_NETWORK' || /network/i.test(error.message || ''))) {
    error.message = 'Backend is not reachable. Check Render service status, API URL, and CORS settings.';
  }

  return Promise.reject(error);
};

// Add token to requests
api.interceptors.request.use(addAuthToken);
registrationApi.interceptors.request.use(addAuthToken);
api.interceptors.response.use((response) => response, normalizeApiError);
registrationApi.interceptors.response.use((response) => response, normalizeApiError);

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const serverMessage = error.response?.data?.error || error.response?.data?.message;

  if (serverMessage) {
    if (/cors/i.test(serverMessage)) {
      return 'Backend connection blocked. Please check the deployed frontend URL in backend CORS settings.';
    }

    return serverMessage;
  }

  if (error.code === 'ERR_NETWORK' || /network/i.test(error.message || '')) {
    return 'Backend is not reachable. Please check API URL, Render service status, and CORS settings.';
  }

  return error.message || fallback;
};

// Auth API
export const authAPI = {
  register: (userData) => registrationApi.post(authEndpoint('/auth/register', '/register-api'), userData),
  verifyRegistrationOtp: (data) => registrationApi.post(authEndpoint('/auth/verify-registration-otp', '/verify-registration-api'), data),
  resendRegistrationOtp: (email) => registrationApi.post(authEndpoint('/auth/resend-registration-otp', '/resend-registration-api'), { email }),
  login: (credentials) => api.post('/auth/login', credentials),
  forgotPassword: (email) => registrationApi.post(authEndpoint('/auth/forgot-password', '/forgot-password-api'), { email }),
  resetPassword: (data) => registrationApi.post(authEndpoint('/auth/reset-password', '/reset-password-api'), data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const locationAPI = {
  search: (query) => api.get('/location/search', { params: { q: query } }),
  reverse: async (lat, lon) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const apiUrl = import.meta.env.VITE_OPENWEATHER_REVERSE_GEO_API_URL;

    if (apiKey && apiUrl) {
      try {
        return await axios.get(apiUrl, {
          params: {
            lat,
            lon,
            limit: 1,
            appid: apiKey,
          },
        });
      } catch {
        // Fall through to the backend reverse-address endpoint below.
      }
    }

    return api.get('/location/reverse-address', { params: { lat, lon } }).then((response) => {
      const address = response.data.address || {};
      return {
        ...response,
        data: [{
          name: address.city || address.town || address.village || address.county || response.data.name || '',
          state: address.state || '',
          country: address.country || '',
          lat,
          lon,
        }],
      };
    });
  },
  reverseAddress: (lat, lon) => api.get('/location/reverse-address', { params: { lat, lon } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const heroSlidesAPI = {
  getAll: (params) => api.get('/hero-slides', { params }),
  create: (data) => api.post('/hero-slides', data),
  update: (id, data) => api.put(`/hero-slides/${id}`, data),
  delete: (id) => api.delete(`/hero-slides/${id}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMine: () => api.get('/orders'),
  getAll: () => api.get('/orders/admin/all'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  getPendingUsers: (status) => api.get(`/users/pending/${status}`),
  verifyUser: (userId, approved, notes) => 
    api.put(`/users/verify/${userId}`, { approved, verificationNotes: notes }),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const questionsAPI = {
  getByProduct: (productId) => api.get(`/questions/product/${productId}`),
  create: (data) => api.post('/questions', data),
  answer: (id, answer) => api.put(`/questions/${id}/answer`, { answer }),
};

export default api;
