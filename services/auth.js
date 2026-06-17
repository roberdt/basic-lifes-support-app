import { apiFetch, setToken } from '../lib/api';

export async function login(username, password, recaptchaToken) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, recaptchaToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Login failed (${res.status})`);
  }
  if (data.token) setToken(data.token);
  return data;
}

export async function logout() {
  setToken(null);
}

export async function register(payload) {
  // POST to /api/register to match backend mapping
  // Payload should be: { username, firstName, lastName, email, password }
  const { ok, data } = await apiFetch('/api/register', { method: 'POST', body: payload });
  if (!ok) throw new Error(data?.message || 'Registration failed');
  return data;
}

export default { login, logout, register };

