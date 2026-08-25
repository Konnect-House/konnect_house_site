import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FiMenu, FiX, FiSun, FiMoon } from "react-icons/fi";
import useTheme from "../hooks/useTheme";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        scrolled
          ? "kh-glass py-3 shadow-md"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 shrink-0"
        >
          <img src={logo} alt="Konnect House" className="h-10 w-auto" />
        </a>

        {/* Liens desktop */}
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

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Changer de thème"
            className="w-10 h-10 rounded-full kh-glass flex items-center justify-center text-[var(--kh-text)] hover:text-[var(--kh-accent)] transition"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

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

        {/* Burger mobile */}
        <button
          className="lg:hidden text-[var(--kh-text)] text-2xl p-1"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </nav>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden kh-glass mx-4 mt-3 rounded-2xl"
          >
            <ul className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left px-4 py-3 rounded-xl text-[var(--kh-text-muted)] hover:bg-[var(--kh-surface)] hover:text-[var(--kh-primary)] transition font-semibold"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
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
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
