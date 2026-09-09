import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--kh-bg)] text-[var(--kh-text)]">
      <header className="border-b border-[var(--kh-border)] bg-[var(--kh-bg-soft)]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="font-extrabold text-[var(--kh-primary)]">
            Konnect House
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link
              to="/"
              className="text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)]"
            >
              Accueil
            </Link>
            {user ? (
              <>
                <Link
                  to="/proprietaire"
                  className="text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)]"
                >
                  Mes biens
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/proprietaire/connexion"
                className="text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)]"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
