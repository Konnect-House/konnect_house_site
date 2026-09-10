import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

const METHODS = [
  { id: "MPESA", label: "M-Pesa" },
  { id: "AIRTEL_MONEY", label: "Airtel Money" },
  { id: "ORANGE_MONEY", label: "Orange Money" },
  { id: "CARD", label: "Carte" },
];

const MM = new Set(["MPESA", "AIRTEL_MONEY", "ORANGE_MONEY"]);

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || user?.whatsappNumber || "",
    mobileMoneyNumber: user?.providerProfile?.mobileMoneyNumber || "",
    bankAccount: user?.providerProfile?.bankAccount || "",
    acceptedPaymentMethods: user?.providerProfile?.acceptedPaymentMethods?.length
      ? user.providerProfile.acceptedPaymentMethods
      : ["MPESA"],
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      fullName: f.fullName || user.fullName || "",
      phone: f.phone || user.phone || user.whatsappNumber || "",
      mobileMoneyNumber:
        f.mobileMoneyNumber || user.providerProfile?.mobileMoneyNumber || "",
      bankAccount: f.bankAccount || user.providerProfile?.bankAccount || "",
      acceptedPaymentMethods: f.acceptedPaymentMethods.length
        ? f.acceptedPaymentMethods
        : user.providerProfile?.acceptedPaymentMethods?.length
          ? user.providerProfile.acceptedPaymentMethods
          : ["MPESA"],
    }));
  }, [user]);

  if (user?.role === "PROVIDER" && !user.needsOnboarding) {
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
    const usesMm = form.acceptedPaymentMethods.some((m) => MM.has(m));
    if (usesMm && !form.mobileMoneyNumber.trim()) {
      setError("Indiquez le numéro Mobile Money pour les reversements.");
      return;
    }
    setBusy(true);
    try {
      await completeOnboarding({
        fullName: form.fullName,
        phone: form.phone,
        mobileMoneyNumber: form.mobileMoneyNumber || undefined,
        bankAccount: form.bankAccount || undefined,
        acceptedPaymentMethods: form.acceptedPaymentMethods,
      });
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer le profil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <p className="text-sm font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
        Étape 2 sur 2
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
        Complétez votre profil
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Ces informations servent aux réservations WhatsApp et aux reversements.
        Un administrateur validera ensuite votre compte avant publication des
        logements.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <input
          required
          minLength={2}
          placeholder="Nom complet"
          value={form.fullName}
          onChange={(e) => setField("fullName", e.target.value)}
          className={fieldClass}
        />
        <input
          type="tel"
          required
          minLength={9}
          placeholder="Téléphone WhatsApp"
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
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
        <input
          placeholder="Numéro Mobile Money"
          value={form.mobileMoneyNumber}
          onChange={(e) => setField("mobileMoneyNumber", e.target.value)}
          className={fieldClass}
        />
        <input
          placeholder="Compte bancaire (optionnel, reversements)"
          value={form.bankAccount}
          onChange={(e) => setField("bankAccount", e.target.value)}
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
          {busy ? "Enregistrement…" : "Valider mon profil"}
        </button>
      </form>
    </main>
  );
}
