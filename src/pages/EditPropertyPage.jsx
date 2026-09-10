import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PropertyForm from "../components/PropertyForm";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

export default function EditPropertyPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api(`/properties/mine/${id}`, { token })
      .then((data) => {
        if (!cancelled) setProperty(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Bien introuvable.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token]);

  async function onSubmit(payload, formError) {
    if (formError) {
      setError(formError);
      return;
    }
    setError("");
    setBusy(true);
    try {
      const { category: _c, ...body } = payload;
      await api(`/properties/${id}`, { token, method: "PATCH", body });
      navigate(`/proprietaire/biens/${id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-[var(--kh-text-muted)]">
        Chargement…
      </main>
    );
  }

  if (!property) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-red-500">{error || "Bien introuvable."}</p>
        <Link to="/proprietaire" className="mt-4 inline-block text-[var(--kh-blue-2)]">
          ← Retour
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link
        to={`/proprietaire/biens/${id}`}
        className="text-sm font-semibold text-[var(--kh-blue-2)]"
      >
        ← Fiche du bien
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-[var(--kh-primary)]">
        Modifier le logement
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Prix, équipements, description, photos et adresse.
      </p>
      <div className="mt-8">
        <PropertyForm
          initial={property}
          submitLabel="Enregistrer"
          busy={busy}
          error={error}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
