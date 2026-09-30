import { useState } from "react";
import { Navigate } from "react-router-dom";
import ProviderProfileForm from "../components/ProviderProfileForm";
import { useAuth } from "../lib/auth";
import { KYC_LABELS } from "../lib/media";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return <Navigate to="/" replace />;

  async function onSubmit(payload) {
    setOk("");
    setError("");
    setBusy(true);
    try {
      await updateProfile(payload);
      setOk(
        "Profil enregistré. Si vous avez changé la pièce d’identité, le KYC repasse en revue.",
      );
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  }

  const kyc = user.providerProfile?.kycStatus;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-10">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
        Profil fournisseur
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
        Mes informations
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Mettez à jour votre profil en 4 étapes courtes.
      </p>
      <p className="mt-3 text-sm font-semibold text-[var(--kh-primary)]">
        Statut : {KYC_LABELS[kyc] || kyc || "—"} · compte {user.status}
      </p>

      <div className="mt-8">
        <ProviderProfileForm
          mode="profile"
          initialUser={user}
          submitLabel="Enregistrer le profil"
          busy={busy}
          error={error}
          success={ok}
          onSubmit={onSubmit}
        />
      </div>
    </main>
  );
}
