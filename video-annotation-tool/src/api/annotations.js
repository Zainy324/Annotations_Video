import { API_BASE_URL } from '../config/api';

export const fetchAnnotations = async (videoId) => {
  const response = await fetch(`${API_BASE_URL}/annotations/${videoId}`);
  if (!response.ok) throw new Error('Failed to fetch annotations');
  return await response.json();
};

export const createAnnotation = async (annotation) => {
  const response = await fetch(`${API_BASE_URL}/annotations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotation)
  });
  if (!response.ok) throw new Error('Failed to create annotation');
  return await response.json();
};

export const updateAnnotation = async (id, updates) => {
  const response = await fetch(`${API_BASE_URL}/annotations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update annotation');
  return await response.json();
};

export const deleteAnnotation = async (id) => {
  const response = await fetch(`${API_BASE_URL}/annotations/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete annotation');
  return await response.json();
};