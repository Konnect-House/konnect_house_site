/** Numéro WhatsApp Business du bot (indicatif sans +). */
const BOT_PHONE =
  (import.meta.env.VITE_WHATSAPP_BOT_PHONE || "243898360727").replace(
    /\D/g,
    "",
  );

/** Message prérempli — ouverture neutre (le bot propose ensuite les choix). */
export const WHATSAPP_OPENER = "Bonjour Konnect House";

export function whatsappBotLink(text = WHATSAPP_OPENER) {
  return `https://wa.me/${BOT_PHONE}?text=${encodeURIComponent(text)}`;
}

export function whatsappPartnerLink() {
  return whatsappBotLink(
    "Bonjour Konnect House, je suis propriétaire et je voudrais devenir partenaire",
  );
}
