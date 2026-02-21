// src/services/api/axios.ts
import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is missing. Add it to .env.local');
}

const TOKEN_KEY = 'access_token';

//  single source of truth: event name exported (dipakai hook lain)
export const AUTH_TOKEN_EVENT = 'foody-auth-token';

const emitAuthTokenChanged = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_TOKEN_EVENT));
};

export const authTokenStorage = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;

    return (
      window.localStorage.getItem(TOKEN_KEY) ??
      window.sessionStorage.getItem(TOKEN_KEY)
    );
  },

  set: (token: string, rememberMe: boolean): void => {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(TOKEN_KEY, token);

    emitAuthTokenChanged();
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);

    emitAuthTokenChanged();
  },
};

export const api = axios.create({
  baseURL,
  //  JANGAN set Content-Type global.
  // Axios akan set otomatis untuk JSON request, dan untuk FormData dia set multipart boundary.
});

// Login/Register harus selalu public (tanpa Authorization)
const isPublicAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('/api/auth/login') || url.includes('/api/auth/register');
};

type AxiosHeadersInstance = InstanceType<typeof AxiosHeaders>;

const ensureAxiosHeaders = (
  headers: InternalAxiosRequestConfig['headers']
): AxiosHeadersInstance => {
  if (headers instanceof AxiosHeaders) return headers;
  return new AxiosHeaders(headers);
};

api.interceptors.request.use((config) => {
  const headers = ensureAxiosHeaders(config.headers);

  //  If sending FormData, do NOT force JSON content-type.
  // Let axios/browser set multipart boundary correctly.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    headers.delete('Content-Type');
    headers.delete('content-type');
  }

  //  CRITICAL: jangan pernah kirim Authorization untuk login/register
  if (isPublicAuthEndpoint(config.url)) {
    headers.delete('Authorization');
    headers.delete('authorization');
    config.headers = headers;
    return config;
  }

  const token = authTokenStorage.get();
  if (!token) {
    config.headers = headers;
    return config;
  }

  const hasAuth = headers.has('Authorization') || headers.has('authorization');
  if (!hasAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  config.headers = headers;
  return config;
});
