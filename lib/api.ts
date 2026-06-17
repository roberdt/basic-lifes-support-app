// lib/api.ts — central API helper for fetch

import { getToken } from './session';


const API_BASE = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080');

/**************************************************
 * FetchOptions
 * Defines the structure of the options object that can be passed to the apiFetch function,
 * including HTTP method, request body, headers, credentials, and any additional properties
 **************************************************/
export interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  [key: string]: unknown;
}

/**************************************************
 * FetchResult
 * Defines the structure of the result returned by the apiFetch function, including a boolean indicating success,
 **************************************************/
export interface FetchResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

/**************************************************
 * apiFetch()
 * A helper function to perform API requests to the backend server.
 * Automatically includes the JWT token in the Authorization header if it exists.
 * Handles JSON request bodies and responses, and returns a structured result object.
 **************************************************/
export async function apiFetch<T = unknown>(
  path: string,
  { method = 'GET', body, headers = {}, credentials, ...rest }: FetchOptions = {}
): Promise<FetchResult<T>> {
  const token = getToken();
  const url = `${API_BASE}${path}`;

  const allHeaders = new Headers(headers as HeadersInit);
  if (!allHeaders.get('Content-Type')) allHeaders.set('Content-Type', 'application/json');
  if (token) allHeaders.set('Authorization', 'Bearer ' + token);

  const res = await fetch(url, {
    method,
    headers: allHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials,
    ...(rest as RequestInit),
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { ok: res.ok, status: res.status, data: data as T };
}

export default { apiFetch, getToken };

