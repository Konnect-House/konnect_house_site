import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import useTheme from "../hooks/useTheme";
import { useAuth } from "../lib/auth";
import { useAuthModal } from "../lib/authModal";
import logo from "../assets/removebg.png";

const navLinks = [
  { label: "Comment ça marche", href: "#how" },
  { label: "Logements", href: "#listings" },
  { label: "Propriétaires", href: "#partners" },
  { label: "Avis", href: "#testimonials" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { openLogin } = useAuthModal();
  const ownerLoggedIn = user?.role === "PROVIDER" || user?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNavClick = (href) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        menuOpen
          ? "bg-[var(--kh-bg)] py-4"
          : scrolled
            ? "kh-glass py-3 shadow-md"
            : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 shrink-0 relative z-[70]"
        >
          <img src={logo} alt="Konnect House" className="h-10 w-auto" />
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)] transition-colors font-semibold"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="w-10 h-10 rounded-full kh-glass flex items-center justify-center text-[var(--kh-text)] hover:text-[var(--kh-accent)] transition"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {ownerLoggedIn ? (
            <Link
              to="/proprietaire"
              className="text-sm font-semibold text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)] transition-colors"
            >
              Espace propriétaire
            </Link>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="text-sm font-semibold text-[var(--kh-text-muted)] hover:text-[var(--kh-primary)] transition-colors"
            >
              Espace propriétaire
            </button>
          )}
          <a
            href="https://wa.me/243821616193?text=Menu"
            target="_blank"
            rel="noopener noreferrer"
            className="kh-gradient-btn kh-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-transform hover:scale-105"
          >
            <FaWhatsapp className="text-base" />
            Démarrer sur WhatsApp
          </a>
        </div>

        <button
          className="lg:hidden relative z-[70] text-[var(--kh-text)] text-2xl p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Menu"}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-[60] bg-[var(--kh-bg)]"
          >
            <div className="h-full overflow-y-auto pt-24 px-6 pb-10">
              <ul className="flex flex-col gap-1 max-w-md mx-auto">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="w-full text-left px-4 py-4 rounded-xl text-[var(--kh-text)] hover:bg-[var(--kh-bg-soft)] transition font-semibold text-lg"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li className="mt-4">
                  {ownerLoggedIn ? (
                    <Link
                      to="/proprietaire"
                      onClick={() => setMenuOpen(false)}
                      className="block text-center px-4 py-3 rounded-xl text-[var(--kh-primary)] font-bold border border-[var(--kh-border)] bg-[var(--kh-bg-soft)]"
                    >
                      Espace propriétaire
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        openLogin();
                      }}
                      className="w-full text-center px-4 py-3 rounded-xl text-[var(--kh-primary)] font-bold border border-[var(--kh-border)] bg-[var(--kh-bg-soft)]"
                    >
                      Espace propriétaire
                    </button>
                  )}
                </li>
                <li className="mt-2">
                  <a
                    href="https://wa.me/243821616193?text=Menu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center px-4 py-3 rounded-xl text-white font-bold kh-gradient-btn"
                  >
                    <FaWhatsapp className="inline mr-2 text-base" />
                    Démarrer sur WhatsApp
                  </a>
                </li>
                <li className="mt-4 flex justify-center">
                  <button
                    onClick={toggle}
                    aria-label="Changer de thème"
                    className="w-12 h-12 rounded-full border border-[var(--kh-border)] bg-[var(--kh-bg-soft)] flex items-center justify-center text-[var(--kh-text)]"
                  >
                    {theme === "dark" ? <FiSun /> : <FiMoon />}
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
