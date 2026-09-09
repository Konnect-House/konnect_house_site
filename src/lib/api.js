const BASE = String(
  import.meta.env.VITE_API_URL ??
    "https://konnect-house-backend-mpmh.onrender.com",
).replace(/\/$/, "");

export function apiUrl(path) {
  return `${BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
}

export async function api(path, { token, method = "GET", body } = {}) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = data.message ?? data.error ?? `Erreur ${res.status}`;
    throw new Error(Array.isArray(raw) ? raw.join(" ") : String(raw));
  }
  return data;
}
