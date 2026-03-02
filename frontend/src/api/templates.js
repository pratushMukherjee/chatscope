import client from './client';

export async function getTemplates() {
  const { data } = await client.get('/templates');
  return data;
}

export async function createTemplate(templateData) {
  const { data } = await client.post('/templates', templateData);
  return data;
}

export async function deleteTemplate(id) {
  await client.delete(`/templates/${id}`);
}
