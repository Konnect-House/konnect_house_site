import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, uploadFile } from "../lib/api";
import { useAuth } from "../lib/auth";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_PHOTOS = 20;
const MIN_PHOTOS = 5;

const STEPS = [
  {
    id: "basics",
    title: "Présentation",
    subtitle: "Nom, description et tarification du logement.",
  },
  {
    id: "location",
    title: "Localisation",
    subtitle: "Ville, commune et adresse — toute la RDC.",
  },
  {
    id: "amenities",
    title: "Équipements",
    subtitle: "Ce que les voyageurs verront sur WhatsApp.",
  },
  {
    id: "photos",
    title: "Photos",
    subtitle: `Au moins ${MIN_PHOTOS} photos claires (max ${MAX_PHOTOS}, 20 Mo / image).`,
  },
];

const FALLBACK = {
  amenities: [
    { id: "wifi", label: "Wi-Fi" },
    { id: "parking", label: "Parking" },
    { id: "climatisation", label: "Climatisation" },
    { id: "eau_chaude", label: "Eau chaude" },
    { id: "securite", label: "Sécurité" },
    { id: "cuisine", label: "Cuisine" },
    { id: "salle_de_bain_privee", label: "Salle de bain privée" },
    { id: "tv", label: "TV" },
  ],
  accessPreferences: [
    { id: "pres_macadam", label: "Près du macadam / grande voie" },
    { id: "acces_facile", label: "Accès facile (voiture)" },
    { id: "quartier_calme", label: "Quartier calme" },
    { id: "proche_commerces", label: "Proche commerces / marché" },
    { id: "proche_transports", label: "Proche transports" },
  ],
};

function emptyForm(initial) {
  const photos = initial?.photos?.length ? [...initial.photos] : [];
  return {
    name: initial?.name || "",
    description: initial?.description || "",
    rooms: String(initial?.rooms ?? "1"),
    capacity: String(initial?.capacity ?? "2"),
    pricePerNight:
      initial?.pricePerNight != null ? String(initial.pricePerNight) : "",
    address: initial?.address || "",
    city: initial?.city || "",
    commune: initial?.commune || "",
    neighborhood: initial?.neighborhood || "",
    conditions: initial?.conditions || "",
    gpsLat: initial?.gpsLat != null ? String(initial.gpsLat) : "",
    gpsLng: initial?.gpsLng != null ? String(initial.gpsLng) : "",
    amenities: initial?.amenities || [],
    accessTags: initial?.accessTags || [],
    photos,
  };
}

export default function PropertyForm({
  initial,
  submitLabel,
  busy,
  error,
  onSubmit,
}) {
  const { token } = useAuth();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [catalog, setCatalog] = useState(FALLBACK);
  const [form, setForm] = useState(() => emptyForm(initial));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [stepError, setStepError] = useState("");

  const meta = STEPS[step];
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    setForm(emptyForm(initial));
    setStep(0);
    setStepError("");
  }, [initial]);

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        setCatalog({
          amenities: data.amenities?.length
            ? data.amenities
            : FALLBACK.amenities,
          accessPreferences: data.accessPreferences?.length
            ? data.accessPreferences
            : FALLBACK.accessPreferences,
        });
      })
      .catch(() => {});
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function removePhoto(i) {
    setForm((f) => ({
      ...f,
      photos: f.photos.filter((_, idx) => idx !== i),
    }));
  }

  async function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    if (!token) {
      setUploadError("Connectez-vous pour envoyer des photos.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const next = [...form.photos];
      for (const file of files) {
        if (next.length >= MAX_PHOTOS) break;
        if (!file.type.startsWith("image/")) {
          throw new Error("Formats acceptés : JPG, PNG, WebP, GIF.");
        }
        if (file.size > MAX_PHOTO_BYTES) {
          throw new Error(`« ${file.name} » dépasse 20 Mo.`);
        }
        const res = await uploadFile("/uploads/provider", {
          token,
          file,
          fields: { kind: "property-photo" },
        });
        if (res?.url) next.push(res.url);
      }
      setForm((f) => ({ ...f, photos: next }));
    } catch (err) {
      setUploadError(err.message || "Échec de l’upload.");
    } finally {
      setUploading(false);
    }
  }

  function validateStep(index) {
    if (index === 0) {
      if (!form.name.trim() || form.name.trim().length < 2) {
        return "Indiquez le nom du logement (2 caractères min.).";
      }
      if (!form.description.trim() || form.description.trim().length < 10) {
        return "La description doit faire au moins 10 caractères.";
      }
      const rooms = Number(form.rooms);
      const capacity = Number(form.capacity);
      const price = Number(form.pricePerNight);
      if (!Number.isFinite(rooms) || rooms < 1) return "Nombre de chambres invalide.";
      if (!Number.isFinite(capacity) || capacity < 1) {
        return "Capacité invalide.";
      }
      if (!Number.isFinite(price) || price < 1) {
        return "Indiquez un prix par nuit (USD).";
      }
      return "";
    }
    if (index === 1) {
      if (!form.address.trim() || form.address.trim().length < 5) {
        return "Indiquez l’adresse complète.";
      }
      if (!form.city.trim() || form.city.trim().length < 2) {
        return "Indiquez la ville (ex. Kinshasa, Lubumbashi…).";
      }
      if (!form.commune.trim() || form.commune.trim().length < 2) {
        return "Indiquez la commune, l’arrondissement ou le quartier.";
      }
      return "";
    }
    if (index === 2) return "";
    const photos = form.photos.map((p) => p.trim()).filter(Boolean);
    if (photos.length < MIN_PHOTOS) {
      return `Ajoutez au moins ${MIN_PHOTOS} photos du logement.`;
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
    setUploadError("");
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
      onSubmit(null, msg);
      return;
    }
    setStepError("");
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      rooms: Number(form.rooms),
      capacity: Number(form.capacity),
      pricePerNight: Number(form.pricePerNight),
      address: form.address.trim(),
      city: form.city.trim(),
      commune: form.commune.trim(),
      neighborhood: form.neighborhood.trim() || undefined,
      conditions: form.conditions.trim() || undefined,
      amenities: form.amenities,
      accessTags: form.accessTags,
      photos: form.photos.map((p) => p.trim()).filter(Boolean),
      category: "MAISON_DE_PASSAGE",
      gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
      gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined,
    });
  }

  const displayError = stepError || error;

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
            Maison de passage · RDC
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
                <input
                  required
                  minLength={2}
                  placeholder="Nom du logement"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={fieldClass}
                />
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  placeholder="Description (10 caractères min.)"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  className={`${fieldClass} resize-none`}
                />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Chambres"
                    value={form.rooms}
                    onChange={(e) => setField("rooms", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    type="number"
                    min={1}
                    placeholder="Capacité"
                    value={form.capacity}
                    onChange={(e) => setField("capacity", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    type="number"
                    min={1}
                    step="0.01"
                    placeholder="Prix / nuit (USD)"
                    value={form.pricePerNight}
                    onChange={(e) => setField("pricePerNight", e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <input
                  required
                  minLength={5}
                  placeholder="Adresse complète"
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  className={fieldClass}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    required
                    minLength={2}
                    placeholder="Ville (ex. Kinshasa, Lubumbashi…)"
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    required
                    minLength={2}
                    placeholder="Commune / arrondissement"
                    value={form.commune}
                    onChange={(e) => setField("commune", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <input
                  placeholder="Quartier (optionnel)"
                  value={form.neighborhood}
                  onChange={(e) => setField("neighborhood", e.target.value)}
                  className={fieldClass}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="GPS latitude (optionnel)"
                    value={form.gpsLat}
                    onChange={(e) => setField("gpsLat", e.target.value)}
                    className={fieldClass}
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="GPS longitude (optionnel)"
                    value={form.gpsLng}
                    onChange={(e) => setField("gpsLng", e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Conditions (optionnel)"
                  value={form.conditions}
                  onChange={(e) => setField("conditions", e.target.value)}
                  className={`${fieldClass} resize-none`}
                />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <fieldset>
                  <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
                    Équipements
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {catalog.amenities.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 text-sm text-[var(--kh-text)]"
                      >
                        <input
                          type="checkbox"
                          checked={form.amenities.includes(a.id)}
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              amenities: f.amenities.includes(a.id)
                                ? f.amenities.filter((x) => x !== a.id)
                                : [...f.amenities, a.id],
                            }))
                          }
                        />
                        {a.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
                    Accessibilité / emplacement
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {catalog.accessPreferences.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2 text-sm text-[var(--kh-text)]"
                      >
                        <input
                          type="checkbox"
                          checked={form.accessTags.includes(a.id)}
                          onChange={() =>
                            setForm((f) => ({
                              ...f,
                              accessTags: f.accessTags.includes(a.id)
                                ? f.accessTags.filter((x) => x !== a.id)
                                : [...f.accessTags, a.id],
                            }))
                          }
                        />
                        {a.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            ) : null}

            {step === 3 ? (
              <fieldset className="space-y-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={onPickFiles}
                />
                <button
                  type="button"
                  disabled={uploading || form.photos.length >= MAX_PHOTOS}
                  onClick={() => fileRef.current?.click()}
                  className="w-full px-4 py-3 rounded-xl border border-dashed border-[var(--kh-border)] text-sm font-semibold text-[var(--kh-blue-2)] disabled:opacity-50"
                >
                  {uploading
                    ? "Upload en cours…"
                    : form.photos.length >= MAX_PHOTOS
                      ? "Limite de photos atteinte"
                      : "Choisir des photos depuis l’appareil"}
                </button>
                {uploadError ? (
                  <p className="text-sm text-red-500" role="alert">
                    {uploadError}
                  </p>
                ) : null}
                <p className="text-xs text-[var(--kh-text-muted)]">
                  {form.photos.length} / {MAX_PHOTOS} photos · minimum{" "}
                  {MIN_PHOTOS}
                </p>
                {form.photos.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.photos.map((url, i) => (
                      <div
                        key={`${url}-${i}`}
                        className="relative rounded-xl overflow-hidden border border-[var(--kh-border)] aspect-[4/3] bg-[var(--kh-bg)]"
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 right-2 text-xs font-bold bg-black/70 text-white px-2 py-1 rounded-lg"
                        >
                          Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--kh-text-muted)]">
                    Aucune photo pour l’instant. Ajoutez au moins {MIN_PHOTOS}{" "}
                    images claires du logement.
                  </p>
                )}
              </fieldset>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {displayError ? (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {displayError}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              disabled={busy || uploading}
              className="rounded-xl border border-[var(--kh-border)] px-4 py-3 text-sm font-semibold text-[var(--kh-primary)] disabled:opacity-60"
            >
              Retour
            </button>
          ) : null}
          <button
            type="submit"
            disabled={busy || uploading}
            className="flex-1 kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
          >
            {busy
              ? "Envoi…"
              : isLast
                ? submitLabel
                : "Continuer"}
          </button>
        </div>
      </form>
    </div>
  );
}
