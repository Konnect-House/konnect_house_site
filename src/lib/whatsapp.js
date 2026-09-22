/** Numéro WhatsApp Business du bot (indicatif sans +). */
const BOT_PHONE =
  (import.meta.env.VITE_WHATSAPP_BOT_PHONE || "243834471129").replace(
    /\D/g,
    "",
  );

/** Message prérempli — ouverture neutre (le bot propose ensuite les choix). */
export const WHATSAPP_OPENER = "Bonjour konnecthouse";

export function whatsappBotLink(text = WHATSAPP_OPENER) {
  return `https://wa.me/${BOT_PHONE}?text=${encodeURIComponent(text)}`;
}

export function whatsappPartnerLink() {
  return whatsappBotLink(
    "Bonjour konnecthouse, je suis propriétaire et je voudrais devenir partenaire",
  );
}
