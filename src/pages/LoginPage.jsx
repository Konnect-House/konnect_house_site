import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

export default function LoginPage() {
  const { login, logout, token, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && token && (user?.role === "PROVIDER" || user?.role === "ADMIN")) {
    return <Navigate to="/proprietaire" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await login(email, password);
      if (res.data?.role !== "PROVIDER" && res.data?.role !== "ADMIN") {
        logout();
        setError("Cet espace est réservé aux propriétaires.");
        return;
      }
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-[var(--kh-primary)]">
        Espace propriétaire
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Connectez-vous pour publier et gérer vos maisons de passage.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldClass}
        />
        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
        >
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-sm text-[var(--kh-text-muted)]">
        Pas encore de compte ?{" "}
        <Link
          to="/proprietaire/inscription"
          className="font-semibold text-[var(--kh-blue-2)]"
        >
          Créer un compte propriétaire
        </Link>
      </p>
    </main>
  );
}
