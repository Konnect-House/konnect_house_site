import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const whatsappLink = "https://wa.me/243821616193?text=Menu";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100dvh] flex items-center overflow-hidden kh-mesh-bg bg-[var(--kh-bg)]"
    >
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img
          src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1920&q=80"
          alt="Logement moderne à Kinshasa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[var(--kh-bg)]/80 dark:bg-[var(--kh-bg)]/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--kh-bg)]/60 via-transparent to-[var(--kh-bg)]/95" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full pt-24 sm:pt-28 pb-16 sm:pb-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full kh-glass text-xs sm:text-sm font-bold text-[var(--kh-primary)] mb-5 sm:mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--kh-blue-2)] animate-pulse" />
            Bot WhatsApp disponible 24/7
          </motion.div>

          <motion.h1
            variants={item}
            className="text-[1.75rem] leading-tight sm:text-5xl lg:text-6xl font-extrabold text-[var(--kh-primary)] drop-shadow-sm"
          >
            Trouvez un logement à Kinshasa{" "}
            <span className="kh-gradient-text">via WhatsApp.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-[var(--kh-text)]/90 leading-relaxed max-w-xl"
          >
            Konnect House est votre assistant immobilier sur WhatsApp. Envoyez
            un message, décrivez votre besoin, et obtenez en minutes une
            sélection de logements vérifiés.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group kh-gradient-btn kh-glow inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full text-base font-bold min-h-12"
            >
              <FaWhatsapp className="text-xl" />
              Démarrer sur WhatsApp
              <FiArrowRight className="text-lg transition-transform group-hover:translate-x-1" />
            </a>
            <button
              onClick={() =>
                document
                  .querySelector("#how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full text-base font-bold text-[var(--kh-primary)] kh-glass hover:bg-[var(--kh-surface)] transition border border-[var(--kh-border)] shadow-sm min-h-12"
            >
              Voir comment ça marche
            </button>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 sm:mt-14 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-12"
          >
            {[
              { value: "500+", label: "Logements" },
              { value: "10k+", label: "Utilisateurs" },
              { value: "5 min", label: "Pour une offre" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-xl sm:text-3xl font-extrabold kh-gradient-text">
                  {stat.value}
                </div>
                <div className="text-[11px] sm:text-sm font-semibold text-[var(--kh-text)]/80 mt-1 leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-[var(--kh-border)] flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-[var(--kh-blue-2)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
