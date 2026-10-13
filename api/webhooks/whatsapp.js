/**
 * Webhook WhatsApp Business Cloud API — Konnect House
 * URL Meta : https://konnect-house-site-eight.vercel.app/api/webhooks/whatsapp
 *
 * IMPORTANT Vercel : attendre le forward Nest AVANT de répondre à Meta.
 * Sinon la lambda est gelée après res.end() et le bot reste silencieux.
 */

const VERIFY_TOKEN =
  process.env.WHATSAPP_VERIFY_TOKEN ||
  "konnecthouse_verify_2026";

const NEST_API_URL = (
  process.env.NEST_API_URL ||
  process.env.VITE_API_URL ||
  "https://konnect-house-backend-production.up.railway.app"
).replace(/\/$/, "");

const BOT_SECRET = process.env.BOT_PREVIEW_SECRET || "";

export const config = {
  maxDuration: 30,
};

function extractMessages(body) {
  if (!body || body.object !== "whatsapp_business_account") return [];
  const out = [];
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value;
      if (!value?.messages) continue;
      for (const message of value.messages) {
        const phone = value.contacts?.[0]?.wa_id ?? message.from;
        const profileName = value.contacts?.[0]?.profile?.name || null;
        const text =
          message.text?.body ??
          message.interactive?.button_reply?.id ??
          message.interactive?.list_reply?.id ??
          message.interactive?.button_reply?.title ??
          message.interactive?.list_reply?.title ??
          message.button?.payload ??
          message.button?.text ??
          "";
        if (phone && text) {
          out.push({
            phone: String(phone),
            text: String(text),
            profileName: profileName ? String(profileName) : null,
          });
        }
      }
    }
  }
  return out;
}

async function forwardOne(url, headers, payload, timeoutMs = 28_000) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const raw = await res.text();
  return { status: res.status, raw };
}

/**
 * 1) Payload Meta brut → Railway webhook (chemin le plus fiable)
 * 2) Fallback messages extraits → /whatsapp/incoming puis /bot/preview
 */
async function deliverToNest(rawBody, messages) {
  const headers = { "Content-Type": "application/json" };
  if (BOT_SECRET) headers["x-bot-secret"] = BOT_SECRET;

  try {
    const { status, raw } = await forwardOne(
      `${NEST_API_URL}/api/webhook/whatsapp`,
      { "Content-Type": "application/json" },
      rawBody,
      28_000,
    );
    console.log(
      "[whatsapp webhook] nest raw webhook",
      status,
      raw.slice(0, 240),
    );
    if (status >= 200 && status < 300) {
      try {
        const parsed = JSON.parse(raw);
        // Si Nest dit n’avoir rien géré (ex. status-only), tenter extract.
        if (parsed?.handled === false && messages.length) {
          /* fall through */
        } else {
          return true;
        }
      } catch {
        return true;
      }
    }
  } catch (err) {
    console.error("[whatsapp webhook] raw forward error:", err);
  }

  for (const msg of messages) {
    const endpoints = [
      `${NEST_API_URL}/api/whatsapp/incoming`,
      `${NEST_API_URL}/api/bot/preview`,
    ];
    let ok = false;
    for (const url of endpoints) {
      try {
        const { status, raw } = await forwardOne(url, headers, msg, 28_000);
        console.log(
          "[whatsapp webhook] nest forward",
          url,
          msg.phone,
          status,
          raw.slice(0, 240),
        );
        if (status >= 200 && status < 300) {
          ok = true;
          break;
        }
      } catch (err) {
        console.error("[whatsapp webhook] nest forward error:", url, err);
      }
    }
    if (!ok) {
      console.error(
        "[whatsapp webhook] FAILED to deliver message to Nest",
        msg.phone,
      );
    }
  }
  return messages.length > 0;
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
    let body = {};
    let messages = [];
    try {
      body =
        typeof req.body === "string"
          ? JSON.parse(req.body || "{}")
          : req.body || {};

      console.log("[whatsapp webhook] POST body:", JSON.stringify(body));

      messages = extractMessages(body);
      for (const m of messages) {
        console.log(
          "[whatsapp webhook] message from:",
          m.phone,
          "| text:",
          m.text,
        );
      }
    } catch (err) {
      console.error("[whatsapp webhook] POST parse error:", err);
    }

    // Await Nest (ACK immédiat côté Railway) AVANT res.end — sinon Vercel gèle le forward.
    try {
      await deliverToNest(body, messages);
    } catch (err) {
      console.error("[whatsapp webhook] nest forward error:", err);
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
