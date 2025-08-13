const DEFAULT_BASE_URL = '';

/**
 * Resolve API base URL from environment variables.
 * REACT_APP_API_BASE_URL should be provided in the environment (.env).
 */
// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Return the resolved API base URL for the backend API. */
  return process.env.REACT_APP_API_BASE_URL || DEFAULT_BASE_URL;
}

async function request(path, { method = 'GET', body, headers, signal } = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const opts = {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    signal,
    credentials: 'include', // allow cookies if backend uses sessions
  };

  const res = await fetch(url, opts);
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errorDetail = '';
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json();
        errorDetail = data?.message || JSON.stringify(data);
      } else {
        errorDetail = await res.text();
      }
    } catch (_) {
      // ignore parse error
    }
    const err = new Error(`API ${method} ${path} failed: ${res.status} ${res.statusText} ${errorDetail}`);
    err.status = res.status;
    throw err;
  }

  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

/**
 * Generic HTTP helpers
 */
// PUBLIC_INTERFACE
export function get(path, options = {}) {
  /** Perform a GET request to the backend API. */
  return request(path, { method: 'GET', ...options });
}

// PUBLIC_INTERFACE
export function post(path, body, options = {}) {
  /** Perform a POST request to the backend API. */
  return request(path, { method: 'POST', body, ...options });
}

// PUBLIC_INTERFACE
export function patch(path, body, options = {}) {
  /** Perform a PATCH request to the backend API. */
  return request(path, { method: 'PATCH', body, ...options });
}

// PUBLIC_INTERFACE
export function del(path, options = {}) {
  /** Perform a DELETE request to the backend API. */
  return request(path, { method: 'DELETE', ...options });
}

/**
 * Upload/replace an expense receipt via multipart/form-data
 * The file parameter should be a File object from an <input type="file" />.
 */
// PUBLIC_INTERFACE
export function uploadReceipt(expenseId, file, options = {}) {
  /** Upload a receipt file for the given expense ID. */
  const form = new FormData();
  form.append('file', file);
  return request(`/expenses/${expenseId}/receipt`, { method: 'POST', body: form, ...options });
}

export default {
  getApiBaseUrl,
  get,
  post,
  patch,
  del,
  uploadReceipt,
};
