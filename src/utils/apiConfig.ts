export const API_CONFIG = {
  // Uses environment variable for flexibility, falls back to localhost for local development
  baseURL: 'http://localhost:3000',

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

/**
 * Wrapper around fetch that targets the API base URL, attaches the
 * Authorization header (from localStorage) and JSON content-type, and
 * throws a readable error when the response is not ok.
 *
 * @param endpoint - The API endpoint (e.g., '/api/v1/mitras')
 * @param options - Standard fetch options (method, body, etc.)
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(getApiUrl(endpoint), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return (body?.data ?? body) as T;
};
