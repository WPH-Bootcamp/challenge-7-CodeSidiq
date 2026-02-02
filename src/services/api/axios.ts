import axios, { AxiosHeaders } from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is missing. Add it to .env.local');
}

const TOKEN_KEY = 'access_token';

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

    // Avoid stale token bug: clear both first
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);

    const storage = rememberMe ? window.localStorage : window.sessionStorage;
    storage.setItem(TOKEN_KEY, token);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
  },
};

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = authTokenStorage.get();
  if (!token) return config;

  // Axios v1: config.headers is AxiosHeaders (not plain object)
  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  // Don't override if already set
  const hasAuth =
    config.headers.has('Authorization') || config.headers.has('authorization');

  if (!hasAuth) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});
