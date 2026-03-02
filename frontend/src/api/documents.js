import client from './client';

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await client.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function getDocuments(page = 1, perPage = 20) {
  const { data } = await client.get('/documents', {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function getDocument(id) {
  const { data } = await client.get(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id) {
  await client.delete(`/documents/${id}`);
}
