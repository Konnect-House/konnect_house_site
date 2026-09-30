import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, uploadFile } from "../lib/api";
import { useAuth } from "../lib/auth";
import { ID_DOCUMENT_TYPES, isHttpUrl } from "../lib/media";
import {
  PAYMENT_METHODS,
  normalizePaymentMethods,
} from "../lib/payments";
import { isValidWhatsAppPhone } from "../lib/phone";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const STEPS = [
  {
    id: "about",
    title: "Identité & adresse",
    subtitle: "Qui vous êtes et où vous habitez — toute la RDC.",
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
    title: "Contact & paiements",
    subtitle: "WhatsApp et modes que vous acceptez pour être payé.",
  },
];

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

export function emptyProviderForm(user) {
  const p = user?.providerProfile;
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || user?.whatsappNumber || "",
    avatarUrl: p?.avatarUrl || "",
    dateOfBirth: toDateInput(p?.dateOfBirth),
    profession: p?.profession || "",
    homeAddress: p?.homeAddress || "",
    homeCommune: p?.homeCommune || "",
    homeCity: p?.homeCity || "",
    propertyCount: p?.propertyCount != null ? String(p.propertyCount) : "1",
    propertyTypes: p?.propertyTypes?.length ? [...p.propertyTypes] : [],
    idDocumentType: p?.idDocumentType || "NATIONAL_ID",
    idDocumentUrl: p?.idDocumentUrl || "",
    mobileMoneyNumber: p?.mobileMoneyNumber || "",
    bankAccount: p?.bankAccount || "",
    acceptedPaymentMethods: normalizePaymentMethods(
      p?.acceptedPaymentMethods?.length
        ? p.acceptedPaymentMethods
        : ["MOBILE_MONEY"],
    ),
  };
}

export function buildProviderPayload(form) {
  return {
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
  };
}

/**
 * Step-by-step provider profile / onboarding form.
 * @param {"profile"|"onboarding"} mode
 */
export default function ProviderProfileForm({
  mode = "profile",
  initialUser,
  submitLabel,
  busy,
  error,
  success,
  eyebrow,
  onSubmit,
}) {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => emptyProviderForm(initialUser));
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [uploading, setUploading] = useState(null);
  const [stepError, setStepError] = useState("");

  const meta = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const avatarOk = useMemo(() => isHttpUrl(form.avatarUrl), [form.avatarUrl]);
  const docOk = useMemo(() => isHttpUrl(form.idDocumentUrl), [form.idDocumentUrl]);

  useEffect(() => {
    setForm(emptyProviderForm(initialUser));
    setStep(0);
    setStepError("");
    // Reset when switching user / opening a fresh session — not on every profile field refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser?.id]);

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        if (data.propertyCategories?.length) {
          setCategories(data.propertyCategories);
        }
      })
      .catch(() => {});
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
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

  async function onUpload(field, file) {
    if (!file || !token) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      setStepError("Fichier trop volumineux (max 20 Mo).");
      return;
    }
    const kind = field === "avatarUrl" ? "avatar" : "id-document";
    setUploading(field);
    setStepError("");
    try {
      const res = await uploadFile("/uploads/provider", {
        token,
        file,
        fields: { kind },
      });
      setField(field, res.url);
    } catch (err) {
      setStepError(err.message || "Upload impossible.");
    } finally {
      setUploading(null);
    }
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
      if (!form.homeCity.trim() || form.homeCity.trim().length < 2) {
        return "Indiquez votre ville.";
      }
      if (!form.homeCommune.trim() || form.homeCommune.trim().length < 2) {
        return "Indiquez votre commune, arrondissement ou quartier.";
      }
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
      return "Cochez au moins un mode de paiement accepté.";
    }
    if (
      form.acceptedPaymentMethods.includes("MOBILE_MONEY") &&
      !form.mobileMoneyNumber.trim()
    ) {
      return "Indiquez le numéro Mobile Money.";
    }
    if (
      form.acceptedPaymentMethods.includes("BANK") &&
      !form.bankAccount.trim()
    ) {
      return "Indiquez le compte bancaire.";
    }
    return "";
  }

  function goNext() {
    const msg = validateStep(step);
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }
    const msg = validateStep(step);
    if (msg) {
      setStepError(msg);
      return;
    }
    setStepError("");
    onSubmit(buildProviderPayload(form));
  }

  const displayError = stepError || error;
  const maxBirth = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18),
  )
    .toISOString()
    .slice(0, 10);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--kh-border)] bg-[var(--kh-bg-soft)]">
      <div
        className="h-1.5 w-full"
        style={{
          background:
            "linear-gradient(90deg, #011A66 0%, #3478AB 50%, #66CAE4 100%)",
        }}
      />

      <div className="flex items-center justify-between gap-3 border-b border-[var(--kh-border)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--kh-blue-2)]">
            {eyebrow ||
              (mode === "onboarding"
                ? "Onboarding partenaire"
                : "Profil fournisseur")}
          </p>
          <p className="text-xs text-[var(--kh-text-muted)]">
            Étape {step + 1} / {STEPS.length}
          </p>
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

      <form onSubmit={handleSubmit} className="px-4 py-5 sm:px-5 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-extrabold text-[var(--kh-primary)]">
                {meta.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--kh-text-muted)]">
                {meta.subtitle}
              </p>
            </div>

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
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)]">
                    {uploading === "avatarUrl" ? "Upload…" : "Choisir une photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={Boolean(uploading)}
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        onUpload("avatarUrl", e.target.files[0])
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
                  max={maxBirth}
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
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    minLength={2}
                    value={form.homeCity}
                    onChange={(e) => setField("homeCity", e.target.value)}
                    className={fieldClass}
                    placeholder="Ville (toute la RDC)"
                  />
                  <input
                    required
                    minLength={2}
                    value={form.homeCommune}
                    onChange={(e) => setField("homeCommune", e.target.value)}
                    className={fieldClass}
                    placeholder="Commune / arrond. / quartier"
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
                              : "border-[var(--kh-border)] bg-[var(--kh-bg)]"
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
                            {c.desc ? (
                              <span className="mt-0.5 block text-[11px] leading-snug text-[var(--kh-text-muted)]">
                                {c.desc}
                              </span>
                            ) : null}
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
                <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)]">
                  {uploading === "idDocumentUrl"
                    ? "Upload…"
                    : "Choisir la pièce d’identité"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    disabled={Boolean(uploading)}
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      onUpload("idDocumentUrl", e.target.files[0])
                    }
                  />
                </label>
                {docOk && !form.idDocumentUrl.toLowerCase().includes(".pdf") ? (
                  <img
                    src={form.idDocumentUrl}
                    alt="Pièce"
                    className="max-h-40 rounded-xl border border-[var(--kh-border)]"
                  />
                ) : null}
                {docOk ? (
                  <p className="text-xs text-emerald-600">Document prêt.</p>
                ) : (
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    Image ou PDF · max 20 Mo.
                  </p>
                )}
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
                    Obligatoire — clients et admin vous contactent ici.
                  </span>
                </label>
                <fieldset className="space-y-3">
                  <legend className="text-sm font-semibold text-[var(--kh-primary)]">
                    Modes de paiement acceptés
                  </legend>
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    Comment vous acceptez d’être payé par les clients et par
                    Konnect House.
                  </p>
                  <div className="grid gap-2">
                    {PAYMENT_METHODS.map((m) => {
                      const on = form.acceptedPaymentMethods.includes(m.id);
                      return (
                        <label
                          key={m.id}
                          className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
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
                          <span>
                            <span className="block font-semibold text-[var(--kh-primary)]">
                              {m.label}
                            </span>
                            <span className="block text-[11px] text-[var(--kh-text-muted)]">
                              {m.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {form.acceptedPaymentMethods.includes("MOBILE_MONEY") ? (
                  <input
                    placeholder="Numéro Mobile Money"
                    value={form.mobileMoneyNumber}
                    onChange={(e) =>
                      setField("mobileMoneyNumber", e.target.value)
                    }
                    className={fieldClass}
                  />
                ) : null}
                {form.acceptedPaymentMethods.includes("BANK") ? (
                  <input
                    placeholder="Compte bancaire"
                    value={form.bankAccount}
                    onChange={(e) => setField("bankAccount", e.target.value)}
                    className={fieldClass}
                  />
                ) : null}
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {displayError ? (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {displayError}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 text-sm text-emerald-600">{success}</p>
        ) : null}

        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={busy || Boolean(uploading)}
              className="rounded-xl border border-[var(--kh-border)] px-4 py-3 text-sm font-semibold text-[var(--kh-primary)] disabled:opacity-60"
            >
              Retour
            </button>
          ) : null}
          <button
            type="submit"
            disabled={busy || Boolean(uploading)}
            className="flex-1 kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
          >
            {busy
              ? "Enregistrement…"
              : isLast
                ? submitLabel
                : "Continuer"}
          </button>
        </div>
      </form>
    </div>
  );
}
