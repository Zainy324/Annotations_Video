import { API_BASE_URL } from '../config/api';

export const fetchAnnotations = async (videoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/annotations/${videoId}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching annotations:', error);
    throw error;
  }
};

export const createAnnotation = async (annotation) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(annotation)
  });
  return await response.json();
};

export const updateAnnotation = async (id, updates) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await response.json();
};

export const deleteAnnotation = async (id) => {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};