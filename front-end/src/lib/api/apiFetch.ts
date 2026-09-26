/**
 * Shared API fetch utility
 * Wraps native fetch with CSRF header and common configuration
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Enhanced fetch for API calls. Automatically adds:
 * - X-Requested-With header (CSRF protection)
 * - credentials: 'include' (cookie auth)
 * - Content-Type: application/json (when body is a string)
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;

  const headers = new Headers(options.headers);

  // CSRF protection header — always set
  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  // Default Content-Type for JSON bodies — skip for FormData (browser sets it with boundary)
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * Helper for GET requests
 */
export function apiGet(path: string, headers?: HeadersInit): Promise<Response> {
  return apiFetch(path, { method: 'GET', headers });
}

/**
 * Helper for POST requests with JSON body
 */
export function apiPost(path: string, body?: unknown, headers?: HeadersInit): Promise<Response> {
  return apiFetch(path, {
    method: 'POST',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PUT requests with JSON body
 */
export function apiPut(path: string, body?: unknown, headers?: HeadersInit): Promise<Response> {
  return apiFetch(path, {
    method: 'PUT',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for PATCH requests with JSON body
 */
export function apiPatch(path: string, body?: unknown, headers?: HeadersInit): Promise<Response> {
  return apiFetch(path, {
    method: 'PATCH',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export function apiDelete(path: string, headers?: HeadersInit): Promise<Response> {
  return apiFetch(path, { method: 'DELETE', headers });
}

/**
 * Helper for POST requests with FormData body (multipart/form-data).
 * Do NOT set Content-Type — the browser sets it with the correct boundary.
 */
export function apiPostFormData(path: string, formData: FormData): Promise<Response> {
  return apiFetch(path, { method: 'POST', body: formData });
}

/**
 * Helper for PUT requests with FormData body (multipart/form-data).
 */
export function apiPutFormData(path: string, formData: FormData): Promise<Response> {
  return apiFetch(path, { method: 'PUT', body: formData });
}
