import { useState } from "react";
import { motion } from "framer-motion";
import { FiHome, FiSend, FiCheckCircle } from "react-icons/fi";

const partnerWhatsapp =
  "https://wa.me/243821616193?text=Bonjour%20Konnect%20House%2C%20je%20suis%20propri%C3%A9taire%20et%20je%20veux%20devenir%20partenaire";

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    propertyType: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Bonjour Konnect House, je suis propriétaire.%0A%0ANom : ${encodeURIComponent(
      form.name
    )}%0ATéléphone : ${encodeURIComponent(
      form.phone
    )}%0AType de logement : ${encodeURIComponent(
      form.propertyType
    )}%0AMessage : ${encodeURIComponent(form.message)}`;
    window.open(`https://wa.me/243829790981?text=${text}`, "_blank");
    setSubmitted(true);
  };

  return (
    <section id="partners" className="relative py-24 lg:py-32 overflow-hidden bg-[var(--kh-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Texte */}
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
              Rejoignez le réseau Konnect House et mettez vos logements à la
              disposition de milliers de personnes à Kinshasa. Zéro frais
              caché, visibilité garantie.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Diffusion auprès de milliers de locataires potentiels",
                "Gestion simplifiée via le bot WhatsApp",
                "Mise en relation directe et rapide",
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

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="kh-glass rounded-3xl p-8 lg:p-10 bg-[var(--kh-bg-soft)]"
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-[var(--kh-blue)]/10 text-[var(--kh-blue)] flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-extrabold text-[var(--kh-primary)]">
                  Message envoyé !
                </h3>
                <p className="mt-2 text-[var(--kh-text-muted)]">
                  Notre équipe vous recontacte très vite.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white kh-glow" style={{ background: "linear-gradient(135deg, #011A66 0%, #3478AB 100%)" }}>
                    <FiHome />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--kh-primary)]">
                    Devenir partenaire
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nom complet"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Téléphone WhatsApp"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40"
                    />
                  </div>

                  <select
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40"
                  >
                    <option value="" disabled>
                      Type de logement
                    </option>
                    <option value="Appartement">Appartement</option>
                    <option value="Maison">Maison</option>
                    <option value="Studio">Studio</option>
                    <option value="Villa / Lodge">Villa / Lodge</option>
                    <option value="Espace événementiel">
                      Espace événementiel
                    </option>
                  </select>

                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Décrivez votre logement (quartier, nombre de chambres, loyer, etc.)"
                    className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40 resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full kh-gradient-btn kh-glow flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-bold text-white transition-transform hover:scale-[1.02]"
                  >
                    <FiSend />
                    Envoyer ma demande
                  </button>

                  <p className="text-xs text-center text-[var(--kh-text-muted)]">
                    Vous serez redirigé vers WhatsApp pour confirmer votre
                    demande.
                  </p>
                </form>
              </>
            )}

            {/* Alternative rapide */}
            <div className="mt-6 pt-6 border-t border-[var(--kh-border)] text-center">
              <p className="text-sm text-[var(--kh-text-muted)] mb-3">
                Vous préférez écrire directement ?
              </p>
              <a
                href={partnerWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--kh-blue-2)] hover:text-[var(--kh-blue)] font-semibold transition"
              >
                Ouvrir le chat partenaire
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
