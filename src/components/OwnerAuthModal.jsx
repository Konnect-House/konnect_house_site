import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import GoogleButton from "./GoogleButton";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";
import BrandLogo from "./BrandLogo";

export default function OwnerAuthModal() {
  const { mode, close, openLogin, openRegister } = useAuthModal();
  const { googleProvider, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const open = Boolean(mode);

  useEffect(() => {
    setError("");
  }, [mode]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const goAfterAuth = useCallback(
    (res) => {
      if (res.data?.role !== "PROVIDER") {
        logout();
        setError(
          res.data?.role === "ADMIN"
            ? "Les administrateurs se connectent via le Dashboard."
            : "Cet espace est réservé aux propriétaires.",
        );
        return;
      }
      const dest = res.data?.needsOnboarding
        ? "/proprietaire/onboarding"
        : "/proprietaire";
      // Fermer le modal puis naviguer au tick suivant (évite écran blanc iOS)
      close();
      window.setTimeout(() => {
        navigate(dest, { replace: true });
      }, 50);
    },
    [close, logout, navigate],
  );

  const onCredential = useCallback(
    async (credential) => {
      setError("");
      setBusy(true);
      try {
        const res = await googleProvider(credential);
        const next = new URLSearchParams(window.location.search).get("next");
        if (
          res.data?.role === "PROVIDER" &&
          !res.data?.needsOnboarding &&
          next?.startsWith("/proprietaire")
        ) {
          close();
          navigate(next, { replace: true });
          return;
        }
        goAfterAuth(res);
      } catch (err) {
        setError(err.message || "Connexion Google impossible.");
      } finally {
        setBusy(false);
      }
    },
    [close, goAfterAuth, googleProvider, navigate],
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: "rgba(10, 14, 26, 0.82)" }}
          onClick={() => {
            if (!busy) close();
          }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] max-h-[min(92dvh,100%)] overflow-y-auto rounded-t-[1.5rem] sm:rounded-[2rem] bg-[var(--kh-bg-soft)] border border-[var(--kh-border)] shadow-2xl pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem]"
              style={{
                background:
                  "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
              }}
            />
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[var(--kh-text-muted)] hover:bg-[var(--kh-bg)] hover:text-[var(--kh-primary)] transition"
              aria-label="Fermer"
            >
              <FiX size={18} />
            </button>
            <div className="px-5 py-8 sm:px-10 sm:py-10">
              <BrandLogo className="h-12 w-auto mx-auto mb-5" />
              <h2 className="text-2xl font-extrabold text-center text-[var(--kh-primary)]">
                {isRegister ? "Créer mon espace propriétaire" : "Espace propriétaire"}
              </h2>
              <p className="mt-2 text-center text-sm text-[var(--kh-text-muted)]">
                {isRegister
                  ? "Inscription Gmail — un seul tap sur mobile. Si le compte existe déjà, vous serez connecté."
                  : "Connexion Gmail — un seul tap sur mobile. Pas encore de compte ? Il sera créé automatiquement."}
              </p>
              <div className="mt-7 space-y-4 relative z-20 isolate">
                <GoogleButton
                  key={mode}
                  label={
                    isRegister
                      ? "S'inscrire avec Google"
                      : "Se connecter avec Google"
                  }
                  onCredential={onCredential}
                  disabled={busy}
                />
                {busy ? (
                  <p className="text-center text-sm text-[var(--kh-text-muted)]">
                    Connexion en cours…
                  </p>
                ) : null}
                {error ? (
                  <p className="text-sm text-red-500 text-center" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
              <p className="mt-6 text-sm text-center text-[var(--kh-text-muted)]">
                {isRegister ? (
                  <>
                    Déjà inscrit ?{" "}
                    <button
                      type="button"
                      onClick={openLogin}
                      className="font-semibold text-[var(--kh-blue-2)]"
                    >
                      Se connecter
                    </button>
                  </>
                ) : (
                  <>
                    Pas encore de compte ?{" "}
                    <button
                      type="button"
                      onClick={openRegister}
                      className="font-semibold text-[var(--kh-blue-2)]"
                    >
                      Créer un compte
                    </button>
                  </>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
