import { Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
} from "react-icons/fa";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";
import logo from "../assets/removebg.png";

const socials = [
  {
    icon: FaWhatsapp,
    href: "https://wa.me/243829790981?text=Salut%20Konnect%20House",
    label: "WhatsApp",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/konnecthouse_rdc",
    label: "Instagram",
  },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/company/konnecthouse-rdc/",
    label: "LinkedIn",
  },
  {
    icon: FaFacebookF,
    href: "https://web.facebook.com/people/KonnectHouse/61576937339756/",
    label: "Facebook",
  },
];

export default function Footer() {
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const ownerLoggedIn = user?.role === "PROVIDER" || user?.role === "ADMIN";
  return (
    <footer className="relative border-t border-[var(--kh-border)] py-12 px-6 lg:px-10 bg-[var(--kh-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src={logo} alt="Konnect House" className="h-10 w-auto" />
            <p className="text-sm text-[var(--kh-text-muted)] max-w-xs text-center md:text-left">
              Votre immo idéal, simplifié. Un bot WhatsApp pour trouver ou louer
              un logement à Kinshasa.
            </p>
          </div>

          {/* Liens */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--kh-text-muted)]">
            {ownerLoggedIn ? (
              <Link
                to="/proprietaire"
                className="hover:text-[var(--kh-primary)] transition"
              >
                Espace propriétaire
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="hover:text-[var(--kh-primary)] transition"
              >
                Espace propriétaire
              </button>
            )}
            <a href="#" className="hover:text-[var(--kh-primary)] transition">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-[var(--kh-primary)] transition">
              Conditions d'utilisation
            </a>
            <a
              href="https://wa.me/243821616193?text=Menu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--kh-primary)] transition"
            >
              Contact
            </a>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex items-center gap-3 justify-center md:justify-end">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="w-10 h-10 rounded-full kh-glass flex items-center justify-center text-[var(--kh-text-muted)] hover:text-white hover:bg-[var(--kh-blue)] transition bg-[var(--kh-bg-soft)]"
              >
                <s.icon />
              </a>
            ))}
          </div>
        </div>

        {/* Bas de page */}
        <div className="mt-10 pt-6 border-t border-[var(--kh-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--kh-text-muted)]">
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <select className="bg-transparent text-[var(--kh-text-muted)] outline-none cursor-pointer">
              <option value="fr" className="bg-[var(--kh-bg-soft)]">
                Français
              </option>
              <option value="en" className="bg-[var(--kh-bg-soft)]">
                English
              </option>
            </select>
          </div>
          <span>© 2025 Konnect House. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
