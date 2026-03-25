"use client";

import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHiding(true);
      setTimeout(onComplete, 1200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-[1200ms] ${
        hiding ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#061428] via-[#0a1e36] to-[#051210]" />
      <div className="world-atmosphere__stars absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute rounded-full opacity-40 blur-3xl w-[min(90vw,520px)] h-[min(90vw,520px)] bg-gradient-to-br from-[#38bdf8] via-[#0ea5e9] to-[#fbbf24]"
        style={{ top: "18%", transform: "translateY(-10%)" }}
        aria-hidden
      />
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <p className="text-sm font-bold tracking-[0.4em] text-[var(--accent1)] uppercase mb-6 animate-[fadeUp_1.2s_.2s_forwards] opacity-0">
          文明創世
        </p>
        <h1 className="text-[clamp(2.75rem,10vw,5rem)] font-black tracking-[0.06em] text-[var(--text)] drop-shadow-[0_0_40px_rgba(56,189,248,0.35)] animate-[fadeUp_1.2s_.5s_forwards] opacity-0 leading-tight">
          GENESIS
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] font-medium leading-relaxed animate-[fadeUp_1.2s_1.1s_forwards] opacity-0">
          星の表面が、あなたの意思で動き出す。
        </p>
        <p className="mt-3 text-base text-[var(--muted)] animate-[fadeUp_1.2s_1.4s_forwards] opacity-0">
          海・盆地・港・山。地図がそのまま、物語になる。
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[rgba(4,18,14,0.9)] to-transparent pointer-events-none"
        aria-hidden
      />
    </div>
  );
}
