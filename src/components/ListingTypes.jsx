import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";

const listings = [
  {
    title: "Pour une soirée",
    desc: "Lieux élégants pour vos événements, anniversaires et célébrations à Kinshasa.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49cd?auto=format&fit=crop&w=800&q=80",
    tag: "Événementiel",
  },
  {
    title: "Court séjour",
    desc: "Appartements meublés pour quelques jours ou semaines. Confort hôtelier, prix juste.",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    tag: "Temporaire",
  },
  {
    title: "Longue durée",
    desc: "Studios, appartements et maisons pour plusieurs mois. Sereinement.",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d029?auto=format&fit=crop&w=800&q=80",
    tag: "Résidentiel",
  },
];

const listingWhatsapp = "https://wa.me/243821616193?text=Menu";

export default function ListingTypes() {
  return (
    <section id="listings" className="relative py-24 lg:py-32 bg-[var(--kh-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div className="max-w-xl">
            <span className="text-sm font-bold text-[var(--kh-blue-2)] uppercase tracking-wider">
              Nos logements
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--kh-primary)]">
              Un espace pour chaque besoin
            </h2>
          </div>
          <p className="text-[var(--kh-text-muted)] md:max-w-sm">
            Que ce soit pour quelques heures ou plusieurs mois, on a l'espace
            qu'il vous faut à Kinshasa.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {listings.map((item, i) => (
            <motion.a
              key={item.title}
              href={listingWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl overflow-hidden kh-glass block bg-[var(--kh-bg-soft)]"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--kh-bg)] via-[var(--kh-bg)]/30 to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-[var(--kh-primary)] kh-glass">
                  {item.tag}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-[var(--kh-primary)]">
                    {item.title}
                  </h3>
                  <FaWhatsapp className="text-xl text-[var(--kh-text-muted)] group-hover:text-[var(--kh-blue-2)] transition-all" />
                </div>
                <p className="mt-3 text-[var(--kh-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
