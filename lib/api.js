// ...lib/api.js: central API helper for fetch + token management
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export function setToken(token) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem('jwt_token', token);
  else localStorage.removeItem('jwt_token');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jwt_token');
}

export async function apiFetch(path, { method = 'GET', body, headers = {}, credentials, ...rest } = {}) {
  const token = getToken();
  const url = `${API_BASE}${path}`;

  const allHeaders = new Headers(headers || {});
  if (!allHeaders.get('Content-Type')) allHeaders.set('Content-Type', 'application/json');
  if (token) allHeaders.set('Authorization', 'Bearer ' + token);

  const res = await fetch(url, {
    method,
    headers: allHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials,
    ...rest,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { ok: res.ok, status: res.status, data };
}

export default { apiFetch, setToken, getToken };

