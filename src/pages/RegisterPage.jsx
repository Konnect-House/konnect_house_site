import { useCallback, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import GoogleButton from "../components/GoogleButton";
import { useAuth } from "../lib/auth";

export default function RegisterPage() {
  const { googleProvider, token, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const afterAuth = useCallback(
    (res) => {
      if (res.data?.role !== "PROVIDER" && res.data?.role !== "ADMIN") {
        logout();
        setError("Cet espace est réservé aux propriétaires.");
        return;
      }
      navigate(
        res.data?.needsOnboarding ? "/proprietaire/onboarding" : "/proprietaire",
        { replace: true },
      );
    },
    [logout, navigate],
  );

  const onCredential = useCallback(
    async (credential) => {
      setError("");
      setBusy(true);
      try {
        const res = await googleProvider(credential);
        afterAuth(res);
      } catch (err) {
        setError(err.message || "Connexion Google impossible.");
      } finally {
        setBusy(false);
      }
    },
    [afterAuth, googleProvider],
  );

  if (!loading && token && (user?.role === "PROVIDER" || user?.role === "ADMIN")) {
    return (
      <Navigate
        to={user?.needsOnboarding ? "/proprietaire/onboarding" : "/proprietaire"}
        replace
      />
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-[var(--kh-primary)]">
        Devenir partenaire
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Inscrivez-vous avec Gmail. Vous compléterez ensuite votre profil
        (WhatsApp, paiements) avant validation par un administrateur.
      </p>
      <div className="mt-8 space-y-4">
        <GoogleButton onCredential={onCredential} disabled={busy} />
        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <p className="mt-6 text-sm text-[var(--kh-text-muted)]">
        Déjà inscrit ?{" "}
        <Link
          to="/proprietaire/connexion"
          className="font-semibold text-[var(--kh-blue-2)]"
        >
          Se connecter
        </Link>
      </p>
    </main>
  );
}
