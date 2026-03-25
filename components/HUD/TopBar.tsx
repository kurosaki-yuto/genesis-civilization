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
    { val: 0, label: "⏸", id: "spP" },
    { val: 1, label: "1×", id: "sp1" },
    { val: 4, label: "4×", id: "sp4" },
    { val: 16, label: "16×", id: "sp16" },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-5">
      <div>
        <div
          className="text-[10px] uppercase tracking-[.3em] font-semibold"
          style={{ color: state.era.c }}
        >
          {state.era.n}
        </div>
        <div className="text-4xl font-black leading-none mt-1 bg-gradient-to-br from-white to-[#aaa] bg-clip-text text-transparent">
          {fmtYear(state.year)}
        </div>
        <div className="text-sm text-[var(--muted)] mt-1">
          人口 <b className="text-[var(--accent3)] font-extrabold">{fmtPop(state.pop)}人</b> — 第{state.generation}世代
        </div>
      </div>
      <div className="flex gap-1 items-center bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-1">
        {speeds.map((s) => (
          <button
            key={s.id}
            onClick={() => onSpeedChange(s.val)}
            className={`px-3 py-1.5 rounded-[7px] text-sm font-medium transition-colors ${
              speed === s.val
                ? "bg-[var(--accent1)] text-white"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
