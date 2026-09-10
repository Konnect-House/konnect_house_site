import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { KYC_LABELS } from "../lib/media";

function money(n) {
  const v = Number(n) || 0;
  return `${v.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} USD`;
}

function BarChart({ rows, valueKey, labelKey = "month" }) {
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0));
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const value = Number(row[valueKey]) || 0;
        const pct = Math.round((value / max) * 100);
        return (
          <div key={row[labelKey]}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--kh-text-muted)]">
                {row[labelKey]}
              </span>
              <span className="font-bold text-[var(--kh-primary)]">
                {valueKey.includes("bookings") ? value : money(value)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--kh-bg)]">
              <div
                className="h-full rounded-full bg-[var(--kh-blue-2)] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProviderHomePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const pending = user?.status === "PENDING";
  const kyc = user?.providerProfile?.kycStatus;

  useEffect(() => {
    let cancelled = false;
    api("/properties/mine/dashboard", { token })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Impossible de charger le tableau.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const summary = data?.summary;
  const cards = useMemo(
    () => [
      ["Réservations", summary?.bookingsTotal ?? 0],
      ["Actives", summary?.bookingsActive ?? 0],
      ["Encaissé (clients)", money(summary?.grossPaid)],
      ["Votre part", money(summary?.earnings)],
    ],
    [summary],
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
            Accueil fournisseur
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
            Vue d’ensemble
          </h1>
          <p className="mt-1 text-[var(--kh-text-muted)]">
            Réservations, paiements et performance de vos maisons.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/proprietaire/gestion"
            className="rounded-xl border border-[var(--kh-border)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)]"
          >
            Gérer mes biens
          </Link>
          <Link
            to="/proprietaire/biens/nouveau"
            className={`kh-gradient-btn rounded-xl px-5 py-3 text-center text-sm font-bold text-white ${
              pending ? "pointer-events-none opacity-50" : ""
            }`}
          >
            Ajouter un logement
          </Link>
        </div>
      </div>

      {pending ? (
        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Compte en attente de validation. KYC :{" "}
          <strong>{KYC_LABELS[kyc] || "en cours"}</strong>
          {user?.providerProfile?.kycRejectionReason
            ? ` — ${user.providerProfile.kycRejectionReason}`
            : ""}
          . Un admin vérifiera votre pièce d’identité avant activation.
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
        {cards.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-4"
          >
            <p className="text-xs font-semibold text-[var(--kh-text-muted)]">
              {label}
            </p>
            <p className="mt-1 text-xl font-extrabold text-[var(--kh-primary)] sm:text-2xl">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[var(--kh-primary)]">
            Réservations (6 mois)
          </h2>
          <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
            Volume de demandes reçues via WhatsApp.
          </p>
          <div className="mt-5">
            {loading ? (
              <p className="text-sm text-[var(--kh-text-muted)]">Chargement…</p>
            ) : (
              <BarChart
                rows={data?.bookingsByMonth || []}
                valueKey="bookings"
              />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[var(--kh-primary)]">
            Montants encaissés
          </h2>
          <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
            Paiements confirmés — votre part nette après commission.
          </p>
          <div className="mt-5">
            {loading ? (
              <p className="text-sm text-[var(--kh-text-muted)]">Chargement…</p>
            ) : (
              <BarChart
                rows={data?.bookingsByMonth || []}
                valueKey="earnings"
              />
            )}
          </div>
          <p className="mt-4 text-xs text-[var(--kh-text-muted)]">
            Commission Konnect House cumulée :{" "}
            <strong>{money(summary?.commission)}</strong>
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-[var(--kh-primary)]">
          Performance par maison
        </h2>
        <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
          Quelle maison génère le plus de revenus.
        </p>
        {loading ? (
          <p className="mt-4 text-sm text-[var(--kh-text-muted)]">Chargement…</p>
        ) : !data?.earningsByProperty?.length ? (
          <p className="mt-4 text-sm text-[var(--kh-text-muted)]">
            Aucun bien encore —{" "}
            <Link to="/proprietaire/biens/nouveau" className="font-bold text-[var(--kh-blue-2)]">
              ajoutez votre premier logement
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {data.earningsByProperty.map((row) => (
              <li
                key={row.propertyId}
                className="flex flex-col gap-1 rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-[var(--kh-primary)]">{row.name}</p>
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    {row.bookings} réservation(s)
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold">{money(row.earnings)} nets</p>
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    {money(row.paid)} payés par les clients
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[var(--kh-primary)]">
            Dernières réservations
          </h2>
          {!data?.recentBookings?.length ? (
            <p className="mt-4 text-sm text-[var(--kh-text-muted)]">
              Pas encore de réservation.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.recentBookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm"
                >
                  <p className="font-bold text-[var(--kh-primary)]">
                    {b.propertyName}
                  </p>
                  <p className="text-[var(--kh-text-muted)]">
                    {b.clientName || "Client"} · {String(b.checkIn).slice(0, 10)}{" "}
                    → {String(b.checkOut).slice(0, 10)}
                  </p>
                  <p className="mt-1 font-semibold">
                    {b.status}
                    {b.paid ? ` · payé · part ${money(b.providerAmount)}` : " · paiement en attente"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[var(--kh-primary)]">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
            Alertes réservation / paiement (CDC §4.2.6 & 4.3).
          </p>
          {!data?.notifications?.length ? (
            <p className="mt-4 text-sm text-[var(--kh-text-muted)]">
              Aucune notification pour l’instant.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.notifications.map((n) => (
                <li
                  key={n.id}
                  className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm"
                >
                  <p className="font-bold text-[var(--kh-primary)]">{n.type}</p>
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    {n.channel} · {String(n.createdAt).slice(0, 16).replace("T", " ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/proprietaire/profil"
            className="mt-5 inline-block text-sm font-bold text-[var(--kh-blue-2)]"
          >
            Mettre à jour mon profil & KYC →
          </Link>
        </section>
      </div>
    </main>
  );
}
