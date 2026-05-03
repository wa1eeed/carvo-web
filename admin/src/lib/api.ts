const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('carvo_admin_token') || '';
}
export function setToken(t: string) {
  localStorage.setItem('carvo_admin_token', t);
}
export function clearToken() {
  localStorage.removeItem('carvo_admin_token');
}

async function req<T>(method: string, path: string, body?: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

export const api = {
  get: <T>(p: string) => req<T>('GET', p),
  post: <T>(p: string, b?: any) => req<T>('POST', p, b),
  put: <T>(p: string, b?: any) => req<T>('PUT', p, b),
  del: <T>(p: string) => req<T>('DELETE', p),
};

export { API_BASE };
