import client from './client';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export async function toggleShare(conversationId) {
  const { data } = await client.post(`/conversations/${conversationId}/share`);
  return data;
}

export async function getSharedConversation(slug) {
  const { data } = await axios.get(`${API_BASE_URL}/share/${slug}`);
  return data;
}
