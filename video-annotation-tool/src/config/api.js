export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://annotationsvideo-production.up.railway.app/api';

export const isProduction = import.meta.env.PROD;