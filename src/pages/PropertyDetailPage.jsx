import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

const STATUS = {
  PENDING_REVIEW: "En vérification",
  PUBLISHED: "Publié",
  SUSPENDED: "Masqué / indisponible",
  ARCHIVED: "Archivé",
};

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [period, setPeriod] = useState({ startDate: "", endDate: "", reason: "" });

  async function load() {
    const data = await api(`/properties/mine/${id}`, { token });
    setProperty(data);
  }

  useEffect(() => {
    let cancelled = false;
    load()
      .catch((err) => {
        if (!cancelled) setError(err.message || "Bien introuvable.");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  async function run(action, fn) {
    setBusy(action);
    setError("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err.message || "Action impossible.");
    } finally {
      setBusy("");
    }
  }

  if (!property && !error) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-[var(--kh-text-muted)]">
        Chargement…
      </main>
    );
  }

  if (!property) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-red-500">{error}</p>
        <Link to="/proprietaire" className="mt-4 inline-block text-[var(--kh-blue-2)]">
          ← Mes logements
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Link to="/proprietaire" className="text-sm font-semibold text-[var(--kh-blue-2)]">
        ← Mes logements
      </Link>

      {property.photos?.[0] ? (
        <img
          src={property.photos[0]}
          alt=""
          className="mt-6 h-52 w-full rounded-3xl object-cover"
        />
      ) : null}

      <div className="mt-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
            {STATUS[property.status] || property.status}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[var(--kh-primary)]">
            {property.name}
          </h1>
          <p className="mt-2 text-[var(--kh-text-muted)]">
            {property.commune} · {property.rooms} ch. · {property.capacity} pers. ·{" "}
            {property.pricePerNight} USD / nuit
          </p>
          <p className="mt-1 text-sm text-[var(--kh-text-muted)]">{property.address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/proprietaire/biens/${id}/modifier`}
            className="px-4 py-2 rounded-xl border border-[var(--kh-border)] font-semibold text-sm"
          >
            Modifier
          </Link>
          {property.status === "SUSPENDED" ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() =>
                run("reactivate", () =>
                  api(`/properties/${id}/reactivate`, { token, method: "POST" }),
                )
              }
              className="px-4 py-2 rounded-xl bg-[var(--kh-primary)] text-white font-semibold text-sm disabled:opacity-60"
            >
              Demander republication
            </button>
          ) : property.status !== "ARCHIVED" ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() =>
                run("deactivate", () =>
                  api(`/properties/${id}/deactivate`, { token, method: "POST" }),
                )
              }
              className="px-4 py-2 rounded-xl border border-[var(--kh-border)] font-semibold text-sm disabled:opacity-60"
            >
              Masquer
            </button>
          ) : null}
          {property.status !== "ARCHIVED" ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => {
                if (
                  !window.confirm(
                    "Archiver ce bien ? Il ne sera plus visible ni réservable.",
                  )
                ) {
                  return;
                }
                run("archive", async () => {
                  await api(`/properties/${id}`, { token, method: "DELETE" });
                  navigate("/proprietaire", { replace: true });
                });
              }}
              className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-semibold text-sm disabled:opacity-60"
            >
              Archiver
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-[var(--kh-text)] leading-relaxed whitespace-pre-wrap">
        {property.description}
      </p>

      {error ? (
        <p className="mt-4 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-10 rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[var(--kh-primary)]">
          Indisponibilités
        </h2>
        <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
          Bloquez une ou plusieurs périodes.
        </p>
        <form
          className="mt-4 grid sm:grid-cols-3 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run("unavail", async () => {
              await api(`/properties/${id}/unavailability`, {
                token,
                method: "POST",
                body: period,
              });
              setPeriod({ startDate: "", endDate: "", reason: "" });
            });
          }}
        >
          <input
            required
            type="date"
            value={period.startDate}
            onChange={(e) => setPeriod((p) => ({ ...p, startDate: e.target.value }))}
            className={fieldClass}
          />
          <input
            required
            type="date"
            value={period.endDate}
            onChange={(e) => setPeriod((p) => ({ ...p, endDate: e.target.value }))}
            className={fieldClass}
          />
          <input
            placeholder="Motif (optionnel)"
            value={period.reason}
            onChange={(e) => setPeriod((p) => ({ ...p, reason: e.target.value }))}
            className={fieldClass}
          />
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="sm:col-span-3 kh-gradient-btn px-4 py-3 rounded-xl font-bold text-white disabled:opacity-60"
          >
            {busy === "unavail" ? "Ajout…" : "Ajouter la période"}
          </button>
        </form>
        <ul className="mt-4 space-y-2">
          {(property.unavailabilities || []).map((u) => (
            <li
              key={u.id}
              className="rounded-xl border border-[var(--kh-border)] px-3 py-2 text-sm"
            >
              {String(u.startDate).slice(0, 10)} → {String(u.endDate).slice(0, 10)}
              {u.reason ? ` · ${u.reason}` : ""}
            </li>
          ))}
          {!property.unavailabilities?.length ? (
            <li className="text-sm text-[var(--kh-text-muted)]">
              Aucune période bloquée.
            </li>
          ) : null}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-[var(--kh-primary)]">
          Réservations récentes
        </h2>
        <ul className="mt-4 space-y-3">
          {(property.bookings || []).map((b) => (
            <li
              key={b.id}
              className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] px-4 py-3 text-sm"
            >
              <p className="font-semibold">{b.client?.fullName || "Client"}</p>
              <p className="text-[var(--kh-text-muted)]">
                {String(b.checkIn).slice(0, 10)} → {String(b.checkOut).slice(0, 10)} ·{" "}
                {b.status} · {b.totalAmount} USD
              </p>
            </li>
          ))}
          {!property.bookings?.length ? (
            <li className="text-sm text-[var(--kh-text-muted)]">
              Pas encore de réservation sur ce bien.
            </li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
