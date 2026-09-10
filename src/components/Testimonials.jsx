import { motion, useInView, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";

const testimonials = [
  {
    name: "Sarah K.",
    role: "Étudiante, Gombe",
    text: "J'ai trouvé mon studio en 2 jours au lieu de 3 semaines. Les photos correspondaient exactement à la réalité. Merci Konnect House !",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    name: "Patrick M.",
    role: "Entrepreneur, Limete",
    text: "J'organise souvent des événements. Konnect House me trouve des lieux incroyables en quelques heures. Service au top.",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    name: "Grâce N.",
    role: "Consultante, Ngaliema",
    text: "Pour mes missions de courte durée, c'est devenu mon réflexe. Simple, rapide, et toujours des logements propres et bien situés.",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Logements vérifiés" },
  { value: 10, suffix: "k+", label: "Utilisateurs satisfaits" },
  { value: 98, suffix: "%", label: "Taux de satisfaction" },
  { value: 24, suffix: "/7", label: "Support WhatsApp" },
];

function AnimatedCounter({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-16 sm:py-24 lg:py-32 overflow-hidden bg-[var(--kh-bg)]"
    >
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
            Ils nous font confiance
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)]">
            Des Kinois qui ont trouvé leur place
          </h2>
        </motion.div>

        {/* Stats animées */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-10 sm:mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center kh-glass rounded-2xl py-4 sm:py-6 px-2 bg-[var(--kh-bg-soft)]"
            >
              <div className="text-3xl sm:text-4xl font-extrabold kh-gradient-text">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-[var(--kh-text-muted)] mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Témoignages */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="kh-glass rounded-3xl p-5 sm:p-8 flex flex-col bg-[var(--kh-bg-soft)]"
            >
              {/* Étoiles */}
              <div className="flex gap-1 mb-4 text-[var(--kh-sky)]">
                {[...Array(5)].map((_, idx) => (
                  <FiStar key={idx} className="fill-current" />
                ))}
              </div>

              <p className="text-[var(--kh-text-muted)] leading-relaxed flex-1">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--kh-border)]">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-[var(--kh-primary)]">
                    {t.name}
                  </div>
                  <div className="text-sm text-[var(--kh-text-muted)]">
                    {t.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
