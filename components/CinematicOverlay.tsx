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
      setTimeout(onDone, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center flex-col bg-[rgba(7,7,14,.9)] backdrop-blur-[30px] transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <h2 className="text-[clamp(1.8rem,4vw,3.5rem)] font-black text-center bg-gradient-to-br from-[var(--accent1)] via-[var(--accent2)] to-[var(--accent3)] bg-clip-text text-transparent animate-[cinIn_1s_forwards]">
        {title}
      </h2>
      <p className="text-[var(--muted)] mt-4 text-lg animate-[cinIn_1s_.3s_forwards] opacity-0">
        {subtitle}
      </p>
    </div>
  );
}
