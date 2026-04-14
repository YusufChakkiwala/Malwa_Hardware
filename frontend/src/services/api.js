import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true
});

function parseJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4 || 4)) % 4)}`;
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isJwtExpired(token) {
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  return payload.exp * 1000 <= Date.now();
}

function clearAdminToken() {
  localStorage.removeItem('admin_token');
}

function redirectToAdminLoginIfNeeded() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
    window.location.href = '/admin';
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && !isJwtExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (token && isJwtExpired(token)) {
    clearAdminToken();
    redirectToAdminLoginIfNeeded();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url || '');
    const isLoginRequest = requestUrl.includes('/admin/login');

    if (status === 401 && !isLoginRequest) {
      clearAdminToken();
      redirectToAdminLoginIfNeeded();
    }

    return Promise.reject(error);
  }
);

export default api;
