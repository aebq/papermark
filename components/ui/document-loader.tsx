import { useEffect, useState } from "react";

// Branded full-screen loader shown while a document is being prepared.
// Matches the DeepCity identity: dark navy background, Satoshi Black wordmark,
// a thin progress bar with a "trickle" percentage that climbs while loading.
const BRAND_NAME = "DeepCity";

export default function DocumentLoader() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let p = 0;
    // Trickle toward ~90% while the document loads. The loader is unmounted by
    // its parent as soon as the document is ready, so the climb feels honest
    // (it never pretends to reach 100% before the content is actually shown).
    const id = setInterval(() => {
      if (p < 90) {
        p += Math.max(0.4, (90 - p) * 0.06);
        setPct(p);
      }
    }, 95);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex h-screen w-full flex-col items-center justify-center gap-[22px]"
      style={{ backgroundColor: "#0f172a", color: "#ffffff" }}
    >
      <div
        style={{
          fontFamily: "'Satoshi', ui-sans-serif, system-ui, sans-serif",
          fontWeight: 900,
          fontSize: "1.25rem",
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}
      >
        {BRAND_NAME}
      </div>

      <div
        style={{
          position: "relative",
          width: 220,
          height: 2,
          borderRadius: 9999,
          overflow: "hidden",
          backgroundColor: "rgba(255,255,255,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            borderRadius: 9999,
            backgroundColor: "#ffffff",
            transition: "width .25s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum" 1',
        }}
      >
        {Math.round(pct)}%
      </div>
    </div>
  );
}
