const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

/**
 * Sanitize and normalize the configured API base URL.
 * - Trims whitespace
 * - Removes trailing slash
 * - Returns empty string to indicate "same-origin" relative paths
 */
// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Return the resolved API base URL for the backend API. */
  const raw = (process.env.REACT_APP_API_BASE_URL || "").trim();
  if (!raw) return "";
  // remove trailing slash if present
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

/**
 * Join base and path safely, ensuring there is exactly one slash between them.
 */
function joinUrl(base, path) {
  const p = typeof path === "string" ? path.trim() : "";
  if (!base) {
    // No base => relative URL
    return p.startsWith("/") ? p : `/${p}`;
  }
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const pp = p.startsWith("/") ? p : `/${p}`;
  return `${b}${pp}`;
}

/**
 * Core request wrapper with:
 * - JSON handling
 * - Graceful error parsing
 * - Credentials include (for cookie-based sessions)
 * - AbortController-based timeout (default 15s)
 */
async function request(path, { method = "GET", body, headers, signal, timeoutMs = 15000 } = {}) {
  const url = joinUrl(getApiBaseUrl(), path);

  // Merge signals: if caller provides a signal, abort our controller as well.
  const controller = new AbortController();
  let timeoutId;
  if (signal) {
    // Propagate external abort to our controller
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  // Auto-timeout
  if (timeoutMs && Number.isFinite(timeoutMs) && timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const opts = {
    method,
    headers: {
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    signal: controller.signal,
    credentials: "include", // allow cookies if backend uses sessions
  };

  try {
    const res = await fetch(url, opts);
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      let errorDetail = "";
      try {
        if (contentType.includes("application/json")) {
          const data = await res.json();
          errorDetail = data?.message || JSON.stringify(data);
        } else {
          errorDetail = await res.text();
        }
      } catch (_) {
        // ignore parse error
      }
      const err = new Error(`API ${method} ${path} failed: ${res.status} ${res.statusText} ${errorDetail}`.trim());
      err.status = res.status;
      throw err;
    }

    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } catch (err) {
    // Normalize network/abort errors
    if (err?.name === "AbortError") {
      const e = new Error(`API ${method} ${path} aborted due to timeout or cancellation`);
      e.code = "ABORT_ERR";
      throw e;
    }
    const e = new Error(`Network error contacting API at ${url}: ${err?.message || String(err)}`);
    e.cause = err;
    throw e;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/**
 * Generic HTTP helpers
 */
// PUBLIC_INTERFACE
export function get(path, options = {}) {
  /** Perform a GET request to the backend API. */
  return request(path, { method: "GET", ...options });
}

// PUBLIC_INTERFACE
export function post(path, body, options = {}) {
  /** Perform a POST request to the backend API. */
  return request(path, { method: "POST", body, ...options });
}

// PUBLIC_INTERFACE
export function patch(path, body, options = {}) {
  /** Perform a PATCH request to the backend API. */
  return request(path, { method: "PATCH", body, ...options });
}

// PUBLIC_INTERFACE
export function del(path, options = {}) {
  /** Perform a DELETE request to the backend API. */
  return request(path, { method: "DELETE", ...options });
}

/**
 * Upload/replace an expense receipt via multipart/form-data
 * The file parameter should be a File object from an <input type="file" />.
 */
// PUBLIC_INTERFACE
export function uploadReceipt(expenseId, file, options = {}) {
  /** Upload a receipt file for the given expense ID. */
  const form = new FormData();
  form.append("file", file);
  return request(`/expenses/${expenseId}/receipt`, { method: "POST", body: form, ...options });
}

// PUBLIC_INTERFACE
export function deleteReceipt(expenseId, options = {}) {
  /** Delete the receipt for the given expense ID. */
  return request(`/expenses/${expenseId}/receipt`, { method: "DELETE", ...options });
}

// PUBLIC_INTERFACE
export function getReceiptUrl(expenseId) {
  /** Build the absolute URL for viewing/downloading a receipt for the given expense ID. */
  return joinUrl(getApiBaseUrl(), `/expenses/${expenseId}/receipt`);
}

export default {
  getApiBaseUrl,
  get,
  post,
  patch,
  del,
  uploadReceipt,
  deleteReceipt,
  getReceiptUrl,
};
