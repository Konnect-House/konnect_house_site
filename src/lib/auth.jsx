import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const KEY = "kh_provider_token";
const USER_KEY = "kh_provider_user";
const AuthContext = createContext(null);

function readCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCachedUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore quota */
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || "");
  const [user, setUser] = useState(() =>
    localStorage.getItem(KEY) ? readCachedUser() : null,
  );
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(KEY)));

  useEffect(() => {
    if (!token) {
      setUser(null);
      writeCachedUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api("/auth/me", { token })
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        writeCachedUser(data);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only clear session on real auth rejection — never on network / 5xx / outage.
        const status = err?.status ?? 0;
        if (status === 401 || status === 403) {
          localStorage.removeItem(KEY);
          writeCachedUser(null);
          setToken("");
          setUser(null);
        }
        // Keep token + cached user on temporary API failures so refresh stays logged in.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isProvider: user?.role === "PROVIDER",
      async login(email, password) {
        const res = await api("/auth/login", {
          method: "POST",
          body: { email, password },
        });
        localStorage.setItem(KEY, res.token);
        writeCachedUser(res.data);
        setToken(res.token);
        setUser(res.data);
        return res;
      },
      async googleProvider(credential) {
        const res = await api("/auth/google/provider", {
          method: "POST",
          body: { credential },
        });
        localStorage.setItem(KEY, res.token);
        writeCachedUser(res.data);
        setToken(res.token);
        setUser(res.data);
        return res;
      },
      async completeOnboarding(payload) {
        const data = await api("/auth/provider/onboarding", {
          token,
          method: "PATCH",
          body: payload,
        });
        writeCachedUser(data);
        setUser(data);
        return data;
      },
      async updateProfile(payload) {
        const data = await api("/auth/provider/profile", {
          token,
          method: "PATCH",
          body: payload,
        });
        writeCachedUser(data);
        setUser(data);
        return data;
      },
      logout() {
        localStorage.removeItem(KEY);
        writeCachedUser(null);
        setToken("");
        setUser(null);
      },
    }),
    [token, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
