import { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function GoogleButton({ onCredential, disabled }) {
  const slot = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !slot.current || disabled) return;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !slot.current) return;
      slot.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => {
          if (res.credential) onCredential(res.credential);
        },
        ux_mode: "popup",
        auto_select: false,
      });
      window.google.accounts.id.renderButton(slot.current, {
        theme: "outline",
        size: "large",
        width: slot.current.offsetWidth || 320,
        text: "continue_with",
        locale: "fr",
        shape: "pill",
      });
    };

    if (window.google?.accounts?.id) {
      render();
    } else {
      const existing = document.querySelector("script[data-kh-gsi]");
      if (existing) {
        existing.addEventListener("load", render);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.khGsi = "1";
        script.onload = render;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [onCredential, disabled]);

  if (!CLIENT_ID) {
    return (
      <p className="text-sm text-[var(--kh-text-muted)] text-center">
        Connexion Gmail bientôt disponible. Ajoutez{" "}
        <code className="font-semibold">VITE_GOOGLE_CLIENT_ID</code> sur Vercel
        et <code className="font-semibold">GOOGLE_CLIENT_ID</code> sur Render.
      </p>
    );
  }

  return <div ref={slot} className="flex justify-center min-h-[44px] w-full" />;
}
