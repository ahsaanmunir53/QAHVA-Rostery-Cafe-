/* Where the API lives.
 *
 * In production the backend serves this build, so the API is on the same origin
 * and a bare '/api/...' path is correct. The old default of
 * 'http://localhost:5003' got baked into the bundle at build time, which meant
 * every visitor's browser tried to reach a server on their own machine — and on
 * an https:// site the browser blocks plain http:// anyway. That is why the menu
 * came back empty.
 *
 * In development, Vite proxies /api to the backend (see vite.config.ts), so this
 * same empty default works there too. VITE_API_URL is only needed if you ever
 * host the frontend and backend on separate domains.
 */
export const API_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const TOKEN_KEY = 'qahva_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export type ApiResult<T> = { ok: boolean; status: number; data: T };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  admin = false,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (admin) headers['Authorization'] = `Bearer ${getToken()}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Server unreachable. Return a result instead of throwing, so callers that
    // do `.then(r => r.ok && ...)` show an empty state rather than dying on an
    // unhandled rejection.
    return { ok: false, status: 0, data: { error: 'Could not reach the server.' } as T };
  }

  const data = (await res.json().catch(() => ({}))) as T;

  // A rejected token must be dropped here. Leaving it in localStorage sends the
  // admin router back to the dashboard, which 401s again — the redirect loop.
  if (admin && res.status === 401) clearToken();

  return { ok: res.ok, status: res.status, data };
}

export const apiGet = <T,>(path: string) => request<T>('GET', path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>('POST', path, body);
export const adminGet = <T,>(path: string) => request<T>('GET', path, undefined, true);
export const adminPost = <T,>(path: string, body: unknown) => request<T>('POST', path, body, true);
export const adminPatch = <T,>(path: string, body: unknown) => request<T>('PATCH', path, body, true);
export const adminDelete = <T,>(path: string) => request<T>('DELETE', path, undefined, true);
