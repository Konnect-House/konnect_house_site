import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaHome, FaArrowRight } from "react-icons/fa";
import { FiCheck, FiX } from "react-icons/fi";
import logo from "../assets/removebg.png";
import { useAuthModal } from "../lib/authModal";

const SEEKER_LINK = "https://wa.me/243821616193?text=Menu";
const BACKDROP_KEY = "kh-onboarding-seen";

export default function OnboardingModal() {
  const { mode: authMode, openRegister } = useAuthModal();
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    if (new URLSearchParams(window.location.search).get("auth")) return false;
    return !sessionStorage.getItem(BACKDROP_KEY);
  });
  const [mode, setMode] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(BACKDROP_KEY);
    if (seen || authMode) setIsOpen(false);
  }, [authMode]);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem(BACKDROP_KEY, "1");
  };

  const chooseSeeker = () => {
    window.open(SEEKER_LINK, "_blank");
    setMode("seeker");
    setDone(true);
  };

  const chooseOwner = () => {
    close();
    openRegister();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
            style={{
              background: "rgba(10, 14, 26, 0.82)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[440px] max-h-[min(92dvh,100%)] overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl"
              style={{
                background: "var(--kh-bg-soft)",
                border: "1px solid var(--kh-border)",
              }}
            >
              {/* Bouton fermer */}
              <button
                onClick={close}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[var(--kh-text-muted)] hover:bg-[var(--kh-bg)] hover:text-[var(--kh-primary)] transition z-10"
                aria-label="Fermer"
              >
                <FiX size={18} />
              </button>

              {/* Étape 1 : Welcome */}
              {!mode && !done && (
                <div className="px-5 py-8 sm:px-10 sm:py-12 text-center">
                  {/* Logo navbar complet */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-6"
                  >
                    <img
                      src={logo}
                      alt="Konnect House"
                      className="h-16 sm:h-20 w-auto mx-auto drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--kh-primary)] mb-3">
                      Bienvenue sur Konnect House
                    </h2>
                    <p className="text-[var(--kh-text-muted)] leading-relaxed mb-8 max-w-xs mx-auto text-sm sm:text-base">
                      Votre assistant immobilier sur WhatsApp. Trouvez ou mettez en location un logement à Kinshasa en quelques minutes.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={chooseSeeker}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      }}
                    >
                      <FaWhatsapp className="text-2xl" />
                      Je cherche une maison
                      <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      onClick={chooseOwner}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-bold text-[var(--kh-primary)] transition-all hover:scale-[1.02] border"
                      style={{
                        background: "var(--kh-bg)",
                        borderColor: "var(--kh-border)",
                      }}
                    >
                      <FaHome className="text-xl text-[var(--kh-blue-2)]" />
                      Publier mon logement
                    </button>
                  </motion.div>



                  {/* Petite décoration */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] overflow-hidden">
                    <div
                      className="h-full w-full"
                      style={{
                        background: "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Écran de succès */}
              {done && (
                <div className="px-5 py-8 sm:px-10 sm:py-12 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-6">
                    <FiCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--kh-primary)] mb-3">
                    {mode === "seeker"
                      ? "Conversation lancée !"
                      : "Demande envoyée !"}
                  </h3>
                  <p className="text-[var(--kh-text-muted)] mb-8 text-sm sm:text-base">
                    {mode === "seeker"
                      ? "Le bot Konnect House va vous guider pour trouver votre logement."
                      : "Notre équipe va examiner votre dossier et vous recontacter très vite."}
                  </p>
                  <button
                    onClick={close}
                    className="kh-gradient-btn text-white font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105 shadow-md"
                  >
                    Découvrir la page
                  </button>
                </div>
              )}

              {/* Décoration bandeau haut (commun) */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] overflow-hidden pointer-events-none">
                <div
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button to reopen onboarding */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            setMode(null);
            setDone(false);
            setIsOpen(true);
            sessionStorage.removeItem(BACKDROP_KEY);
          }}
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 sm:right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          }}
          aria-label="Ouvrir le menu de démarrage"
        >
          <FaWhatsapp />
        </motion.button>
      )}
    </>
  );
}
