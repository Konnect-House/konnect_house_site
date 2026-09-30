/** Shared payment method options for provider onboarding / profile. */
export const PAYMENT_METHODS = [
  {
    id: "MOBILE_MONEY",
    label: "Mobile Money",
    hint: "M-Pesa, Airtel Money, Orange Money…",
  },
  {
    id: "BANK",
    label: "Banque",
    hint: "Virement / compte bancaire",
  },
  {
    id: "CASH",
    label: "Cash",
    hint: "Espèces à la remise des clés",
  },
];

const LEGACY_MAP = {
  MPESA: "MOBILE_MONEY",
  AIRTEL_MONEY: "MOBILE_MONEY",
  ORANGE_MONEY: "MOBILE_MONEY",
  CARD: "BANK",
  BANK_TRANSFER: "BANK",
};

/** Normalize stored methods (incl. anciens IDs) vers MOBILE_MONEY / BANK / CASH. */
export function normalizePaymentMethods(raw = []) {
  const out = [];
  for (const m of raw) {
    const id = LEGACY_MAP[m] || m;
    if (
      (id === "MOBILE_MONEY" || id === "BANK" || id === "CASH") &&
      !out.includes(id)
    ) {
      out.push(id);
    }
  }
  return out;
}

export function paymentMethodLabel(id) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label || id;
}
