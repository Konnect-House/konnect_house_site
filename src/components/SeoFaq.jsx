import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const FAQS = [
  {
    q: "Comment trouver un logement à Kinshasa avec Konnect House ?",
    a: "Ouvrez WhatsApp, contactez le bot Konnect House, décrivez votre besoin (quartier, dates, budget). Vous recevez une sélection de logements vérifiés en quelques minutes.",
  },
  {
    q: "Quels types de logements sont disponibles ?",
    a: "Maisons de passage, appartements, guest houses, hôtels et salons privés à Kinshasa — pour une soirée, un court séjour ou une durée plus longue.",
  },
  {
    q: "Comment réserver et payer ?",
    a: "La réservation se fait dans le bot WhatsApp. Le paiement Mobile Money (M-Pesa, Airtel Money, Orange Money, Afrimoney) est proposé pour confirmer votre séjour.",
  },
  {
    q: "Je suis propriétaire : comment publier mon bien ?",
    a: "Sur www.konnecthouse.cd, créez un espace propriétaire avec Gmail, complétez votre profil KYC, puis ajoutez photos, prix et disponibilités. Les voyageurs vous trouvent via WhatsApp.",
  },
  {
    q: "Konnect House est-il disponible 24/7 ?",
    a: "Oui. Le bot WhatsApp Konnect House répond à tout moment pour rechercher un logement à Kinshasa.",
  },
];

export default function SeoFaq() {
  const [open, setOpen] = useState(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-10 bg-[var(--kh-bg)]"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto">
        <h2
          id="faq-heading"
          className="text-2xl sm:text-3xl font-extrabold text-[var(--kh-primary)] text-center"
        >
          Questions fréquentes — logement Kinshasa
        </h2>
        <p className="mt-3 text-center text-sm sm:text-base text-[var(--kh-text-muted)]">
          Tout savoir sur Konnect House, le bot WhatsApp pour louer ou trouver un
          logement à Kinshasa.
        </p>
        <ul className="mt-8 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li
                key={f.q}
                className="rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-4 text-left font-semibold text-[var(--kh-primary)]"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  <span>{f.q}</span>
                  <FiChevronDown
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-4 sm:px-5 pb-4 text-sm sm:text-base text-[var(--kh-text)]/90 leading-relaxed">
                    {f.a}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
