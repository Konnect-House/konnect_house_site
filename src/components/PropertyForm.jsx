import { useEffect, useState } from "react";
import { api } from "../lib/api";

const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-[var(--kh-bg)] border border-[var(--kh-border)] text-[var(--kh-text)] placeholder:text-[var(--kh-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--kh-blue-2)]/40";

const FALLBACK = {
  communes: ["Gombe", "Kintambo", "Ngaliema", "Limete"],
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
  const photos = initial?.photos?.length
    ? [...initial.photos]
    : ["", "", "", "", ""];
  while (photos.length < 5) photos.push("");
  return {
    name: initial?.name || "",
    description: initial?.description || "",
    rooms: String(initial?.rooms ?? "1"),
    capacity: String(initial?.capacity ?? "2"),
    pricePerNight: initial?.pricePerNight != null ? String(initial.pricePerNight) : "",
    address: initial?.address || "",
    commune: initial?.commune || "Gombe",
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
  const [catalog, setCatalog] = useState(FALLBACK);
  const [form, setForm] = useState(() => emptyForm(initial));

  useEffect(() => {
    setForm(emptyForm(initial));
  }, [initial]);

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        setCatalog({
          communes: data.communes?.length ? data.communes : FALLBACK.communes,
          amenities: data.amenities?.length ? data.amenities : FALLBACK.amenities,
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

  function setPhoto(i, value) {
    setForm((f) => {
      const photos = [...f.photos];
      photos[i] = value;
      return { ...f, photos };
    });
  }

  function addPhotoField() {
    setForm((f) => ({ ...f, photos: [...f.photos, ""] }));
  }

  function toggleAmenity(id) {
    setForm((f) => {
      const has = f.amenities.includes(id);
      return {
        ...f,
        amenities: has
          ? f.amenities.filter((a) => a !== id)
          : [...f.amenities, id],
      };
    });
  }

  function toggleAccessTag(id) {
    setForm((f) => {
      const has = f.accessTags.includes(id);
      return {
        ...f,
        accessTags: has
          ? f.accessTags.filter((a) => a !== id)
          : [...f.accessTags, id],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const photos = form.photos.map((p) => p.trim()).filter(Boolean);
    if (photos.length < 5) {
      onSubmit(null, "Ajoutez au moins 5 URLs de photos.");
      return;
    }
    onSubmit({
      name: form.name,
      description: form.description,
      rooms: Number(form.rooms),
      capacity: Number(form.capacity),
      pricePerNight: Number(form.pricePerNight),
      address: form.address,
      commune: form.commune,
      neighborhood: form.neighborhood || undefined,
      conditions: form.conditions || undefined,
      amenities: form.amenities,
      accessTags: form.accessTags,
      photos,
      category: "MAISON_DE_PASSAGE",
      gpsLat: form.gpsLat ? Number(form.gpsLat) : undefined,
      gpsLng: form.gpsLng ? Number(form.gpsLng) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[var(--kh-text-muted)]">
        Type MVP : maison de passage uniquement.
      </p>
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
      <div className="grid sm:grid-cols-3 gap-4">
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
      <input
        required
        placeholder="Adresse complète"
        value={form.address}
        onChange={(e) => setField("address", e.target.value)}
        className={fieldClass}
      />
      <select
        required
        value={form.commune}
        onChange={(e) => setField("commune", e.target.value)}
        className={fieldClass}
      >
        {catalog.communes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        placeholder="Quartier (optionnel)"
        value={form.neighborhood}
        onChange={(e) => setField("neighborhood", e.target.value)}
        className={fieldClass}
      />
      <div className="grid sm:grid-cols-2 gap-4">
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
      <fieldset>
        <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
          Équipements (affichés sur la fiche WhatsApp)
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
                onChange={() => toggleAmenity(a.id)}
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
        <p className="text-xs text-[var(--kh-text-muted)] mb-2">
          Sert au matching du bot (macadam, accès voiture, etc.).
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {catalog.accessPreferences.map((a) => (
            <label
              key={a.id}
              className="flex items-center gap-2 text-sm text-[var(--kh-text)]"
            >
              <input
                type="checkbox"
                checked={form.accessTags.includes(a.id)}
                onChange={() => toggleAccessTag(a.id)}
              />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-[var(--kh-primary)] mb-2">
          Photos (5 URLs minimum)
        </legend>
        {form.photos.map((url, i) => (
          <input
            key={i}
            type="url"
            placeholder={`URL photo ${i + 1}`}
            value={url}
            onChange={(e) => setPhoto(i, e.target.value)}
            className={fieldClass}
            required={i < 5}
          />
        ))}
        <button
          type="button"
          onClick={addPhotoField}
          className="text-sm font-semibold text-[var(--kh-blue-2)]"
        >
          + Ajouter une photo
        </button>
      </fieldset>
      {error ? (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full kh-gradient-btn kh-glow px-6 py-3 rounded-xl font-bold text-white disabled:opacity-60"
      >
        {busy ? "Envoi…" : submitLabel}
      </button>
    </form>
  );
}
