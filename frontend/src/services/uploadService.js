import { apiJson, resolveBackendUrl } from './api';

export async function uploadImage(file) {
  if (!file) {
    throw new Error('Image file is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await apiJson('/api/upload', {
    method: 'POST',
    body: formData
  });

  return resolveBackendUrl(response.url);
}
