import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../lib/auth";
import { api, uploadFile } from "../lib/api";
import { ID_DOCUMENT_TYPES, isHttpUrl } from "../lib/media";
import BrandLogo from "../components/BrandLogo";
import { isValidWhatsAppPhone } from "../lib/phone";

const fieldClass =
  "w-full px-3.5 py-2.5 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40 text-sm";

const METHODS = [
  { id: "MPESA", label: "M-Pesa" },
  { id: "AIRTEL_MONEY", label: "Airtel Money" },
  { id: "ORANGE_MONEY", label: "Orange Money" },
  { id: "CARD", label: "Carte" },
];

const MM = new Set(["MPESA", "AIRTEL_MONEY", "ORANGE_MONEY"]);

const FALLBACK_COMMUNES = ["Gombe", "Kintambo", "Ngaliema", "Limete"];
const FALLBACK_CATEGORIES = [
  {
    id: "MAISON_DE_PASSAGE",
    label: "Maison de passage",
    desc: "Nuitée meublée",
  },
  { id: "GUEST_HOUSE", label: "Guest house", desc: "Chambres d’hôtes" },
  { id: "APPARTEMENT", label: "Appartement", desc: "Studio / entier" },
  { id: "HOTEL", label: "Hôtel", desc: "Établissement" },
  { id: "SALON_PRIVE", label: "Salon privé", desc: "Événementiel" },
];

const STEPS = [
  {
    id: "about",
    title: "Parlez-nous de vous",
    subtitle: "Identité et adresse — pour rassurer voyageurs et validation admin.",
  },
  {
    id: "portfolio",
    title: "Votre portefeuille",
    subtitle: "Combien de biens, et de quels types ?",
  },
  {
    id: "kyc",
    title: "Vérification d’identité",
    subtitle: "Pièce officielle pour le KYC Konnect House.",
  },
  {
    id: "payouts",
    title: "Contact & reversements",
    subtitle: "WhatsApp obligatoire et moyens de paiement.",
  },
];

function CheckMark({ on }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
        on
          ? "border-[var(--kh-blue-2)] bg-[var(--kh-blue-2)] text-white"
          : "border-[var(--kh-border)] bg-[var(--kh-bg-soft)]"
      }`}
      aria-hidden
    >
      {on ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 4.8 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function emptyForm(user) {
  const p = user?.providerProfile;
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || user?.whatsappNumber || "",
    avatarUrl: p?.avatarUrl || "",
    dateOfBirth: toDateInput(p?.dateOfBirth),
    profession: p?.profession || "",
    homeAddress: p?.homeAddress || "",
    homeCommune: p?.homeCommune || "Gombe",
    homeCity: p?.homeCity || "Kinshasa",
    propertyCount: p?.propertyCount != null ? String(p.propertyCount) : "1",
    propertyTypes: p?.propertyTypes?.length ? [...p.propertyTypes] : [],
    idDocumentType: p?.idDocumentType || "NATIONAL_ID",
    idDocumentUrl: p?.idDocumentUrl || "",
    mobileMoneyNumber: p?.mobileMoneyNumber || "",
    bankAccount: p?.bankAccount || "",
    acceptedPaymentMethods: p?.acceptedPaymentMethods?.length
      ? [...p.acceptedPaymentMethods]
      : ["MPESA"],
  };
}

export default function OnboardingPage() {
  const { user, token, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => emptyForm(user));
  const [communes, setCommunes] = useState(FALLBACK_COMMUNES);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm((f) => {
      const next = emptyForm(user);
      return {
        ...next,
        fullName: f.fullName || next.fullName,
        phone: f.phone || next.phone,
        avatarUrl: f.avatarUrl || next.avatarUrl,
        dateOfBirth: f.dateOfBirth || next.dateOfBirth,
        profession: f.profession || next.profession,
        homeAddress: f.homeAddress || next.homeAddress,
        homeCommune: f.homeCommune || next.homeCommune,
        homeCity: f.homeCity || next.homeCity,
        propertyCount: f.propertyCount || next.propertyCount,
        propertyTypes: f.propertyTypes.length
          ? f.propertyTypes
          : next.propertyTypes,
        idDocumentType: f.idDocumentType || next.idDocumentType,
        idDocumentUrl: f.idDocumentUrl || next.idDocumentUrl,
        mobileMoneyNumber: f.mobileMoneyNumber || next.mobileMoneyNumber,
        bankAccount: f.bankAccount || next.bankAccount,
        acceptedPaymentMethods: f.acceptedPaymentMethods.length
          ? f.acceptedPaymentMethods
          : next.acceptedPaymentMethods,
      };
    });
  }, [user]);

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        if (data.communes?.length) setCommunes(data.communes);
        if (data.propertyCategories?.length) setCategories(data.propertyCategories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const meta = STEPS[step];
  const avatarOk = useMemo(() => isHttpUrl(form.avatarUrl), [form.avatarUrl]);
  const docOk = useMemo(() => isHttpUrl(form.idDocumentUrl), [form.idDocumentUrl]);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onMediaFile(field, file) {
    if (!file || !token) return;
    const kind = field === "avatarUrl" ? "avatar" : "id-document";
    setUploading(field);
    setError("");
    try {
      const res = await uploadFile("/uploads/provider", {
        token,
        file,
        fields: { kind },
      });
      setField(field, res.url);
    } catch (err) {
      setError(err.message || "Upload impossible.");
    } finally {
      setUploading(null);
    }
  }

  function toggleMethod(id) {
    setForm((f) => {
      const has = f.acceptedPaymentMethods.includes(id);
      return {
        ...f,
        acceptedPaymentMethods: has
          ? f.acceptedPaymentMethods.filter((m) => m !== id)
          : [...f.acceptedPaymentMethods, id],
      };
    });
  }

  function toggleType(id) {
    setForm((f) => {
      const has = f.propertyTypes.includes(id);
      return {
        ...f,
        propertyTypes: has
          ? f.propertyTypes.filter((t) => t !== id)
          : [...f.propertyTypes, id],
      };
    });
  }

  function validateStep(index) {
    if (index === 0) {
      if (!form.fullName.trim() || form.fullName.trim().length < 2) {
        return "Indiquez votre nom complet.";
      }
      if (!avatarOk) return "Uploadez une photo de profil.";
      if (!form.dateOfBirth) return "Indiquez votre date de naissance.";
      const birth = new Date(form.dateOfBirth);
      const age =
        (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      if (Number.isNaN(birth.getTime()) || age < 18) {
        return "Vous devez avoir au moins 18 ans.";
      }
      if (!form.profession.trim() || form.profession.trim().length < 2) {
        return "Indiquez votre profession.";
      }
      if (!form.homeAddress.trim() || form.homeAddress.trim().length < 5) {
        return "Indiquez où vous habitez.";
      }
      if (!form.homeCommune.trim()) return "Choisissez votre commune.";
      return "";
    }
    if (index === 1) {
      const count = Number(form.propertyCount);
      if (!Number.isInteger(count) || count < 1) {
        return "Indiquez au moins 1 bien.";
      }
      if (form.propertyTypes.length < 1) {
        return "Cochez au moins un type de bien.";
      }
      return "";
    }
    if (index === 2) {
      if (!form.idDocumentType) return "Choisissez le type de pièce.";
      if (!docOk) return "Uploadez votre pièce d’identité.";
      return "";
    }
    if (!isValidWhatsAppPhone(form.phone)) {
      return "Numéro WhatsApp obligatoire (ex. +243 8XX XXX XXX).";
    }
    if (form.acceptedPaymentMethods.length < 1) {
      return "Cochez au moins un moyen de paiement.";
    }
    const usesMm = form.acceptedPaymentMethods.some((m) => MM.has(m));
    if (usesMm && !form.mobileMoneyNumber.trim()) {
      return "Indiquez le numéro Mobile Money.";
    }
    return "";
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = validateStep(3);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await completeOnboarding({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        avatarUrl: form.avatarUrl.trim(),
        dateOfBirth: form.dateOfBirth,
        profession: form.profession.trim(),
        homeAddress: form.homeAddress.trim(),
        homeCommune: form.homeCommune.trim(),
        homeCity: form.homeCity.trim() || "Kinshasa",
        propertyCount: Number(form.propertyCount),
        propertyTypes: form.propertyTypes,
        idDocumentType: form.idDocumentType,
        idDocumentUrl: form.idDocumentUrl.trim(),
        mobileMoneyNumber: form.mobileMoneyNumber.trim() || undefined,
        bankAccount: form.bankAccount.trim() || undefined,
        acceptedPaymentMethods: form.acceptedPaymentMethods,
      });
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Impossible d’enregistrer le profil.");
    } finally {
      setBusy(false);
    }
  }

  if (user?.role === "PROVIDER" && !user.needsOnboarding) {
    return <Navigate to="/proprietaire" replace />;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(102,202,228,0.28), transparent 55%), radial-gradient(900px 500px at 100% 0%, rgba(52,120,171,0.35), transparent 50%), #0A0E1A",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex w-full max-w-[560px] max-h-[min(92dvh,900px)] flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] border border-white/10 bg-[var(--kh-bg-soft)] shadow-2xl"
        >
          <div
            className="h-1.5 w-full shrink-0"
            style={{
              background:
                "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
            }}
          />

          <div className="flex items-center justify-between gap-3 border-b border-[var(--kh-border)] px-5 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo className="h-8 w-auto shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--kh-blue-2)]">
                  Onboarding partenaire
                </p>
                <p className="truncate text-xs text-[var(--kh-text-muted)]">
                  Étape {step + 1} / {STEPS.length}
                </p>
              </div>
            </div>
            <div className="flex gap-1" aria-hidden>
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1.5 w-6 rounded-full sm:w-8 ${
                    i <= step ? "bg-[var(--kh-blue-2)]" : "bg-[var(--kh-border)]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            <h1 className="text-xl font-extrabold text-[var(--kh-primary)] sm:text-2xl">
              {meta.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
              {meta.subtitle}
            </p>

            <form
              id="kh-onboarding-form"
              onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()}
              className="mt-5 space-y-3.5"
            >
              {step === 0 ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--kh-border)] bg-[var(--kh-bg)] text-xs text-[var(--kh-text-muted)]">
                      {avatarOk ? (
                        <img
                          src={form.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "Photo"
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-3.5 py-2.5 text-sm font-bold text-[var(--kh-primary)]">
                      {uploading === "avatarUrl" ? "Upload…" : "Choisir une photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={Boolean(uploading)}
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          onMediaFile("avatarUrl", e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                  <input
                    required
                    minLength={2}
                    placeholder="Nom complet"
                    value={form.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    type="date"
                    max={new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18),
                    )
                      .toISOString()
                      .slice(0, 10)}
                    value={form.dateOfBirth}
                    onChange={(e) => setField("dateOfBirth", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    minLength={2}
                    placeholder="Profession"
                    value={form.profession}
                    onChange={(e) => setField("profession", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    minLength={5}
                    placeholder="Adresse où vous habitez"
                    value={form.homeAddress}
                    onChange={(e) => setField("homeAddress", e.target.value)}
                    className={fieldClass}
                  />
                  <div className="grid grid-cols-2 gap-2.5">
                    <select
                      value={form.homeCommune}
                      onChange={(e) => setField("homeCommune", e.target.value)}
                      className={fieldClass}
                    >
                      {communes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.homeCity}
                      onChange={(e) => setField("homeCity", e.target.value)}
                      className={fieldClass}
                      placeholder="Ville"
                    />
                  </div>
                </>
              ) : null}

              {step === 1 ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[var(--kh-primary)]">
                      Combien de biens gérez-vous ?
                    </label>
                    <input
                      required
                      type="number"
                      min={1}
                      max={500}
                      value={form.propertyCount}
                      onChange={(e) => setField("propertyCount", e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold text-[var(--kh-primary)]">
                      Types de biens
                      <span className="ml-1 font-normal text-[var(--kh-text-muted)]">
                        (plusieurs possibles)
                      </span>
                    </legend>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {categories.map((c) => {
                        const on = form.propertyTypes.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex cursor-pointer items-start gap-2 rounded-xl border px-2.5 py-2.5 transition ${
                              on
                                ? "border-[var(--kh-blue-2)] bg-[var(--kh-blue-2)]/10"
                                : "border-[var(--kh-border)] bg-[var(--kh-bg)] hover:border-[var(--kh-blue-2)]/40"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={on}
                              onChange={() => toggleType(c.id)}
                            />
                            <CheckMark on={on} />
                            <span className="min-w-0">
                              <span className="block text-sm font-bold leading-tight text-[var(--kh-primary)]">
                                {c.label}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-snug text-[var(--kh-text-muted)]">
                                {c.desc}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              ) : null}

              {step === 2 ? (
                <>
                  <select
                    value={form.idDocumentType}
                    onChange={(e) => setField("idDocumentType", e.target.value)}
                    className={fieldClass}
                  >
                    {ID_DOCUMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                  <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)]">
                    {uploading === "idDocumentUrl"
                      ? "Upload…"
                      : "Uploader la pièce d’identité"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      disabled={Boolean(uploading)}
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        onMediaFile("idDocumentUrl", e.target.files[0])
                      }
                    />
                  </label>
                  {docOk && !form.idDocumentUrl.toLowerCase().includes(".pdf") ? (
                    <img
                      src={form.idDocumentUrl}
                      alt="Aperçu"
                      className="max-h-36 rounded-xl border border-[var(--kh-border)]"
                    />
                  ) : null}
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    {docOk
                      ? "Document prêt pour validation admin."
                      : "Image ou PDF · max 2,5 Mo."}
                  </p>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-[var(--kh-primary)]">
                      Numéro WhatsApp <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="tel"
                      required
                      minLength={9}
                      placeholder="+243 8XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      className={fieldClass}
                      autoComplete="tel"
                    />
                    <span className="text-xs text-[var(--kh-text-muted)]">
                      Obligatoire — les clients et l’admin vous contactent sur ce
                      numéro.
                    </span>
                  </label>
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold text-[var(--kh-primary)]">
                      Moyens de paiement
                    </legend>
                    <div className="grid grid-cols-2 gap-2">
                      {METHODS.map((m) => {
                        const on = form.acceptedPaymentMethods.includes(m.id);
                        return (
                          <label
                            key={m.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                              on
                                ? "border-[var(--kh-blue-2)] bg-[var(--kh-blue-2)]/10"
                                : "border-[var(--kh-border)] bg-[var(--kh-bg)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={on}
                              onChange={() => toggleMethod(m.id)}
                            />
                            <CheckMark on={on} />
                            <span className="font-semibold text-[var(--kh-primary)]">
                              {m.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <input
                    placeholder="Numéro Mobile Money"
                    value={form.mobileMoneyNumber}
                    onChange={(e) =>
                      setField("mobileMoneyNumber", e.target.value)
                    }
                    className={fieldClass}
                  />
                  <input
                    placeholder="Compte bancaire (optionnel)"
                    value={form.bankAccount}
                    onChange={(e) => setField("bankAccount", e.target.value)}
                    className={fieldClass}
                  />
                </>
              ) : null}

              {error ? (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          </div>

          <div className="flex shrink-0 gap-2 border-t border-[var(--kh-border)] bg-[var(--kh-bg-soft)] px-5 py-3.5 sm:px-7">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-xl border border-[var(--kh-border)] px-4 py-2.5 text-sm font-semibold text-[var(--kh-primary)]"
              >
                Retour
              </button>
            ) : null}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={Boolean(uploading)}
                className="kh-gradient-btn flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                form="kh-onboarding-form"
                disabled={busy || Boolean(uploading)}
                className="kh-gradient-btn flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Enregistrement…" : "Valider mon profil"}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
