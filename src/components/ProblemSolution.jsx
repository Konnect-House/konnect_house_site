import { motion } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";

const problems = [
  "Des heures à chercher sur des groupes WhatsApp encombrés",
  "Aucune garantie sur la qualité ni la disponibilité réelle",
  "Des arnaques et des photos qui ne correspondent pas",
  "Aucun interlocuteur de confiance en cas de problème",
];

const solutions = [
  "Un bot WhatsApp simple et rapide pour décrire votre besoin",
  "Une sélection de logements vérifiés à Kinshasa",
  "Des photos réelles et des descriptions transparentes",
  "Un accompagnement humain à chaque étape",
];

export default function ProblemSolution() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-[var(--kh-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm font-bold text-[var(--kh-blue-2)] uppercase tracking-wider">
            Le problème
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)]">
            Chercher un logement à Kinshasa,{" "}
            <span className="text-[var(--kh-text-muted)]">c'est compliqué.</span>
          </h2>
        </motion.div>

        {/* Split */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {/* Problème */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="kh-glass rounded-3xl p-8 lg:p-10"
          >
            <h3 className="text-xl font-bold text-[var(--kh-text)] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                <FiX />
              </span>
              Sans Konnect House
            </h3>
            <ul className="space-y-4">
              {problems.map((p, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-start gap-3 text-[var(--kh-text-muted)]"
                >
                  <FiX className="mt-1 text-red-500 shrink-0" />
                  <span>{p}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl p-8 lg:p-10 kh-glow"
            style={{
              background:
                "linear-gradient(135deg, rgba(1,26,102,0.08) 0%, rgba(52,120,171,0.06) 100%)",
              border: "1px solid rgba(1,26,102,0.12)",
            }}
          >
            <h3 className="text-xl font-bold text-[var(--kh-primary)] mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[var(--kh-blue)]/10 text-[var(--kh-sky)] flex items-center justify-center">
                <FiCheck />
              </span>
              Avec Konnect House
            </h3>
            <ul className="space-y-4">
              {solutions.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="flex items-start gap-3 text-[var(--kh-text)]"
                >
                  <FiCheck className="mt-1 text-[var(--kh-blue-2)] shrink-0" />
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
