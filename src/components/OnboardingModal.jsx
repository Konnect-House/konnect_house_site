import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaHome, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { FiCheck, FiX, FiMessageCircle } from "react-icons/fi";
import logo from "../assets/removebg.png";

const SEEKER_LINK = "https://wa.me/243821616193?text=Menu";
const BACKDROP_KEY = "kh-onboarding-seen";

const steps = [
  {
    title: "Vos coordonnées",
    fields: [
      { name: "name", label: "Nom complet", type: "text", placeholder: "Ex: Jean Mbemba" },
      { name: "phone", label: "Téléphone WhatsApp", type: "tel", placeholder: "Ex: +243 82 161 61 93" },
    ],
  },
  {
    title: "Votre logement",
    fields: [
      { name: "propertyType", label: "Type de logement", type: "select", options: ["Appartement", "Maison", "Studio", "Villa / Lodge", "Espace événementiel"] },
      { name: "location", label: "Quartier / Commune", type: "text", placeholder: "Ex: Gombe, Limete, Ngaliema..." },
    ],
  },
  {
    title: "Détails",
    fields: [
      { name: "rooms", label: "Nombre de chambres", type: "text", placeholder: "Ex: 2 chambres, salon, cuisine" },
      { name: "rent", label: "Loyer mensuel approximatif (USD)", type: "text", placeholder: "Ex: 500 USD" },
    ],
  },
  {
    title: "Message final",
    fields: [
      { name: "message", label: "Autres informations", type: "textarea", placeholder: "Décrivez votre logement, disponibilité, ou toute info utile..." },
    ],
  },
];

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(true);
  const [mode, setMode] = useState(null); // null | 'seeker' | 'owner'
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    propertyType: "",
    location: "",
    rooms: "",
    rent: "",
    message: "",
  });
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem(BACKDROP_KEY);
    if (seen) setIsOpen(false);
  }, []);

  const close = () => {
    setIsOpen(false);
    sessionStorage.setItem(BACKDROP_KEY, "1");
  };

  const chooseSeeker = () => {
    window.open(SEEKER_LINK, "_blank");
    setMode("seeker");
    setDone(true);
  };

  const chooseOwner = () => {
    setMode("owner");
    setStep(0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const currentStepFields = steps[step].fields;
  const currentStepValid = currentStepFields.every((f) => {
    if (f.type === "select") return form[f.name];
    return form[f.name].trim().length > 0;
  });

  const nextStep = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const submit = () => {
    const text = [
      "Bonjour Konnect House, je suis propriétaire et je veux devenir partenaire.",
      "",
      `Nom : ${form.name}`,
      `Téléphone : ${form.phone}`,
      `Type de logement : ${form.propertyType}`,
      `Localisation : ${form.location}`,
      `Chambres : ${form.rooms}`,
      `Loyer : ${form.rent}`,
      `Message : ${form.message}`,
    ].join("\n");

    window.open(
      `https://wa.me/243821616193?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setDone(true);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "rgba(10, 14, 26, 0.72)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[440px] max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"
              style={{
                background: "var(--kh-bg-soft)",
                border: "1px solid var(--kh-border)",
              }}
            >
              {/* Bouton fermer */}
              <button
                onClick={close}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-[var(--kh-text-muted)] hover:bg-[var(--kh-bg)] hover:text-[var(--kh-primary)] transition z-10"
                aria-label="Fermer"
              >
                <FiX size={18} />
              </button>

              {/* Étape 1 : Welcome */}
              {!mode && !done && (
                <div className="px-8 py-10 sm:px-10 sm:py-12 text-center">
                  {/* Logo navbar complet */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-6"
                  >
                    <img
                      src={logo}
                      alt="Konnect House"
                      className="h-16 sm:h-20 w-auto mx-auto drop-shadow-lg"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--kh-primary)] mb-3">
                      Bienvenue sur Konnect House
                    </h2>
                    <p className="text-[var(--kh-text-muted)] leading-relaxed mb-8 max-w-xs mx-auto text-sm sm:text-base">
                      Votre assistant immobilier sur WhatsApp. Trouvez ou mettez en location un logement à Kinshasa en quelques minutes.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="flex flex-col gap-3"
                  >
                    <button
                      onClick={chooseSeeker}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      }}
                    >
                      <FaWhatsapp className="text-2xl" />
                      Je cherche une maison
                      <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      onClick={chooseOwner}
                      className="group w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-bold text-[var(--kh-primary)] transition-all hover:scale-[1.02] border"
                      style={{
                        background: "var(--kh-bg)",
                        borderColor: "var(--kh-border)",
                      }}
                    >
                      <FaHome className="text-xl text-[var(--kh-blue-2)]" />
                      Publier mon logement
                    </button>
                  </motion.div>



                  {/* Petite décoration */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] overflow-hidden">
                    <div
                      className="h-full w-full"
                      style={{
                        background: "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Étape 2+ : Formulaire propriétaire */}
              {mode === "owner" && !done && (
                <div className="px-7 py-8 sm:px-9 sm:py-10">
                  {/* Header étape */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{
                        background: "linear-gradient(135deg, #011A66 0%, #3478AB 100%)",
                      }}
                    >
                      <FaHome size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[var(--kh-primary)]">
                        Devenir partenaire
                      </h3>
                      <p className="text-xs text-[var(--kh-text-muted)] font-medium">
                        Étape {step + 1} sur {steps.length}
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="w-full h-2 bg-[var(--kh-bg)] rounded-full mb-6 overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{
                        background: "linear-gradient(90deg, #011A66 0%, #3478AB 100%)",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <h4 className="text-lg font-bold text-[var(--kh-primary)] mb-4">
                    {steps[step].title}
                  </h4>

                  <div className="space-y-4">
                    {currentStepFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-[var(--kh-primary)] mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40"
                          >
                            <option value="" disabled>
                              Sélectionnez
                            </option>
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            rows={4}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40 resize-none"
                          />
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={prevStep}
                      disabled={step === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-[var(--kh-text-muted)] disabled:opacity-40 hover:text-[var(--kh-primary)] hover:bg-[var(--kh-bg)] transition"
                    >
                      <FaArrowLeft size={12} /> Précédent
                    </button>

                    {step < steps.length - 1 ? (
                      <button
                        onClick={nextStep}
                        disabled={!currentStepValid}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white kh-gradient-btn disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                      >
                        Suivant <FaArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={submit}
                        disabled={!currentStepValid}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                        }}
                      >
                        Envoyer <FaWhatsapp />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Écran de succès */}
              {done && (
                <div className="px-8 py-10 sm:px-10 sm:py-12 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mb-6">
                    <FiCheck size={40} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[var(--kh-primary)] mb-3">
                    {mode === "seeker"
                      ? "Conversation lancée !"
                      : "Demande envoyée !"}
                  </h3>
                  <p className="text-[var(--kh-text-muted)] mb-8 text-sm sm:text-base">
                    {mode === "seeker"
                      ? "Le bot Konnect House va vous guider pour trouver votre logement."
                      : "Notre équipe va examiner votre dossier et vous recontacter très vite."}
                  </p>
                  <button
                    onClick={close}
                    className="kh-gradient-btn text-white font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105 shadow-md"
                  >
                    Découvrir la page
                  </button>
                </div>
              )}

              {/* Décoration bandeau haut (commun) */}
              <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] overflow-hidden pointer-events-none">
                <div
                  className="h-full w-full"
                  style={{
                    background: "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button to reopen onboarding */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            setMode(null);
            setStep(0);
            setDone(false);
            setIsOpen(true);
            sessionStorage.removeItem(BACKDROP_KEY);
          }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 transition"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          }}
          aria-label="Ouvrir le menu de démarrage"
        >
          <FaWhatsapp />
        </motion.button>
      )}
    </>
  );
}
