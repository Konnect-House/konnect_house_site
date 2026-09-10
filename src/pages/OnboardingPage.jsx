import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api, uploadFile } from "../lib/api";
import { ID_DOCUMENT_TYPES, isHttpUrl } from "../lib/media";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

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
    desc: "Logement meublé à la nuitée",
  },
  {
    id: "GUEST_HOUSE",
    label: "Guest house",
    desc: "Maison d’hôtes / chambres",
  },
  {
    id: "APPARTEMENT",
    label: "Appartement",
    desc: "Studio ou appartement entier",
  },
  { id: "HOTEL", label: "Hôtel", desc: "Établissement hôtelier" },
  {
    id: "SALON_PRIVE",
    label: "Salon privé",
    desc: "Espace événementiel / salon",
  },
];

const STEPS = [
  {
    id: "about",
    title: "Parlez-nous de vous",
    subtitle:
      "Comme chez Airbnb ou les grands portails immobiliers : une identité claire rassure les voyageurs et accélère la validation.",
  },
  {
    id: "portfolio",
    title: "Votre portefeuille",
    subtitle:
      "Indiquez combien de biens vous gérez et de quels types. Vous pourrez les publier ensuite, un par un.",
  },
  {
    id: "kyc",
    title: "Vérification d’identité (KYC)",
    subtitle:
      "Uploadez une pièce d’identité officielle. Un administrateur Konnect House la vérifiera avant d’activer votre compte (CDC §4.4.2).",
  },
  {
    id: "payouts",
    title: "Contact & reversements",
    subtitle:
      "WhatsApp pour les réservations, et les moyens de paiement pour vos revenus.",
  },
];

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
        if (data.propertyCategories?.length) {
          setCategories(data.propertyCategories);
        }
      })
      .catch(() => {});
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

  if (user?.role === "PROVIDER" && !user.needsOnboarding) {
    return <Navigate to="/proprietaire" replace />;
  }

  function toggleMethod(id) {
    setForm((f) => {
      const has = f.acceptedPaymentMethods.includes(id);
      const next = has
        ? f.acceptedPaymentMethods.filter((m) => m !== id)
        : [...f.acceptedPaymentMethods, id];
      return { ...f, acceptedPaymentMethods: next };
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
      if (!avatarOk) {
        return "Ajoutez une photo de profil (fichier ou URL https).";
      }
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
        return "Indiquez où vous habitez (adresse).";
      }
      if (!form.homeCommune.trim()) return "Choisissez votre commune.";
      return "";
    }
    if (index === 1) {
      const count = Number(form.propertyCount);
      if (!Number.isInteger(count) || count < 1) {
        return "Indiquez combien de biens vous avez (au moins 1).";
      }
      if (form.propertyTypes.length < 1) {
        return "Sélectionnez au moins un type de bien.";
      }
      return "";
    }
    if (index === 2) {
      if (!form.idDocumentType) return "Choisissez le type de pièce.";
      if (!docOk) {
        return "Uploadez votre pièce d’identité (image ou PDF, max 2,5 Mo).";
      }
      return "";
    }
    if (form.phone.trim().length < 9) {
      return "Indiquez un numéro WhatsApp valide.";
    }
    if (form.acceptedPaymentMethods.length < 1) {
      return "Choisissez au moins un moyen de paiement.";
    }
    const usesMm = form.acceptedPaymentMethods.some((m) => MM.has(m));
    if (usesMm && !form.mobileMoneyNumber.trim()) {
      return "Indiquez le numéro Mobile Money pour les reversements.";
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

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex gap-2 mb-8" aria-hidden>
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step
                ? "bg-[var(--kh-blue-2)]"
                : "bg-[var(--kh-border)]"
            }`}
          />
        ))}
      </div>

      <p className="text-sm font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
        Étape {step + 1} sur {STEPS.length}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
        {meta.title}
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">{meta.subtitle}</p>

      <form
        onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()}
        className="mt-8 space-y-5"
      >
        {step === 0 ? (
          <>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--kh-border)] bg-[var(--kh-bg)] flex items-center justify-center text-sm text-[var(--kh-text-muted)]">
                  {avatarOk ? (
                    <img
                      src={form.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "Photo"
                  )}
                </div>
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-semibold text-[var(--kh-primary)]">
                  Photo de profil
                </label>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)] hover:border-[var(--kh-blue-2)]">
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
                <p className="text-xs text-[var(--kh-text-muted)]">
                  JPG/PNG/WebP · max 2,5 Mo · stocké sur le CDN Neon.
                </p>
              </div>
            </div>

            <input
              required
              minLength={2}
              placeholder="Nom complet"
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              className={fieldClass}
            />
            <div>
              <label className="block text-sm font-semibold text-[var(--kh-primary)] mb-2">
                Date de naissance
              </label>
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
            </div>
            <input
              required
              minLength={2}
              placeholder="Profession (ex. agent immobilier, entrepreneur…)"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[var(--kh-primary)] mb-2">
                  Commune
                </label>
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
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--kh-primary)] mb-2">
                  Ville
                </label>
                <input
                  value={form.homeCity}
                  onChange={(e) => setField("homeCity", e.target.value)}
                  className={fieldClass}
                  placeholder="Kinshasa"
                />
              </div>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-[var(--kh-primary)] mb-2">
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
              <p className="mt-1 text-xs text-[var(--kh-text-muted)]">
                Estimation actuelle — vous pourrez en ajouter plus tard.
              </p>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-3">
                Types de biens (plusieurs possibles)
              </legend>
              <div className="grid gap-2">
                {categories.map((c) => {
                  const on = form.propertyTypes.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleType(c.id)}
                      className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                        on
                          ? "border-[var(--kh-blue-2)] bg-[var(--kh-blue-2)]/10"
                          : "border-[var(--kh-border)] bg-[var(--kh-bg)] hover:border-[var(--kh-blue-2)]/50"
                      }`}
                    >
                      <span className="font-semibold text-[var(--kh-primary)]">
                        {c.label}
                      </span>
                      <span className="block text-xs text-[var(--kh-text-muted)] mt-0.5">
                        {c.desc}
                      </span>
                    </button>
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
            <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--kh-border)] bg-[var(--kh-bg)] px-4 py-3 text-sm font-bold text-[var(--kh-primary)] hover:border-[var(--kh-blue-2)]">
              {uploading === "idDocumentUrl" ? "Upload…" : "Uploader la pièce d’identité"}
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
                alt="Aperçu pièce"
                className="max-h-48 rounded-xl border border-[var(--kh-border)]"
              />
            ) : null}
            {docOk ? (
              <p className="text-sm text-emerald-600">
                Document uploadé — l’admin pourra le consulter pour valider votre identité.
              </p>
            ) : (
              <p className="text-xs text-[var(--kh-text-muted)]">
                Photo nette recto ou PDF · max 2,5 Mo · CDN Neon.
              </p>
            )}
          </>
        ) : null}

        {step === 3 ? (
          <>
            <input
              type="tel"
              required
              minLength={9}
              placeholder="Téléphone WhatsApp"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={fieldClass}
            />
            <fieldset>
              <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
                Moyens de paiement acceptés
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {METHODS.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-2 text-sm text-[var(--kh-text)]"
                  >
                    <input
                      type="checkbox"
                      checked={form.acceptedPaymentMethods.includes(m.id)}
                      onChange={() => toggleMethod(m.id)}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <input
              placeholder="Numéro Mobile Money"
              value={form.mobileMoneyNumber}
              onChange={(e) => setField("mobileMoneyNumber", e.target.value)}
              className={fieldClass}
            />
            <input
              placeholder="Compte bancaire (optionnel, reversements)"
              value={form.bankAccount}
              onChange={(e) => setField("bankAccount", e.target.value)}
              className={fieldClass}
            />
            <p className="text-xs text-[var(--kh-text-muted)]">
              Un administrateur validera votre compte avant publication des
              logements.
            </p>
          </>
        ) : null}

        {error ? (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3 pt-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-3 rounded-xl font-semibold border border-[var(--kh-border)] text-[var(--kh-primary)]"
            >
              Retour
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white"
            >
              Continuer
            </button>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="flex-1 kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
            >
              {busy ? "Enregistrement…" : "Valider mon profil"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
