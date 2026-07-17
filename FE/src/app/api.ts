import { supabase } from "@/lib/supabase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const { headers: callerHeaders, ...restOptions } = options || {};
  const res = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers: { "Content-Type": "application/json", ...authHeaders, ...callerHeaders },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    // FastAPI 422 returns detail as an array of {loc, msg, type} objects
    const detail = err.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join("; "));
    }
    throw new Error(typeof detail === "string" ? detail : `API error ${res.status}`);
  }
  return res.json();
}

export async function apiPostForm<T = unknown>(
  path: string,
  formData: FormData
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: { ...authHeaders },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    // FastAPI 422 returns detail as an array of {loc, msg, type} objects
    const detail = err.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg?: string }) => d.msg ?? JSON.stringify(d)).join("; "));
    }
    throw new Error(typeof detail === "string" ? detail : `API error ${res.status}`);
  }
  return res.json();
}

export { API_BASE };
