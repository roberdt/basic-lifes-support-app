import { apiFetch } from '@/lib/api';

/**************************************************
 * LoginResponse
 * Defines the structure of the response returned by the login function,
 * which may include a token, user information, and other relevant data
 **************************************************/
interface LoginResponse {
  token?: string;
  user?: Record<string, unknown>;
  userId?: string;
  USER_ID?: string;
  username?: string;
  message?: string;
  [key: string]: unknown;
}

/**************************************************
 * login()
 * Sends a POST request to the /auth/login endpoint with the provided username and password
 * Returns a Promise that resolves to a LoginResponse object containing the token and user info on success
 * Throws an error with a message if the login fails
 **************************************************/
export async function login(username: string, password: string): Promise<LoginResponse> {
  const { ok, status, data } = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  });

  if (!ok) {
    throw new Error((data as LoginResponse)?.message || `Login failed (${status})`);
  }
  return data as LoginResponse;
}

/**************************************************
 * logout()
 * Clears the user session by removing any stored session data (e.g., JWT) from sessionStorage
 * This function does not return any value and is used to log the user out of the application
 **************************************************/
export async function logout(): Promise<void> {
  return;
}

/**************************************************
 * RegisterPayload
 * Defines the structure of the payload required for user registration, including username, first name, last name, email, and password
 **************************************************/
export interface RegisterPayload {
  fullname: string;
  emailAddress: string;
  companyName: string;
  password: string;
  verifyPassword?: string;
  purpose: string;
}

/**************************************************
 * RegisterResponse
 * Defines the structure of the response returned by the register function, which may include a success message and other relevant data
 **************************************************/
interface RegisterResponse {
  message?: string;
  [key: string]: unknown;
}

/**************************************************
 * register()
 * Accepts a RegisterPayload object containing the user's registration details
 * Sends a POST request to the /auth/register endpoint with the provided registration payload
 * Returns a Promise that resolves to a RegisterResponse object containing a success message on successful registration
 * Throws an error with a message if the registration fails
 **************************************************/
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { ok, data } = await apiFetch<RegisterResponse>('/api/register', {
    method: 'POST',
    body: payload,
  });
  if (!ok) throw new Error((data as RegisterResponse)?.message || 'Registration failed');
  return data as RegisterResponse;
}


