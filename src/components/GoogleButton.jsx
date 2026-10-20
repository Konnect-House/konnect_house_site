import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13.2 24 13.2c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.7 7.3l6.3 5.2C38.4 37.3 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function loadGsiScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  const existing = document.querySelector("script[data-kh-gsi]");
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.khGsi = "1";
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function gisTextForLabel(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("inscri")) return "signup_with";
  if (l.includes("connect")) return "signin_with";
  return "continue_with";
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(hover: none)").matches ||
    (navigator.maxTouchPoints || 0) > 0
  );
}

/**
 * Bouton Google — mobile : bouton officiel GIS (cliquable).
 * Desktop : calque GIS transparent au-dessus du libellé custom.
 */
export default function GoogleButton({
  onCredential,
  disabled,
  label = "Se connecter avec Google",
}) {
  const hostRef = useRef(null);
  const gisRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const labelRef = useRef(label);
  const paintTimer = useRef(null);
  const lastWidth = useRef(0);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const mobile = isCoarsePointer();

  onCredentialRef.current = onCredential;
  labelRef.current = label;

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;
    let resizeObs;

    const stretchHitTarget = (root) => {
      if (!root) return;
      const nodes = [
        ...root.querySelectorAll("iframe"),
        ...root.querySelectorAll("div[role='button']"),
        ...root.querySelectorAll("div"),
      ];
      for (const target of nodes) {
        target.style.position = "absolute";
        target.style.inset = "0";
        target.style.width = "100%";
        target.style.height = "100%";
        target.style.maxWidth = "none";
        target.style.minHeight = "48px";
        target.style.cursor = "pointer";
        target.style.pointerEvents = "auto";
        // Ne jamais passer sous ~0.02 : iOS ignore les taps sur éléments « invisibles »
        if (!mobile) {
          target.style.opacity = "0.02";
          target.setAttribute("aria-hidden", "true");
        } else {
          target.style.opacity = "1";
        }
      }
    };

    const paint = () => {
      if (cancelled || !gisRef.current || !hostRef.current) return;
      if (!window.google?.accounts?.id) return;

      const width = Math.max(
        Math.floor(hostRef.current.getBoundingClientRect().width),
        280,
      );
      // Évite de re-rendre pendant un tap (ResizeObserver trop agressif sur mobile)
      if (Math.abs(width - lastWidth.current) < 8 && gisRef.current.childNodes.length) {
        return;
      }
      lastWidth.current = width;
      if (width < 200) {
        requestAnimationFrame(paint);
        return;
      }

      gisRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => {
          if (res?.credential) onCredentialRef.current?.(res.credential);
        },
        // popup plus fiable que FedCM sur Safari iOS dans un modal
        ux_mode: "popup",
        auto_select: false,
        itp_support: true,
        use_fedcm_for_prompt: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(gisRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: gisTextForLabel(labelRef.current),
        width,
        locale: "fr",
      });

      stretchHitTarget(gisRef.current);
      // L’iframe GIS arrive souvent un tick plus tard
      requestAnimationFrame(() => {
        if (cancelled) return;
        stretchHitTarget(gisRef.current);
        setReady(true);
      });
      setTimeout(() => {
        if (!cancelled) stretchHitTarget(gisRef.current);
      }, 150);
      setTimeout(() => {
        if (!cancelled) stretchHitTarget(gisRef.current);
      }, 400);
    };

    const schedulePaint = () => {
      clearTimeout(paintTimer.current);
      paintTimer.current = setTimeout(paint, mobile ? 180 : 80);
    };

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        paint();
        if (hostRef.current && typeof ResizeObserver !== "undefined") {
          resizeObs = new ResizeObserver(() => schedulePaint());
          resizeObs.observe(hostRef.current);
        }
        window.addEventListener("orientationchange", schedulePaint);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(paintTimer.current);
      resizeObs?.disconnect();
      window.removeEventListener("orientationchange", schedulePaint);
    };
  }, [mobile, label]);

  if (!CLIENT_ID) {
    return (
      <p className="text-sm text-[var(--kh-text-muted)] text-center">
        Connexion Gmail bientôt disponible. Ajoutez{" "}
        <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> sur Vercel.
      </p>
    );
  }

  if (failed) {
    return (
      <p className="text-sm text-red-500 text-center" role="alert">
        Impossible de charger Google. Vérifiez votre connexion et réessayez.
      </p>
    );
  }

  // Mobile : bouton officiel visible (hitbox native Google).
  if (mobile) {
    return (
      <div
        ref={hostRef}
        className={`relative w-full min-h-[52px] ${disabled ? "pointer-events-none opacity-60" : ""}`}
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        {!ready ? (
          <div className="w-full min-h-[52px] flex items-center justify-center gap-3 px-5 py-3.5 rounded-full bg-white text-[#1f1f1f] font-semibold border border-[#dadce0]">
            <GoogleMark />
            <span>{label}</span>
          </div>
        ) : null}
        <div
          ref={gisRef}
          className="w-full min-h-[52px] flex items-center justify-center [&>div]:w-full [&>div]:flex [&>div]:justify-center"
          style={{
            touchAction: "manipulation",
            minHeight: 52,
          }}
          aria-label={label}
        />
      </div>
    );
  }

  // Desktop : libellé custom + calque GIS transparent
  return (
    <div
      ref={hostRef}
      className={`relative w-full min-h-12 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div
        className="w-full min-h-12 flex items-center justify-center gap-3 px-5 py-3.5 rounded-full bg-white text-[#1f1f1f] font-semibold border border-[#dadce0] shadow-sm pointer-events-none select-none"
        aria-hidden
      >
        <GoogleMark />
        <span>{label}</span>
      </div>
      <div
        ref={gisRef}
        className="absolute inset-0 z-20 rounded-full"
        style={{
          WebkitTapHighlightColor: "transparent",
          touchAction: "manipulation",
        }}
      />
    </div>
  );
}
