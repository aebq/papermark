import { useEffect, useState } from "react";

// Branded full-screen loader shown while a document is being prepared.
// DeepCity identity: navy background, Satoshi Black wordmark, and a tapered
// "sillage" spinner (conic-gradient masked into a ring). Honest indeterminate
// indicator — it shows activity without faking any progress.
const BRAND_NAME = "DeepCity";

export default function DocumentLoader() {
  // Only reveal the loader if the wait is actually noticeable (~150ms), so a
  // fast (warm) load never flashes a spinner. The navy background shows
  // immediately to avoid any white flash.
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  const satoshi = "'Satoshi', ui-sans-serif, system-ui, sans-serif";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-screen w-full items-center justify-center"
      style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
    >
      <style>{`
        @keyframes dc-spin { to { transform: rotate(360deg); } }
        .dc-spin { animation: dc-spin 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dc-spin { animation-duration: 2.4s; }
        }
      `}</style>

      <div
        className="flex flex-col items-center gap-6"
        style={{ opacity: show ? 1 : 0, transition: "opacity .3s ease" }}
      >
        <div
          style={{
            fontFamily: satoshi,
            fontWeight: 900,
            fontSize: "1.25rem",
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}
        >
          {BRAND_NAME}
        </div>

        <div
          aria-hidden="true"
          className="dc-spin"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              "conic-gradient(from 90deg at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 40%, #ffffff 100%)",
            WebkitMaskImage: "radial-gradient(transparent 15px, #000 16px)",
            maskImage: "radial-gradient(transparent 15px, #000 16px)",
          }}
        />

        <div
          style={{
            fontFamily: satoshi,
            fontSize: "13.5px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: "0.01em",
          }}
        >
          Chargement du document…
        </div>
      </div>
    </div>
  );
}
