const BASE = String(
  import.meta.env.VITE_API_URL ??
    "https://konnect-house-backend-production.up.railway.app",
).replace(/\/$/, "");

export function apiUrl(path) {
  return `${BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api(path, { token, method = "GET", body } = {}) {
  let res;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    const aborted = err?.name === "AbortError" || /aborted/i.test(raw);
    const network =
      aborted ||
      /load failed|failed to fetch|networkerror|network request failed/i.test(
        raw,
      );
    throw new ApiError(
      aborted
        ? "Le serveur met trop de temps à répondre. Réessayez dans un instant."
        : network
          ? "Connexion au serveur impossible. Vérifiez le réseau ou rouvrez le site dans Safari/Chrome (pas WhatsApp)."
          : raw || "Réseau indisponible",
      0,
    );
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = data.message ?? data.error ?? `Erreur ${res.status}`;
    throw new ApiError(
      Array.isArray(raw) ? raw.join(" ") : String(raw),
      res.status,
    );
  }
  return data;
}

/** Multipart upload (do not set Content-Type — browser sets boundary). */
export async function uploadFile(path, { token, file, fields = {} } = {}) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(fields).forEach(([key, value]) => {
    if (value != null) form.append(key, String(value));
  });
  let res;
  try {
    res = await fetch(apiUrl(path), {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    const network =
      /load failed|failed to fetch|networkerror|network request failed/i.test(
        raw,
      );
    throw new ApiError(
      network
        ? "Connexion au serveur impossible. Vérifiez le réseau ou rouvrez le site dans Safari/Chrome (pas WhatsApp)."
        : raw || "Réseau indisponible",
      0,
    );
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = data.message ?? data.error ?? `Erreur ${res.status}`;
    throw new ApiError(
      Array.isArray(raw) ? raw.join(" ") : String(raw),
      res.status,
    );
  }
  return data;
}
