const API_BASE = import.meta.env.VITE_API_URL;

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API URL:', import.meta.env.MODE, import.meta.env.VITE_API_URL);
  console.log('[API Config]', {
    mode: import.meta.env.MODE,
    apiUrl: API_BASE,
    apiUrlDefined: !!import.meta.env.VITE_API_URL,
    timestamp: new Date().toISOString()
  });
}

function normalizeEndpoint(endpoint) {
  if (typeof endpoint !== 'string') {
    throw new Error('apiFetch endpoint must be a string');
  }

  if (!endpoint.startsWith('/')) {
    return `/${endpoint}`;
  }

  return endpoint;
}

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
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('admin_token');
}

function redirectToAdminLoginIfNeeded() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
    window.location.href = '/admin';
  }
}

async function readErrorMessage(response) {
  try {
    const data = await response.json();
    return data?.message || 'Request failed';
  } catch {
    try {
      const text = await response.text();
      return text || 'Request failed';
    } catch {
      return 'Request failed';
    }
  }
}

export const apiFetch = (endpoint, options = {}) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const baseUrl = typeof API_BASE === 'string' ? API_BASE.replace(/\/$/, '') : '';
  const url = `${baseUrl}${normalizedEndpoint}`;

  if (!API_BASE) {
    console.error('[apiFetch] Missing VITE_API_URL. Check your `.env` / build environment.');
  }

  // Debug: Log the request
  console.log('[apiFetch] Request', {
    endpoint: normalizedEndpoint,
    fullUrl: url,
    method: options.method || 'GET'
  });

  const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;
  const tokenExpired = token ? isJwtExpired(token) : false;

  if (token && tokenExpired) {
    clearAdminToken();
    redirectToAdminLoginIfNeeded();
  }

  const headers = new Headers(options.headers || {});
  if (token && !tokenExpired && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const fetchOptions = {
    credentials: 'include',
    ...options,
    headers
  };

  return fetch(url, fetchOptions)
    .then((response) => {
      // Debug: Log the response status
      console.log('[apiFetch] Response', {
        endpoint: normalizedEndpoint,
        status: response.status,
        ok: response.ok
      });

      const isLoginRequest = normalizedEndpoint.includes('/admin/login');
      if (response.status === 401 && !isLoginRequest) {
        clearAdminToken();
        redirectToAdminLoginIfNeeded();
      }

      return response;
    })
    .catch((error) => {
      if (error?.name !== 'AbortError') {
        console.error(`[apiFetch] Network error calling ${url}`, error);
      }
      throw error;
    });
};

export async function apiJson(endpoint, options = {}) {
  const response = await apiFetch(endpoint, options);

  if (!response.ok) {
    const message = await readErrorMessage(response);
    console.error('[apiJson] Request failed', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      message
    });
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('[apiJson] Failed to parse JSON response', { endpoint }, error);
    throw error;
  }
}

export function getApiOrigin() {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return '';
  }
}

export function resolveBackendUrl(path) {
  if (!path) {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (/^[a-zA-Z]:\\/.test(path)) {
    return '';
  }

  const origin = getApiOrigin();
  if (!origin) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
