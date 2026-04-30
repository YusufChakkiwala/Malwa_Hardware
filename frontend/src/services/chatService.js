import { apiJson } from './api';
import { uploadImage as uploadFile } from './uploadService';

export async function startChat(payload) {
  return apiJson('/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchChatMessages(chatId) {
  return apiJson(`/api/chats/${chatId}/messages`);
}

export async function fetchChats() {
  return apiJson('/api/chats');
}

export async function submitQuery(payload) {
  return apiJson('/api/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export async function fetchQueries() {
  return apiJson('/api/queries');
}

export async function updateQueryStatus(id, status) {
  return apiJson(`/api/queries/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
}

export async function uploadImage(file) {
  return uploadFile(file);
}
