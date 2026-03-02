import client from './client';

export async function loginUser(email, password) {
  const { data } = await client.post('/auth/login', { email, password });
  return data;
}

export async function registerUser(email, username, password) {
  const { data } = await client.post('/auth/register', { email, username, password });
  return data;
}

export async function refreshToken(token) {
  const { data } = await client.post('/auth/refresh', { refresh_token: token });
  return data;
}

export async function getMe() {
  const { data } = await client.get('/auth/me');
  return data;
}
