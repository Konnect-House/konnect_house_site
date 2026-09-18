/**
 * Webhook WhatsApp Business Cloud API — Konnect House
 * URL Meta : https://konnect-house-site-eight.vercel.app/api/webhooks/whatsapp
 *
 * Verify Meta ici, puis forward vers Nest (parcours CDC / ConversationService).
 */

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN ||
  "KonnectHouse_Secure_2025_KH_Verify_X9pL2";

const NEST_API_URL = (
  process.env.NEST_API_URL ||
  process.env.VITE_API_URL ||
  "https://konnect-house-backend-production.up.railway.app"
).replace(/\/$/, "");

const BOT_SECRET = process.env.BOT_PREVIEW_SECRET || "";

function extractMessages(body) {
  if (!body || body.object !== "whatsapp_business_account") return [];
  const out = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value?.messages) continue;
      for (const message of value.messages) {
        const phone = value.contacts?.[0]?.wa_id ?? message.from;
        const text =
          message.text?.body ??
          message.interactive?.button_reply?.id ??
          message.interactive?.list_reply?.id ??
          message.interactive?.button_reply?.title ??
          "";
        if (phone && text) {
          out.push({ phone: String(phone), text: String(text) });
        }
      }
    }
  }
  return out;
}

async function forwardOne(url, headers, msg) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(msg),
  });
  const raw = await res.text();
  return { status: res.status, raw };
}

async function forwardToNest(messages) {
  if (!messages.length) return;
  const headers = { "Content-Type": "application/json" };
  if (BOT_SECRET) headers["x-bot-secret"] = BOT_SECRET;

  // Prefer dedicated ingress; fall back to bot/preview (same CDC handler).
  const endpoints = [
    `${NEST_API_URL}/api/whatsapp/incoming`,
    `${NEST_API_URL}/api/bot/preview`,
  ];

  for (const msg of messages) {
    let delivered = false;
    for (const url of endpoints) {
      try {
        const { status, raw } = await forwardOne(url, headers, msg);
        console.log(
          "[whatsapp webhook] nest forward",
          url,
          msg.phone,
          status,
          raw.slice(0, 160),
        );
        if (status >= 200 && status < 300) {
          delivered = true;
          break;
        }
      } catch (err) {
        console.error("[whatsapp webhook] nest forward error:", url, err);
      }
    }
    if (!delivered) {
      console.error(
        "[whatsapp webhook] FAILED to deliver message to Nest",
        msg.phone,
      );
    }
  }
}

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

    console.warn("[whatsapp webhook] verify FAILED", {
      mode,
      tokenPresent: Boolean(token),
    });
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  if (req.method === "POST") {
    // Ack Meta ASAP-ish after processing (Nest reply is the user-facing latency)
    try {
      const body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      console.log("[whatsapp webhook] POST body:", JSON.stringify(body));

      const messages = extractMessages(body);
      for (const m of messages) {
        console.log(
          "[whatsapp webhook] message from:",
          m.phone,
          "| text:",
          m.text,
        );
      }

      await forwardToNest(messages);
    } catch (err) {
      console.error("[whatsapp webhook] POST parse/handle error:", err);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("EVENT_RECEIVED");
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.statusCode = 405;
  res.end("Method Not Allowed");
}
