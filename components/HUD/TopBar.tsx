"use client";

import { fmtYear, fmtPop } from "@/lib/format";
import type { SimState } from "@/lib/types";

interface Props {
  state: SimState;
  speed: number;
  onSpeedChange: (s: number) => void;
}

export default function TopBar({ state, speed, onSpeedChange }: Props) {
  const speeds = [
    { val: 0, label: "停止", id: "spP" },
    { val: 1, label: "1×", id: "sp1" },
    { val: 4, label: "4×", id: "sp4" },
    { val: 16, label: "16×", id: "sp16" },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 p-5 sm:p-6 pr-[min(360px,42vw)]">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-[rgba(8,18,32,.88)] backdrop-blur-md px-5 py-4 shadow-[var(--hud-shadow)] max-w-[min(100%,520px)]">
        <div className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent1)] mb-1">
          時代
        </div>
        <div className="text-lg sm:text-xl font-bold mb-1" style={{ color: state.era.c }}>
          {state.era.n}
        </div>
        <div className="text-3xl sm:text-4xl font-black leading-none text-[var(--text)] tracking-tight">
          {fmtYear(state.year)}
        </div>
        <div className="text-base text-[var(--text-secondary)] mt-2">
          人口{" "}
          <span className="font-extrabold text-[var(--accent2)] tabular-nums">{fmtPop(state.pop)}</span>
          人 · 第{state.generation}世代
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 items-center rounded-xl border-2 border-[var(--border)] bg-[rgba(8,18,32,.88)] p-1.5 backdrop-blur-md self-start">
        {speeds.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSpeedChange(s.val)}
            className={`px-3.5 py-2 rounded-lg text-sm font-bold transition-colors ${
              speed === s.val
                ? "bg-[var(--accent1)] text-[#04202e]"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[rgba(255,255,255,.06)]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
