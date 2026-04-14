import api from './api';

export async function uploadImage(file) {
  if (!file) {
    throw new Error('Image file is required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData);
  return response.data.url;
}
