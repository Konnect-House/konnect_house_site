const MAX_BYTES = 2.5 * 1024 * 1024;

export function isMediaUrl(value) {
  if (!value || typeof value !== "string") return false;
  const v = value.trim();
  if (v.startsWith("http://") || v.startsWith("https://")) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }
  return (
    (v.startsWith("data:image/") || v.startsWith("data:application/pdf")) &&
    v.length < 3_500_000
  );
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Aucun fichier."));
      return;
    }
    const okType =
      file.type.startsWith("image/") || file.type === "application/pdf";
    if (!okType) {
      reject(new Error("Formats acceptés : image (JPG/PNG/WebP) ou PDF."));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("Fichier trop volumineux (max 2,5 Mo)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(file);
  });
}

export const ID_DOCUMENT_TYPES = [
  { id: "NATIONAL_ID", label: "Carte d’identité / carte d’électeur" },
  { id: "PASSPORT", label: "Passeport" },
  { id: "DRIVERS_LICENSE", label: "Permis de conduire" },
  { id: "OTHER", label: "Autre pièce officielle" },
];

export const KYC_LABELS = {
  PENDING: "KYC non soumis",
  SUBMITTED: "KYC en revue",
  APPROVED: "Identité vérifiée",
  REJECTED: "KYC refusé",
};
