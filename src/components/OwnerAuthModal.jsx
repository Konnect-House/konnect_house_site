import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import GoogleButton from "./GoogleButton";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";
import logo from "../assets/removebg.png";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

export default function OwnerAuthModal() {
  const { mode, close, openLogin, openRegister } = useAuthModal();
  const { googleProvider, login, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegister = mode === "register";
  const open = Boolean(mode);

  useEffect(() => {
    setError("");
    setShowPassword(false);
    setEmail("");
    setPassword("");
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
      if (res.data?.role !== "PROVIDER" && res.data?.role !== "ADMIN") {
        logout();
        setError("Cet espace est réservé aux propriétaires.");
        return;
      }
      close();
      navigate(
        res.data?.needsOnboarding ? "/proprietaire/onboarding" : "/proprietaire",
        { replace: true },
      );
    },
    [close, logout, navigate],
  );

  const onCredential = useCallback(
    async (credential) => {
      setError("");
      setBusy(true);
      try {
        goAfterAuth(await googleProvider(credential));
      } catch (err) {
        setError(err.message || "Connexion Google impossible.");
      } finally {
        setBusy(false);
      }
    },
    [goAfterAuth, googleProvider],
  );

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      goAfterAuth(await login(email, password));
    } catch (err) {
      setError(err.message || "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          style={{ background: "rgba(10, 14, 26, 0.82)" }}
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[var(--kh-bg-soft)] border border-[var(--kh-border)] shadow-2xl"
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
            <div className="px-8 py-10 sm:px-10">
              <img
                src={logo}
                alt="Konnect House"
                className="h-12 w-auto mx-auto mb-5"
              />
              <h2 className="text-2xl font-extrabold text-center text-[var(--kh-primary)]">
                {isRegister ? "Devenir partenaire" : "Espace propriétaire"}
              </h2>
              <p className="mt-2 text-center text-sm text-[var(--kh-text-muted)]">
                {isRegister
                  ? "Inscrivez-vous avec Gmail, puis complétez votre profil (WhatsApp, paiements)."
                  : "Connectez-vous avec Gmail pour gérer vos maisons de passage."}
              </p>
              <div className="mt-7 space-y-4">
                <GoogleButton
                  key={mode}
                  onCredential={onCredential}
                  disabled={busy}
                />
                {error ? (
                  <p className="text-sm text-red-500 text-center" role="alert">
                    {error}
                  </p>
                ) : null}
                {!isRegister ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="w-full text-sm font-semibold text-[var(--kh-text-muted)]"
                    >
                      {showPassword
                        ? "Masquer la connexion email"
                        : "Connexion email (admin)"}
                    </button>
                    {showPassword ? (
                      <form onSubmit={onSubmit} className="space-y-3">
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={fieldClass}
                        />
                        <input
                          type="password"
                          required
                          minLength={6}
                          autoComplete="current-password"
                          placeholder="Mot de passe"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={fieldClass}
                        />
                        <button
                          type="submit"
                          disabled={busy}
                          className="w-full kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
                        >
                          {busy ? "Connexion…" : "Se connecter"}
                        </button>
                      </form>
                    ) : null}
                  </>
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
