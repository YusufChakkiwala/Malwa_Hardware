import { apiJson } from './api';

export async function createOrder(payload) {
  return apiJson('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchOrderHistory(customerUid) {
  const searchParams = new URLSearchParams({ customerUid: String(customerUid) });
  return apiJson(`/api/orders/history?${searchParams}`);
}

export async function fetchOrders() {
  return apiJson('/api/orders');
}

export async function fetchOrderById(id) {
  return apiJson(`/api/orders/${id}`);
}

export async function updateOrderStatus(id, status) {
  return apiJson(`/api/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
}
