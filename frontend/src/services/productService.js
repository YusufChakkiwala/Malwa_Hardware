import { apiJson, resolveBackendUrl } from './api';
import { getPricing, sanitizeUnit } from '../utils/pricing';

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
    imageUrl: resolveBackendUrl(product.imageUrl)
  };
}

export async function fetchProducts(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const endpoint = searchParams.toString() ? `/api/products?${searchParams}` : '/api/products';
  const response = await apiJson(endpoint);
  return {
    ...response,
    data: (response.data || []).map(normalizeProduct)
  };
}

export async function fetchProductById(id) {
  const response = await apiJson(`/api/products/${id}`);
  return normalizeProduct(response);
}

export async function createProduct(payload) {
  const response = await apiJson('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return normalizeProduct(response);
}

export async function updateProduct(id, payload) {
  const response = await apiJson(`/api/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return normalizeProduct(response);
}

export async function deleteProduct(id) {
  return apiJson(`/api/products/${id}`, { method: 'DELETE' });
}

export async function fetchCategories() {
  return apiJson('/api/categories');
}

export async function createCategory(payload) {
  return apiJson('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}
