import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import ProviderProfileForm from "../components/ProviderProfileForm";
import { useAuth } from "../lib/auth";

export default function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (user?.role === "PROVIDER" && !user.needsOnboarding) {
    return <Navigate to="/proprietaire" replace />;
  }

  async function onSubmit(payload) {
    setBusy(true);
    setError("");
    try {
      await completeOnboarding(payload);
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer le profil.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(102,202,228,0.28), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(52,120,171,0.35), transparent 50%), #0A0E1A",
      }}
    >
      <div className="flex w-full max-w-[560px] max-h-[min(92dvh,900px)] flex-col overflow-hidden">
        <div className="mb-3 flex items-center gap-3 px-1">
          <BrandLogo className="h-8 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#66CAE4]">
              Devenir partenaire
            </p>
            <p className="truncate text-xs text-white/70">
              Complétez votre dossier en 4 étapes
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl shadow-2xl">
          <ProviderProfileForm
            mode="onboarding"
            initialUser={user}
            eyebrow="Onboarding partenaire"
            submitLabel="Terminer l’inscription"
            busy={busy}
            error={error}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
