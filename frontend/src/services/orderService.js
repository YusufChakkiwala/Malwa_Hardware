import api from './api';

export async function createOrder(payload) {
  const response = await api.post('/orders', payload);
  return response.data;
}

export async function fetchOrderHistory(customerUid) {
  const response = await api.get('/orders/history', { params: { customerUid } });
  return response.data;
}

export async function fetchOrders() {
  const response = await api.get('/orders');
  return response.data;
}

export async function fetchOrderById(id) {
  const response = await api.get(`/orders/${id}`);
  return response.data;
}

export async function updateOrderStatus(id, status) {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
}
