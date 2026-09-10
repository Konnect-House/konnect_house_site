import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const KEY = "kh_provider_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    api("/auth/me", { token })
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(KEY);
          setToken("");
          setUser(null);
        }
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
        setUser(data);
        return data;
      },
      async updateProfile(payload) {
        const data = await api("/auth/provider/profile", {
          token,
          method: "PATCH",
          body: payload,
        });
        setUser(data);
        return data;
      },
      logout() {
        localStorage.removeItem(KEY);
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
