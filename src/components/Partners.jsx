import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";

const partnerWhatsapp =
  "https://wa.me/243821616193?text=Bonjour%20Konnect%20House%2C%20je%20suis%20propri%C3%A9taire%20et%20je%20veux%20devenir%20partenaire";

export default function Partners() {
  const { user } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const ownerLoggedIn = user?.role === "PROVIDER" || user?.role === "ADMIN";
  return (
    <section id="partners" className="relative py-24 lg:py-32 overflow-hidden bg-[var(--kh-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold text-[var(--kh-blue-2)] uppercase tracking-wider">
              Propriétaires
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)]">
              Vous avez un logement à louer ?
            </h2>
            <p className="mt-4 text-lg text-[var(--kh-text-muted)] leading-relaxed">
              Créez votre espace partenaire, ajoutez vos maisons de passage, et
              laissez les voyageurs réserver via WhatsApp. Un administrateur
              valide votre compte avant publication.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Espace web pour publier et gérer vos biens",
                "Les clients réservent et paient via WhatsApp",
                "Commission unique, pas de frais cachés",
              ].map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-[var(--kh-text)]"
                >
                  <span className="w-6 h-6 rounded-full bg-[var(--kh-blue)]/10 text-[var(--kh-blue)] flex items-center justify-center shrink-0 mt-0.5">
                    <FiCheckCircle size={14} />
                  </span>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="kh-glass rounded-3xl p-8 lg:p-10 bg-[var(--kh-bg-soft)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white kh-glow"
                style={{
                  background: "linear-gradient(135deg, #011A66 0%, #3478AB 100%)",
                }}
              >
                <FiHome />
              </div>
              <h3 className="text-xl font-bold text-[var(--kh-primary)]">
                Devenir partenaire
              </h3>
            </div>
            <p className="text-[var(--kh-text-muted)] mb-6">
              Inscrivez-vous, attendez la validation, puis publiez vos maisons
              de passage (5 photos minimum).
            </p>
            <div className="space-y-3">
              {ownerLoggedIn ? (
                <Link
                  to="/proprietaire"
                  className="w-full kh-gradient-btn kh-glow flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-white transition-transform hover:scale-[1.02]"
                >
                  Gérer mes logements
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openRegister}
                    className="w-full kh-gradient-btn kh-glow flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    Créer mon compte propriétaire
                  </button>
                  <button
                    type="button"
                    onClick={openLogin}
                    className="w-full flex items-center justify-center px-6 py-4 rounded-xl text-base font-bold text-[var(--kh-primary)] border border-[var(--kh-border)] hover:bg-[var(--kh-bg)]"
                  >
                    J’ai déjà un compte
                  </button>
                </>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--kh-border)] text-center">
              <p className="text-sm text-[var(--kh-text-muted)] mb-3">
                Une question avant de vous inscrire ?
              </p>
              <a
                href={partnerWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--kh-blue-2)] hover:text-[var(--kh-blue)] font-semibold transition"
              >
                Écrire sur WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
