import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

const METHODS = [
  { id: "MPESA", label: "M-Pesa" },
  { id: "AIRTEL_MONEY", label: "Airtel Money" },
  { id: "ORANGE_MONEY", label: "Orange Money" },
  { id: "CARD", label: "Carte" },
];

export default function RegisterPage() {
  const { register, token, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    mobileMoneyNumber: "",
    acceptedPaymentMethods: ["MPESA"],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && token && (user?.role === "PROVIDER" || user?.role === "ADMIN")) {
    return <Navigate to="/proprietaire" replace />;
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleMethod(id) {
    setForm((f) => {
      const has = f.acceptedPaymentMethods.includes(id);
      const next = has
        ? f.acceptedPaymentMethods.filter((m) => m !== id)
        : [...f.acceptedPaymentMethods, id];
      return { ...f, acceptedPaymentMethods: next };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.acceptedPaymentMethods.length < 1) {
      setError("Choisissez au moins un moyen de paiement.");
      return;
    }
    setBusy(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        mobileMoneyNumber: form.mobileMoneyNumber || undefined,
        acceptedPaymentMethods: form.acceptedPaymentMethods,
      });
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Inscription impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-extrabold text-[var(--kh-primary)]">
        Devenir partenaire
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Créez votre compte. Un administrateur validera votre profil avant la
        publication des logements.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          required
          placeholder="Nom complet"
          value={form.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className={fieldClass}
        />
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          className={fieldClass}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Mot de passe (6 caractères min.)"
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          className={fieldClass}
        />
        <input
          type="tel"
          placeholder="Téléphone WhatsApp"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          className={fieldClass}
        />
        <input
          placeholder="Numéro Mobile Money (optionnel)"
          value={form.mobileMoneyNumber}
          onChange={(e) => setField("mobileMoneyNumber", e.target.value)}
          className={fieldClass}
        />
        <fieldset>
          <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
            Moyens de paiement acceptés
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-2 text-sm text-[var(--kh-text)]"
              >
                <input
                  type="checkbox"
                  checked={form.acceptedPaymentMethods.includes(m.id)}
                  onChange={() => toggleMethod(m.id)}
                />
                {m.label}
              </label>
            ))}
          </div>
        </fieldset>
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
          {busy ? "Création…" : "Créer mon compte"}
        </button>
      </form>
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
