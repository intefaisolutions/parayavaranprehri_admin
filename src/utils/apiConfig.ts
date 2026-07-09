export const API_CONFIG = {
  // Uses environment variable for flexibility, falls back to localhost for local development
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
  
  timeout: 10000,
};

/**
 * Utility function to get the full API URL for a given endpoint.
 * Ensures there are no double slashes between the base URL and the endpoint.
 * 
 * @param endpoint - The API endpoint (e.g., '/users', 'auth/login')
 * @returns The complete URL string
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${baseUrl}/${path}`;
};
