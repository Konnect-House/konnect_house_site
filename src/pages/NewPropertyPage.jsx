import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

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
};

export default function NewPropertyPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState(FALLBACK);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    rooms: "1",
    capacity: "2",
    pricePerNight: "",
    address: "",
    commune: "Gombe",
    neighborhood: "",
    conditions: "",
    amenities: [],
    photos: ["", "", "", "", ""],
  });

  useEffect(() => {
    api("/catalog")
      .then((data) => {
        setCatalog({
          communes: data.communes?.length ? data.communes : FALLBACK.communes,
          amenities: data.amenities?.length ? data.amenities : FALLBACK.amenities,
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

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const photos = form.photos.map((p) => p.trim()).filter(Boolean);
    if (photos.length < 5) {
      setError("Ajoutez au moins 5 URLs de photos.");
      return;
    }
    if (user?.status === "PENDING") {
      setError("Votre compte n’est pas encore validé par un administrateur.");
      return;
    }
    setBusy(true);
    try {
      await api("/properties", {
        token,
        method: "POST",
        body: {
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
          photos,
          category: "MAISON_DE_PASSAGE",
        },
      });
      navigate("/proprietaire", { replace: true });
    } catch (err) {
      setError(err.message || "Publication impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link
        to="/proprietaire"
        className="text-sm font-semibold text-[var(--kh-blue-2)]"
      >
        ← Mes logements
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-[var(--kh-primary)]">
        Nouveau logement
      </h1>
      <p className="mt-2 text-[var(--kh-text-muted)]">
        Maison de passage uniquement. Minimum 5 photos (URLs).
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
          placeholder="Adresse"
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
        <textarea
          rows={3}
          placeholder="Conditions (optionnel)"
          value={form.conditions}
          onChange={(e) => setField("conditions", e.target.value)}
          className={`${fieldClass} resize-none`}
        />
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
                  onChange={() => toggleAmenity(a.id)}
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
              required
              placeholder={`URL photo ${i + 1}`}
              value={url}
              onChange={(e) => setPhoto(i, e.target.value)}
              className={fieldClass}
            />
          ))}
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
          {busy ? "Envoi…" : "Soumettre le logement"}
        </button>
      </form>
    </main>
  );
}
