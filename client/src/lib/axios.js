import axios from 'axios';
import useAuthStore from '../stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear auth and redirect to login (skip on auth pages to avoid redirect loops)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
    const onAuthPage = AUTH_PATHS.some((p) => window.location.pathname.startsWith(p));
    if (error.response?.status === 401 && !onAuthPage) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
