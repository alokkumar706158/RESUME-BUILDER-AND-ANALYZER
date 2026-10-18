import axios from 'axios';

// In development the Vite proxy forwards /api to the Express server.
// In production set VITE_API_URL to the deployed backend origin.
const rawApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api` : '/api';

export const getApiBaseUrl = () => API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resumeroast_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Allow browser to set boundary header automatically for FormData
  if (config.data instanceof FormData && config.headers) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    }
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  return config;
});

// Interceptor to handle automatic JWT refreshing on 401 expiry for protected routes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';

    const isAuthRoute =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/me');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        console.warn('Session expired. Redirecting to login.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
