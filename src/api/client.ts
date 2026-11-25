const BASE = ((import.meta.env.VITE_API_BASE as string | undefined) || "").replace(/\/+$/, "");
const TOKEN_KEY = "alwadi_token";

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

type Params = Record<string, string | number | boolean | null | undefined>;
interface Opts {
  method?: "GET" | "POST";
  params?: Params;
  body?: FormData | Record<string, unknown> | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function api<T = any>(action: string, opts: Opts = {}): Promise<T> {
  const qs = new URLSearchParams({ action });
  for (const [k, v] of Object.entries(opts.params || {})) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["X-Token"] = token;
  }
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) body = opts.body;
  else if (opts.body) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  const method = opts.method || (opts.body ? "POST" : "GET");

  let res: Response;
  try {
    res = await fetch(`${BASE}/admin_api.php?${qs.toString()}`, { method, headers, body });
  } catch {
    throw new ApiError("Network error", 0);
  }

  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { status: false, message: res.statusText || "Invalid server response" };
  }

  if (res.status === 401 && action !== "login") {
    setToken(null);
    window.dispatchEvent(new Event("auth:unauthorized"));
    throw new ApiError(json.message || "Unauthorized", 401);
  }
  if (!res.ok || json.status === false) {
    throw new ApiError(json.message || res.statusText || "Request failed", res.status);
  }
  return json as T;
}
