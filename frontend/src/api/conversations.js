import client from './client';

export async function getConversations(page = 1, perPage = 20) {
  const { data } = await client.get('/conversations', {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function createConversation(title = null, model = 'gpt-4o') {
  const { data } = await client.post('/conversations', { title, model });
  return data;
}

export async function getConversation(id) {
  const { data } = await client.get(`/conversations/${id}`);
  return data;
}

export async function updateConversation(id, title) {
  const { data } = await client.patch(`/conversations/${id}`, { title });
  return data;
}

export async function deleteConversation(id) {
  await client.delete(`/conversations/${id}`);
}
