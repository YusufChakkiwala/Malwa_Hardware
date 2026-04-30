import { apiJson } from './api';

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

export async function loginAdmin(username, password) {
  const data = await apiJson('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  localStorage.setItem('admin_token', data.token);
  return data;
}

export function logoutAdmin() {
  localStorage.removeItem('admin_token');
}

export function getAdminToken() {
  return localStorage.getItem('admin_token');
}

export function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) {
    return false;
  }

  if (isJwtExpired(token)) {
    logoutAdmin();
    return false;
  }

  return true;
}
