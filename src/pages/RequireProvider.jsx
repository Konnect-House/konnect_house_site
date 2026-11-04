import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireProvider() {
  const { token, loading, user } = useAuth();
  const location = useLocation();

  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 bg-[var(--kh-bg)]">
        <div
          className="h-10 w-10 rounded-full border-4 border-[var(--kh-blue-2)] border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-sm font-semibold text-[var(--kh-primary)]">
          Connexion en cours…
        </p>
      </div>
    );
  }

  if (!token) {
    const next = encodeURIComponent(
      `${location.pathname}${location.search || ""}`,
    );
    return <Navigate to={`/?auth=connexion&next=${next}`} replace />;
  }

  // Token présent mais /auth/me n’a pas encore renvoyé l’utilisateur
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[var(--kh-text-muted)]">
          Session en cours de vérification…
        </p>
        <button
          type="button"
          className="text-sm font-semibold text-[var(--kh-blue-2)]"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (user.role !== "PROVIDER") {
    return <Navigate to="/?auth=connexion" replace />;
  }

  return <Outlet />;
}
