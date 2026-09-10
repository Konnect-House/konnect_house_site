/** Normalise un numéro (RDC / international) en chiffres seuls. */
export function normalizePhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 9) {
    digits = `243${digits.slice(1)}`;
  }
  return digits;
}

/** WhatsApp valide : au moins 11 chiffres après normalisation (ex. 2438XXXXXXXX). */
export function isValidWhatsAppPhone(raw) {
  const digits = normalizePhone(raw);
  return digits.length >= 11 && digits.length <= 15;
}
