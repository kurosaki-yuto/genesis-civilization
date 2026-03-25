"use client";

import { useEffect, useState } from "react";

interface Props {
  title: string;
  subtitle: string;
  onDone: () => void;
}

export default function CinematicOverlay({ title, subtitle, onDone }: Props) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onDone, 600);
    }, 3200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center flex-col px-6 transition-opacity duration-600 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-[rgba(3,8,16,0.92)] backdrop-blur-md" />
      <div className="world-atmosphere__stars absolute inset-0 opacity-50" aria-hidden />
      <h2 className="relative z-10 text-center text-[clamp(1.75rem,5vw,3.25rem)] font-black text-[var(--text)] leading-tight max-w-[90vw] animate-[cinIn_.9s_forwards] drop-shadow-[0_4px_32px_rgba(0,0,0,.8)]">
        {title}
      </h2>
      <p className="relative z-10 text-[var(--text-secondary)] mt-6 text-lg sm:text-xl text-center max-w-lg font-medium leading-relaxed animate-[cinIn_.9s_.15s_forwards] opacity-0 [animation-fill-mode:forwards]">
        {subtitle}
      </p>
    </div>
  );
}
