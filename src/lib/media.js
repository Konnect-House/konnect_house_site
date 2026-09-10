export function isHttpUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
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
