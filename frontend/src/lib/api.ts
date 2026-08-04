export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003';

const TOKEN_KEY = 'qahva_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(method: string, path: string, body?: unknown, admin = false): Promise<{ ok: boolean; status: number; data: T }> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) headers['Authorization'] = `Bearer ${getToken()}`;
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export const apiGet = <T,>(path: string) => request<T>('GET', path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>('POST', path, body);
export const adminGet = <T,>(path: string) => request<T>('GET', path, undefined, true);
export const adminPost = <T,>(path: string, body: unknown) => request<T>('POST', path, body, true);
export const adminPatch = <T,>(path: string, body: unknown) => request<T>('PATCH', path, body, true);
export const adminDelete = <T,>(path: string) => request<T>('DELETE', path, undefined, true);
