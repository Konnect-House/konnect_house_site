import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const STATUS = {
  PENDING_REVIEW: "En vérification",
  PUBLISHED: "Publié",
  SUSPENDED: "Masqué",
  ARCHIVED: "Archivé",
};

const BOOKING_STATUS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("biens");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pending = user?.status === "PENDING";

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api("/properties/mine", { token }),
      api("/bookings", { token }).catch(() => []),
    ])
      .then(([props, books]) => {
        if (cancelled) return;
        setProperties(Array.isArray(props) ? props : []);
        setBookings(Array.isArray(books) ? books : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Impossible de charger l’espace.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const published = properties.filter((p) => p.status === "PUBLISHED").length;
    const review = properties.filter((p) => p.status === "PENDING_REVIEW").length;
    const activeBookings = bookings.filter((b) =>
      ["CONFIRMED", "IN_PROGRESS", "PENDING"].includes(b.status),
    ).length;
    return {
      total: properties.length,
      published,
      review,
      bookings: activeBookings,
    };
  }, [properties, bookings]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
            Espace fournisseur
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
            Mes biens & réservations
          </h1>
          <p className="mt-1 text-[var(--kh-text-muted)]">
            Gérez vos maisons de passage, disponibilités et réservations.
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
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Votre compte est en attente de validation Konnect House. Vous pourrez
          soumettre des biens dès l’activation.
        </p>
      ) : null}

      {user?.status === "ACTIVE" &&
      properties.some((p) => p.status === "PUBLISHED") ? (
        <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Au moins un de vos logements est visible. Les voyageurs réservent via
          WhatsApp.
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          ["Biens", stats.total],
          ["Publiés", stats.published],
          ["En vérification", stats.review],
          ["Réservations actives", stats.bookings],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-4"
          >
            <p className="text-xs font-semibold text-[var(--kh-text-muted)]">
              {label}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-[var(--kh-primary)]">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-[var(--kh-border)]">
        {[
          ["biens", "Mes logements"],
          ["reservations", "Réservations"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-3 text-sm font-bold border-b-2 -mb-px transition ${
              tab === id
                ? "border-[var(--kh-primary)] text-[var(--kh-primary)]"
                : "border-transparent text-[var(--kh-text-muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-6 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-10 text-[var(--kh-text-muted)]">Chargement…</p>
      ) : tab === "biens" ? (
        properties.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-[var(--kh-border)] px-6 py-12 text-center">
            <p className="text-[var(--kh-text-muted)]">
              Aucun logement pour l’instant.
            </p>
            {!pending ? (
              <Link
                to="/proprietaire/biens/nouveau"
                className="mt-4 inline-block font-bold text-[var(--kh-blue-2)]"
              >
                Créer mon premier bien
              </Link>
            ) : null}
          </div>
        ) : (
          <ul className="mt-8 grid sm:grid-cols-2 gap-6">
            {properties.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/proprietaire/biens/${p.id}`}
                  className="block rounded-3xl overflow-hidden border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] hover:border-[var(--kh-blue-2)]/40 transition"
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
                    <p className="mt-2 text-xs text-[var(--kh-text-muted)]">
                      {p._count?.bookings ?? p.bookings?.length ?? 0} réservation(s)
                      {(p.unavailabilities?.length || 0) > 0
                        ? ` · ${p.unavailabilities.length} période(s) bloquée(s)`
                        : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : bookings.length === 0 ? (
        <p className="mt-10 text-[var(--kh-text-muted)]">
          Aucune réservation pour le moment.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] px-4 py-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-bold text-[var(--kh-primary)]">
                    {b.property?.name || "Logement"}
                  </p>
                  <p className="text-sm text-[var(--kh-text-muted)]">
                    {b.client?.fullName || "Client"} ·{" "}
                    {String(b.checkIn).slice(0, 10)} →{" "}
                    {String(b.checkOut).slice(0, 10)}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold">
                    {BOOKING_STATUS[b.status] || b.status}
                  </p>
                  <p className="text-[var(--kh-text-muted)]">
                    {b.totalAmount} USD · part {b.providerAmount} USD
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
