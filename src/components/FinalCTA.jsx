import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiHome } from "react-icons/fi";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";
import { whatsappBotLink } from "../lib/whatsapp";

const whatsappLink = whatsappBotLink();

export default function FinalCTA() {
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const ownerLoggedIn = user?.role === "PROVIDER" || user?.role === "ADMIN";

  return (
    <section className="relative py-16 sm:py-24 lg:min-h-screen lg:flex lg:items-center lg:justify-center bg-[var(--kh-bg)]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[1.75rem] sm:rounded-[2.5rem] overflow-hidden text-center px-5 py-12 sm:px-8 sm:py-16 lg:py-24 kh-glow"
          style={{
            background:
              "linear-gradient(135deg, rgba(1,26,102,0.08) 0%, rgba(52,120,171,0.05) 100%)",
            border: "1px solid rgba(1,26,102,0.12)",
          }}
        >
          <div className="absolute inset-0 kh-mesh-bg opacity-60" />

          <div className="relative flex flex-col items-center text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)] max-w-2xl mx-auto"
            >
              Prêt à trouver votre logement{" "}
              <span className="kh-gradient-text">en 5 minutes ?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-5 text-lg text-[var(--kh-text-muted)] max-w-xl mx-auto"
            >
              Envoyez un message au bot WhatsApp. Notre équipe vous répond
              immédiatement avec des propositions concrètes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 sm:mt-10 flex w-full max-w-lg flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold text-white kh-gradient-btn kh-glow min-h-12"
              >
                <FaWhatsapp className="text-2xl" />
                Démarrer sur WhatsApp
                <FiArrowRight className="text-xl transition-transform group-hover:translate-x-1" />
              </a>
              {ownerLoggedIn ? (
                <Link
                  to="/proprietaire"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-bold text-[var(--kh-primary)] border-2 border-[var(--kh-blue-2)] bg-[var(--kh-bg-soft)] min-h-12"
                >
                  <FiHome />
                  Espace propriétaire
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={openLogin}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-bold text-[var(--kh-primary)] border-2 border-[var(--kh-blue-2)] bg-[var(--kh-bg-soft)] min-h-12"
                >
                  <FiHome />
                  Espace propriétaire
                </button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
