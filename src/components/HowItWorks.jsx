import { motion } from "framer-motion";
import { FiMessageSquare, FiSearch, FiKey } from "react-icons/fi";

const steps = [
  {
    icon: FiMessageSquare,
    num: "01",
    title: "Démarrez le bot WhatsApp",
    text: "Envoyez simplement un message au bot Konnect House. Décrivez le type de logement, le budget et la zone recherchée.",
  },
  {
    icon: FiSearch,
    num: "02",
    title: "Recevez une sélection",
    text: "Le bot et notre équipe vous envoient les logements vérifiés qui correspondent à vos critères en quelques minutes.",
  },
  {
    icon: FiKey,
    num: "03",
    title: "Visitez et réservez",
    text: "Choisissez, visitez et réservez en toute confiance. Un accompagnement humain reste disponible si besoin.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-[var(--kh-bg)]">
      <div className="absolute inset-0 kh-mesh-bg opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <span className="text-sm font-bold text-[var(--kh-blue-2)] uppercase tracking-wider">
            Simple comme un message
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)]">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-[var(--kh-text-muted)] text-lg">
            Trois étapes, aucune application à installer. Tout se passe sur
            WhatsApp.
          </p>
        </motion.div>

        {/* Étapes */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Ligne de connexion desktop */}
          <div
            className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(1,26,102,0.15), transparent)",
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative kh-glass rounded-3xl p-6 sm:p-8 hover:bg-[var(--kh-surface)] transition-colors group bg-[var(--kh-bg-soft)]"
            >
              {/* Numéro */}
              <div className="text-5xl font-extrabold text-[var(--kh-blue)]/10 mb-4 group-hover:text-[var(--kh-blue)]/25 transition-colors">
                {step.num}
              </div>

              {/* Icône */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl text-white mb-5 kh-glow"
                style={{
                  background: "linear-gradient(135deg, #011A66 0%, #3478AB 100%)",
                }}
              >
                <step.icon />
              </div>

              <h3 className="text-xl font-bold text-[var(--kh-primary)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--kh-text-muted)] leading-relaxed">
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
