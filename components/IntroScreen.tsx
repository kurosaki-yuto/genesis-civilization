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
      setTimeout(onComplete, 1500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[var(--bg)] flex items-center justify-center flex-col transition-opacity duration-[1500ms] ${hiding ? "opacity-0 pointer-events-none" : ""}`}
    >
      <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black tracking-[.15em] bg-gradient-to-br from-[var(--accent1)] via-[var(--accent2)] to-[var(--accent3)] bg-clip-text text-transparent animate-[fadeUp_2s_.5s_forwards] opacity-0">
        GENESIS
      </h1>
      <p className="text-[var(--muted)] text-[clamp(.9rem,2vw,1.2rem)] mt-4 animate-[fadeUp_2s_1.5s_forwards] opacity-0 font-light tracking-[.3em]">
        あなたの文明を、ゼロから創れ
      </p>
    </div>
  );
}
