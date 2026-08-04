const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://admin.paryavaranprahri.com';

/**
 * Env may be either a bare origin or include a trailing `/api`.
 * Call sites already use `/api/v1/...`, so strip a trailing `/api`
 * to avoid `/api/api/v1/...`.
 */
const resolveApiBaseUrl = (): string => {
  const raw =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    DEFAULT_API_BASE_URL;

  return raw
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '');
};

export const API_CONFIG = {
  // Bare server origin — call sites pass "/api/v1/...".
  // Primary: VITE_API_URL (e.g. https://admin.paryavaranprahri.com/api/)
  baseURL: resolveApiBaseUrl(),

  appName:
    (import.meta.env.VITE_APP_NAME as string | undefined) ||
    'Paryavaran Prahri Admin',

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

// Endpoints that must never trigger a token-refresh-and-retry cycle
// (refreshing itself, or unauthenticated auth flows).
const AUTH_ENDPOINTS_TO_SKIP_REFRESH = [
  '/api/v1/auth/refresh',
  '/api/v1/auth/login',
  '/api/v1/auth/otp/request',
  '/api/v1/auth/otp/verify',
];

let refreshPromise: Promise<string | null> | null = null;

/** Calls the refresh endpoint once, sharing the in-flight promise across
 * concurrent 401s so we don't fire multiple refresh requests at once. */
const getRefreshedAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;
      try {
        const res = await fetch(getApiUrl('/api/v1/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const data = body?.data ?? body;
        if (!data?.accessToken) return null;
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        return data.accessToken as string;
      } catch {
        return null;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

/** Clears the session and sends the user back to the login screen. */
const forceLogout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * Wrapper around fetch that targets the API base URL, attaches the
 * Authorization header (from localStorage) and JSON content-type, and
 * throws a readable error when the response is not ok.
 *
 * If the access token has expired (401), it transparently refreshes it
 * using the stored refresh token and retries the request once. If the
 * refresh itself fails, the session is cleared and the user is redirected
 * to the login page instead of looping on repeated 401s.
 *
 * @param endpoint - The API endpoint (e.g., '/api/v1/mitras')
 * @param options - Standard fetch options (method, body, etc.)
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  _isRetry = false
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
    if (
      res.status === 401 &&
      !_isRetry &&
      !AUTH_ENDPOINTS_TO_SKIP_REFRESH.some((skip) => endpoint.includes(skip))
    ) {
      const newToken = await getRefreshedAccessToken();
      if (newToken) {
        return apiFetch<T>(endpoint, options, true);
      }
      forceLogout();
    }

    const message = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return (body?.data ?? body) as T;
};

/**
 * Wrapper around fetch (mirrors apiFetch) for endpoints where the caller also
 * needs the pagination `meta` (specifically `meta.total`), not just the plain
 * items array that apiFetch returns. Used by dashboard-style stat widgets.
 *
 * Falls back to `items.length` as the total when the backend endpoint has no
 * pagination meta (e.g. list endpoints that return a plain array).
 *
 * @param endpoint - The API endpoint (e.g., '/api/v1/persons?limit=1')
 */
export const apiFetchMeta = async <T = any>(
  endpoint: string,
): Promise<{ items: T[]; total: number }> => {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(getApiUrl(endpoint), {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = body?.message || body?.error || `Request failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  const items = (body?.data ?? []) as T[];
  const total = body?.meta?.total ?? (Array.isArray(items) ? items.length : 0);
  return { items, total };
};

export interface UploadResult {
  /** Permanent S3 object URL — persist this in the database / form state. */
  url: string;
  /** Temporary signed GET URL — use for <img src> preview. */
  signedUrl: string;
  key: string;
  bucket?: string;
}

/**
 * Uploads a single file (image/PDF) to the backend, which stores it in S3
 * and returns a permanent `url` plus a temporary `signedUrl` for preview.
 *
 * @param file - The File object (e.g. from an <input type="file"> change event)
 * @param category - S3 folder category: 'users' | 'certificates' | 'trees' | 'documents' | 'general'
 */
export const apiUpload = async (
  file: File,
  category: 'users' | 'certificates' | 'trees' | 'documents' | 'general' = 'general',
  _isRetry = false
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
    if (res.status === 401 && !_isRetry) {
      const newToken = await getRefreshedAccessToken();
      if (newToken) {
        return apiUpload(file, category, true);
      }
      forceLogout();
    }

    const message = body?.message || body?.error || `Upload failed (${res.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return (body?.data ?? body) as UploadResult;
};
