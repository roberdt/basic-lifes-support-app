import { apiFetch, setToken } from '../lib/api';

export async function login(username, password) {
  // Send friendly field names expected by the backend
  const { ok, status, data } = await apiFetch('/auth/login', { method: 'POST', body: { username, password } });
  if (!ok) {
    throw new Error(data?.message || `Login failed (${status})`);
  }
  // Assume backend returns { token, user }
  if (data.token) setToken(data.token);
  return data;
}

export async function logout() {
  setToken(null);
}

export async function register(payload) {
  // POST to /api/register to match backend mapping
  // Payload should be: { username, firstName, lastName, email, password }
  const { ok, data } = await apiFetch('/auth/register', { method: 'POST', body: payload });
  if (!ok) throw new Error(data?.message || 'Registration failed');
  return data;
}

export default { login, logout, register };

