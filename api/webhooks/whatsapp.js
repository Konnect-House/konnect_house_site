/**
 * Webhook WhatsApp Business Cloud API — Konnect House
 * URL Meta : https://konnect-house-site-eight.vercel.app/api/webhooks/whatsapp
 *
 * Note : le site est Vite sur Vercel → handler serverless dans /api
 * (équivalent Next.js app/api/webhooks/whatsapp/route.js).
 */

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN ||
  "KonnectHouse_Secure_2025_KH_Verify_X9pL2";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[whatsapp webhook] verify OK");
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end(String(challenge ?? ""));
      return;
    }

    console.warn("[whatsapp webhook] verify FAILED", { mode, tokenPresent: Boolean(token) });
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

      console.log("[whatsapp webhook] POST body:", JSON.stringify(body));

      if (body.object === "whatsapp_business_account") {
        const messages = body.entry?.[0]?.changes?.[0]?.value?.messages;
        if (Array.isArray(messages)) {
          for (const message of messages) {
            const from = message.from;
            const text =
              message.text?.body ??
              message.interactive?.button_reply?.title ??
              message.interactive?.button_reply?.id ??
              message.interactive?.list_reply?.title ??
              message.type ??
              "";
            console.log("[whatsapp webhook] message from:", from, "| text:", text);
          }
        }
      } else {
        console.log("[whatsapp webhook] ignored object:", body.object);
      }
    } catch (err) {
      console.error("[whatsapp webhook] POST parse/handle error:", err);
    }

    // Toujours 200 pour que Meta ne retente pas
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("EVENT_RECEIVED");
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.statusCode = 405;
  res.end("Method Not Allowed");
}
