import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const STATUS = {
  PENDING_REVIEW: "En revue",
  PUBLISHED: "Publié",
  SUSPENDED: "Suspendu",
  ARCHIVED: "Archivé",
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pending = user?.status === "PENDING";

  useEffect(() => {
    let cancelled = false;
    api("/properties/mine", { token })
      .then((data) => {
        if (!cancelled) setProperties(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Impossible de charger vos biens.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--kh-primary)]">
            Mes logements
          </h1>
          <p className="mt-1 text-[var(--kh-text-muted)]">
            Bonjour {user?.fullName || ""}. Les voyageurs réservent ensuite via
            WhatsApp.
          </p>
        </div>
        <Link
          to="/proprietaire/biens/nouveau"
          className={`kh-gradient-btn px-5 py-3 rounded-xl font-bold text-white text-center ${pending ? "pointer-events-none opacity-50" : ""}`}
        >
          Ajouter un logement
        </Link>
      </div>

      {pending ? (
        <p className="mt-6 rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] px-4 py-3 text-sm text-[var(--kh-text)]">
          Votre compte est en attente de validation. Vous pourrez publier des
          maisons de passage dès qu’un administrateur l’aura activé.
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-[var(--kh-text-muted)]">Chargement…</p>
      ) : properties.length === 0 ? (
        <p className="mt-10 text-[var(--kh-text-muted)]">
          Aucun logement pour l’instant.
        </p>
      ) : (
        <ul className="mt-10 grid sm:grid-cols-2 gap-6">
          {properties.map((p) => (
            <li
              key={p.id}
              className="rounded-3xl overflow-hidden border border-[var(--kh-border)] bg-[var(--kh-bg-soft)]"
            >
              {p.photos?.[0] ? (
                <img
                  src={p.photos[0]}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 bg-[var(--kh-bg)]" />
              )}
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
                  {STATUS[p.status] || p.status}
                </p>
                <h2 className="mt-1 text-lg font-bold text-[var(--kh-primary)]">
                  {p.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
                  {p.commune} · {p.rooms} ch. · {p.pricePerNight} USD / nuit
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
