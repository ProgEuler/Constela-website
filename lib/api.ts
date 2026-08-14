/**
 * Centralized API client for the admin dashboard.
 * Reads the JWT token from localStorage and attaches it to every request.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401) {
    // Clear stale token and redirect to login, unless this is the login endpoint itself
    if (typeof window !== "undefined" && !path.includes("/login/")) {
      localStorage.removeItem("admin_access_token");
      window.location.href = "/login";
    }
    
    // For login failures, extract the error message if possible
    let msg = "Unauthorized";
    try {
      const body = await res.json();
      msg = body?.detail ?? body?.error ?? body?.message ?? msg;
    } catch {}
    throw new ApiError(401, msg);
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.detail ?? body?.error ?? body?.message ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

// ── GET ───────────────────────────────────────────────────────────────────
export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────
export function setToken(token: string) {
  localStorage.setItem("admin_access_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_access_token");
}

export function hasToken(): boolean {
  return !!getToken();
}
