import api from './api';
import { uploadImage as uploadFile } from './uploadService';

export async function startChat(payload) {
  const response = await api.post('/chats', payload);
  return response.data;
}

export async function fetchChatMessages(chatId) {
  const response = await api.get(`/chats/${chatId}/messages`);
  return response.data;
}

export async function fetchChats() {
  const response = await api.get('/chats');
  return response.data;
}

export async function submitQuery(payload) {
  const response = await api.post('/queries', payload);
  return response.data;
}

export async function fetchQueries() {
  const response = await api.get('/queries');
  return response.data;
}

export async function updateQueryStatus(id, status) {
  const response = await api.put(`/queries/${id}/status`, { status });
  return response.data;
}

export async function uploadImage(file) {
  return uploadFile(file);
}
