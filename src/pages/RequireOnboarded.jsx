import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function RequireOnboarded() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--kh-text-muted)]">
        Chargement…
      </div>
    );
  }
  if (user?.role === "PROVIDER" && user.needsOnboarding) {
    return <Navigate to="/proprietaire/onboarding" replace />;
  }
  return <Outlet />;
}
