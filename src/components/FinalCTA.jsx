import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const whatsappLink = "https://wa.me/243821616193?text=Menu";

export default function FinalCTA() {
  return (
    <section className="relative h-full min-h-screen flex items-center justify-center bg-[var(--kh-bg)]">
      <div className="w-full max-w-5xl mx-auto px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2.5rem] overflow-hidden text-center px-8 py-16 lg:py-24 kh-glow"
          style={{
            background:
              "linear-gradient(135deg, rgba(1,26,102,0.08) 0%, rgba(52,120,171,0.05) 100%)",
            border: "1px solid rgba(1,26,102,0.12)",
          }}
        >
          {/* Décor */}
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

            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              className="group inline-flex items-center gap-3 mt-10 px-8 py-4 rounded-full text-lg font-bold text-white kh-gradient-btn kh-glow"
            >
              <FaWhatsapp className="text-2xl" />
              Démarrer sur WhatsApp
              <FiArrowRight className="text-xl transition-transform group-hover:translate-x-1" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
