import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import {
  fileToDataUrl,
  ID_DOCUMENT_TYPES,
  isMediaUrl,
  KYC_LABELS,
} from "../lib/media";

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
  { id: "MAISON_DE_PASSAGE", label: "Maison de passage" },
  { id: "GUEST_HOUSE", label: "Guest house" },
  { id: "APPARTEMENT", label: "Appartement" },
  { id: "HOTEL", label: "Hôtel" },
  { id: "SALON_PRIVE", label: "Salon privé" },
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

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => emptyForm(user));
  const [communes, setCommunes] = useState(FALLBACK_COMMUNES);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setForm(emptyForm(user));
  }, [user]);

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        if (data.communes?.length) setCommunes(data.communes);
        if (data.propertyCategories?.length) setCategories(data.propertyCategories);
      })
      .catch(() => {});
  }, []);

  const avatarOk = useMemo(() => isMediaUrl(form.avatarUrl), [form.avatarUrl]);
  const docOk = useMemo(() => isMediaUrl(form.idDocumentUrl), [form.idDocumentUrl]);

  if (!user) return <Navigate to="/" replace />;

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

  async function onFile(field, file) {
    try {
      const url = await fileToDataUrl(file);
      setField(field, url);
      setError("");
    } catch (err) {
      setError(err.message || "Upload impossible.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setOk("");
    setError("");
    if (!avatarOk) {
      setError("Photo de profil invalide.");
      return;
    }
    if (!docOk) {
      setError("Pièce d’identité requise (image ou PDF, max 2,5 Mo).");
      return;
    }
    const usesMm = form.acceptedPaymentMethods.some((m) => MM.has(m));
    if (usesMm && !form.mobileMoneyNumber.trim()) {
      setError("Indiquez le numéro Mobile Money.");
      return;
    }
    setBusy(true);
    try {
      await updateProfile({
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
      setOk("Profil enregistré. Si vous avez changé la pièce d’identité, le KYC repasse en revue.");
    } catch (err) {
      setError(err.message || "Mise à jour impossible.");
    } finally {
      setBusy(false);
    }
  }

  const kyc = user.providerProfile?.kycStatus;

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-5 sm:px-6 sm:py-10">
      <p className="text-xs font-bold uppercase tracking-wider text-[var(--kh-blue-2)]">
        Profil fournisseur
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-[var(--kh-primary)]">
        Mes informations
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Modifiez votre identité, votre adresse, vos moyens de paiement et votre
        pièce KYC.
      </p>
      <p className="mt-3 text-sm font-semibold text-[var(--kh-primary)]">
        Statut : {KYC_LABELS[kyc] || kyc || "—"} · compte {user.status}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-[var(--kh-border)] bg-[var(--kh-bg)]">
            {avatarOk ? (
              <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onFile("avatarUrl", e.target.files[0])}
              className="block w-full text-sm"
            />
            <input
              placeholder="Ou URL de photo"
              value={form.avatarUrl.startsWith("data:") ? "" : form.avatarUrl}
              onChange={(e) => setField("avatarUrl", e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <input required minLength={2} placeholder="Nom complet" value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} className={fieldClass} />
        <input type="tel" required minLength={9} placeholder="WhatsApp" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={fieldClass} />
        <input type="date" required value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} className={fieldClass} />
        <input required placeholder="Profession" value={form.profession} onChange={(e) => setField("profession", e.target.value)} className={fieldClass} />
        <input required placeholder="Adresse" value={form.homeAddress} onChange={(e) => setField("homeAddress", e.target.value)} className={fieldClass} />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.homeCommune} onChange={(e) => setField("homeCommune", e.target.value)} className={fieldClass}>
            {communes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input value={form.homeCity} onChange={(e) => setField("homeCity", e.target.value)} className={fieldClass} placeholder="Ville" />
        </div>

        <input type="number" min={1} value={form.propertyCount} onChange={(e) => setField("propertyCount", e.target.value)} className={fieldClass} />
        <div className="grid gap-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.propertyTypes.includes(c.id)} onChange={() => toggleType(c.id)} />
              {c.label}
            </label>
          ))}
        </div>

        <fieldset className="rounded-2xl border border-[var(--kh-border)] p-4">
          <legend className="px-1 text-sm font-bold text-[var(--kh-primary)]">
            Pièce d’identité (KYC)
          </legend>
          <select
            value={form.idDocumentType}
            onChange={(e) => setField("idDocumentType", e.target.value)}
            className={`${fieldClass} mb-3`}
          >
            {ID_DOCUMENT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files?.[0] && onFile("idDocumentUrl", e.target.files[0])}
            className="mb-2 block w-full text-sm"
          />
          {docOk && form.idDocumentUrl.startsWith("data:image/") ? (
            <img src={form.idDocumentUrl} alt="Pièce" className="mb-2 max-h-40 rounded-xl border border-[var(--kh-border)]" />
          ) : null}
          {docOk ? (
            <p className="text-xs text-emerald-600">Document prêt à l’envoi.</p>
          ) : (
            <p className="text-xs text-[var(--kh-text-muted)]">Uploadez une photo nette ou un PDF.</p>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <label key={m.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.acceptedPaymentMethods.includes(m.id)} onChange={() => toggleMethod(m.id)} />
              {m.label}
            </label>
          ))}
        </div>
        <input placeholder="Numéro Mobile Money" value={form.mobileMoneyNumber} onChange={(e) => setField("mobileMoneyNumber", e.target.value)} className={fieldClass} />
        <input placeholder="Compte bancaire (optionnel)" value={form.bankAccount} onChange={(e) => setField("bankAccount", e.target.value)} className={fieldClass} />

        {error ? <p className="text-sm text-red-500" role="alert">{error}</p> : null}
        {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

        <button type="submit" disabled={busy} className="w-full kh-gradient-btn rounded-xl px-6 py-3 font-bold text-white disabled:opacity-60">
          {busy ? "Enregistrement…" : "Enregistrer le profil"}
        </button>
      </form>
    </main>
  );
}
