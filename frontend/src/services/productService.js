import api from './api';
import { getPricing, sanitizeUnit } from '../utils/pricing';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let backendOrigin = 'http://localhost:5000';

try {
  backendOrigin = new URL(apiBaseUrl).origin;
} catch {
  backendOrigin = 'http://localhost:5000';
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return imageUrl;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (/^[a-zA-Z]:\\/.test(imageUrl)) {
    return '';
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${backendOrigin}${normalizedPath}`;
}

function normalizeProduct(product) {
  if (!product) {
    return product;
  }

  const pricing = getPricing(product);

  return {
    ...product,
    price: pricing.price,
    discountPrice: pricing.discountPrice,
    unit: sanitizeUnit(product.unit),
    imageUrl: resolveImageUrl(product.imageUrl)
  };
}

export async function fetchProducts(params = {}) {
  const response = await api.get('/products', { params });
  return {
    ...response.data,
    data: (response.data.data || []).map(normalizeProduct)
  };
}

export async function fetchProductById(id) {
  const response = await api.get(`/products/${id}`);
  return normalizeProduct(response.data);
}

export async function createProduct(payload) {
  const response = await api.post('/products', payload);
  return normalizeProduct(response.data);
}

export async function updateProduct(id, payload) {
  const response = await api.put(`/products/${id}`, payload);
  return normalizeProduct(response.data);
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}

export async function fetchCategories() {
  const response = await api.get('/categories');
  return response.data;
}

export async function createCategory(payload) {
  const response = await api.post('/categories', payload);
  return response.data;
}
