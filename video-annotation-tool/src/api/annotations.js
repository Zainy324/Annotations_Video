const API_URL = 'http://localhost:5000/api/annotations';

export const fetchAnnotations = async (videoId) => {
  const response = await fetch(`${API_URL}/${videoId}`);
  return await response.json();
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