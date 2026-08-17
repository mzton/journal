/**
 * utils/api.ts
 * ----------------------------------------------------------------------------
 * Typed client for the Railway backend. This is the single place the SPA talks
 * to the server: it attaches the JWT, unwraps JSON, and turns non-2xx
 * responses into thrown Errors (so callers can keep using try/catch exactly
 * like the old localStorage code did).
 *
 * Wiring plan: AuthContext, TradeContext, and screenshotStore call into here
 * instead of localStorage/IndexedDB. Everything else in the app is unchanged.
 *
 * Requires VITE_API_URL (see .env.example), e.g. https://your-api.up.railway.app
 * ----------------------------------------------------------------------------
 */

import type { PublicUser, Trade, TradeFormValues } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
const TOKEN_KEY = 'tj_token';

if (!BASE_URL) {
  // Surfaced at startup rather than as a confusing network error later.
  console.warn('[api] VITE_API_URL is not set — API calls will fail.');
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Core fetch wrapper: base URL, auth header, JSON parsing, error surfacing. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 204) return undefined as T;
  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;

  if (!res.ok) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  auth: {
    signup(name: string, email: string, password: string) {
      return request<{ token: string; user: PublicUser }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    },
    login(email: string, password: string) {
      return request<{ token: string; user: PublicUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    me() {
      return request<{ user: PublicUser }>('/auth/me');
    },
  },

  trades: {
    list() {
      return request<{ trades: Trade[] }>('/trades');
    },
    create(values: TradeFormValues, screenshotIds: string[]) {
      return request<{ trade: Trade }>('/trades', {
        method: 'POST',
        body: JSON.stringify({ ...values, screenshotIds }),
      });
    },
    update(id: string, values: TradeFormValues, screenshotIds: string[]) {
      return request<{ trade: Trade }>(`/trades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ ...values, screenshotIds }),
      });
    },
    remove(id: string) {
      return request<void>(`/trades/${id}`, { method: 'DELETE' });
    },
  },

  screenshots: {
    async upload(file: File): Promise<string> {
      const form = new FormData();
      form.append('file', file);
      const { id } = await request<{ id: string }>('/screenshots', {
        method: 'POST',
        body: form,
      });
      return id;
    },
    /** Fetch the image with auth and return a blob: URL (revoke it when done). */
    async objectUrl(id: string): Promise<string | null> {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/screenshots/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) return null;
      return URL.createObjectURL(await res.blob());
    },
    remove(id: string) {
      return request<void>(`/screenshots/${id}`, { method: 'DELETE' });
    },
  },
};
