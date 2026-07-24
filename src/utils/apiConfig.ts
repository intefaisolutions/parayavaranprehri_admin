export const API_CONFIG = {
  // Points at the bare server origin (no trailing /api) since every call site
  // already passes a full "/api/v1/..." path - baseURL used to include "/api"
  // too, which produced broken "/api/api/v1/..." URLs.
  baseURL: import.meta.env.DEV
    ? 'http://localhost:3000'
    : 'https://paryavaranprahri.com',

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

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Uploads a single file (image/PDF) to the backend, which stores it in S3
 * and returns a public URL. Reusable anywhere a file needs to be uploaded.
 *
 * @param file - The File object (e.g. from an <input type="file"> change event)
 * @param category - S3 folder category: 'users' | 'certificates' | 'trees' | 'documents' | 'general'
 */
export const apiUpload = async (
  file: File,
  category: 'users' | 'certificates' | 'trees' | 'documents' | 'general' = 'general'
): Promise<UploadResult> => {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(getApiUrl(`/api/v1/uploads?category=${category}`), {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = body?.message || body?.error || `Upload failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return (body?.data ?? body) as UploadResult;
};
