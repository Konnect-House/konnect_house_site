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

/**
 * Bouton Google fiable sur mobile :
 * - callback stable (pas de re-render GIS au milieu d’un tap)
 * - iframe GIS cliquable (opacity > 0 pour iOS Safari)
 * - largeur recalculée quand le modal s’ouvre
 */
export default function GoogleButton({
  onCredential,
  disabled,
  label = "Continuer avec Google",
}) {
  const hostRef = useRef(null);
  const gisRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  onCredentialRef.current = onCredential;

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;
    let resizeObs;

    const paint = () => {
      if (cancelled || !gisRef.current || !hostRef.current) return;
      if (!window.google?.accounts?.id) return;

      const width = Math.max(
        Math.floor(hostRef.current.getBoundingClientRect().width),
        280,
      );
      if (width < 200) {
        // Modal pas encore mesuré — réessayer au frame suivant
        requestAnimationFrame(paint);
        return;
      }

      gisRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => {
          if (res?.credential) onCredentialRef.current?.(res.credential);
        },
        ux_mode: "popup",
        auto_select: false,
        itp_support: true,
        use_fedcm_for_prompt: true,
      });
      window.google.accounts.id.renderButton(gisRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width,
        locale: "fr",
      });

      // Étire l’iframe GIS sur toute la zone tactile (mobile)
      const iframe = gisRef.current.querySelector("iframe");
      const btn = gisRef.current.querySelector("div[role='button']");
      const target = iframe || btn;
      if (target) {
        target.style.position = "absolute";
        target.style.inset = "0";
        target.style.width = "100%";
        target.style.height = "100%";
        target.style.maxWidth = "none";
        target.style.opacity = "0.02";
        target.style.cursor = "pointer";
      }
      setReady(true);
    };

    loadGsiScript()
      .then(() => {
        if (cancelled) return;
        paint();
        if (hostRef.current && typeof ResizeObserver !== "undefined") {
          resizeObs = new ResizeObserver(() => paint());
          resizeObs.observe(hostRef.current);
        }
        window.addEventListener("resize", paint);
        window.addEventListener("orientationchange", paint);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      resizeObs?.disconnect();
      window.removeEventListener("resize", paint);
      window.removeEventListener("orientationchange", paint);
    };
  }, []);

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
        <span>{ready ? label : "Chargement Google…"}</span>
      </div>
      {/*
        opacity 0.02 (pas 0) : iOS Safari ignore souvent les taps sur opacity:0.
        inset-0 + iframe étiré = une seule grosse zone tactile.
      */}
      <div
        ref={gisRef}
        className="absolute inset-0 z-10 overflow-hidden rounded-full"
        style={{ WebkitTapHighlightColor: "transparent" }}
      />
    </div>
  );
}
