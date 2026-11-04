import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function NewPropertyPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(payload, formError) {
    if (formError) {
      setError(formError);
      return;
    }
    setError("");
    if (user?.status === "PENDING") {
      setError("Votre compte n’est pas encore validé par un administrateur.");
      return;
    }
    setBusy(true);
    try {
      await api("/properties", { token, method: "POST", body: payload });
      navigate("/proprietaire/gestion", { replace: true });
    } catch (err) {
      setError(err.message || "Publication impossible.");
    } finally {
      setBusy(false);
    }
  }

  if (user?.status === "PENDING") {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/proprietaire/gestion"
          className="text-sm font-semibold text-[var(--kh-blue-2)]"
        >
          ← Mes logements
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-[var(--kh-primary)]">
          Compte en attente
        </h1>
        <p className="mt-2 text-[var(--kh-text-muted)]">
          Votre compte n’est pas encore validé par un administrateur. Vous
          pourrez publier un logement dès l’activation.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to="/proprietaire/gestion"
        className="text-sm font-semibold text-[var(--kh-blue-2)]"
      >
        ← Mes logements
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-[var(--kh-primary)]">
        Nouveau logement
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Après envoi, le bien passe en vérification jusqu’à validation Konnect
        House.
      </p>
      <div className="mt-8">
        <PropertyForm
          submitLabel="Soumettre le logement"
          busy={busy}
          error={error}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
