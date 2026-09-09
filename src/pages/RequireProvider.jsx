import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireProvider() {
  const { token, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--kh-text-muted)]">
        Chargement…
      </div>
    );
  }
  if (!token) return <Navigate to="/proprietaire/connexion" replace />;
  if (user && user.role !== "PROVIDER" && user.role !== "ADMIN") {
    return <Navigate to="/proprietaire/connexion" replace />;
  }
  return <Outlet />;
}
