import { createContext, useContext, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./auth";
import OwnerAuthModal from "../components/OwnerAuthModal";

const AuthModalContext = createContext(null);

function parseMode(raw) {
  if (raw === "register" || raw === "inscription") return "register";
  if (raw === "login" || raw === "connexion") return "login";
  return null;
}

export function AuthModalProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, loading } = useAuth();
  const mode = parseMode(searchParams.get("auth"));

  function setMode(next) {
    const auth = !next
      ? null
      : next === "register"
        ? "inscription"
        : "connexion";
    if (location.pathname === "/") {
      const params = new URLSearchParams(searchParams);
      if (auth) params.set("auth", auth);
      else params.delete("auth");
      setSearchParams(params, { replace: true });
      return;
    }
    navigate(auth ? `/?auth=${auth}` : "/", { replace: true });
  }

  useEffect(() => {
    if (loading || !mode) return;
    if (token && (user?.role === "PROVIDER" || user?.role === "ADMIN")) {
      navigate(
        user.needsOnboarding ? "/proprietaire/onboarding" : "/proprietaire",
        { replace: true },
      );
    }
  }, [loading, mode, token, user, navigate]);

  const value = {
    mode,
    openLogin: () => setMode("login"),
    openRegister: () => setMode("register"),
    close: () => setMode(null),
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <OwnerAuthModal />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
