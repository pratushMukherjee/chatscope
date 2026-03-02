import client from './client';

export async function getMessages(conversationId, beforeId = null, limit = 50) {
  const params = { limit };
  if (beforeId) params.before_id = beforeId;

  const { data } = await client.get(
    `/conversations/${conversationId}/messages`,
    { params }
  );
  return data;
}
