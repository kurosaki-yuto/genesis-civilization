"use client";

import { fmtPop } from "@/lib/format";
import type { Settlement } from "@/lib/types";

interface Props {
  settlements: Settlement[];
}

export default function SettlementRank({ settlements }: Props) {
  const sorted = [...settlements].sort((a, b) => b.pop - a.pop).slice(0, 12);
  const maxPop = sorted.length ? sorted[0].pop : 1;

  return (
    <div className="max-h-[250px] overflow-y-auto">
      {sorted.map((s, i) => {
        const pct = Math.round((s.pop / Math.max(1, maxPop)) * 100);
        return (
          <div
            key={s.id}
            className="flex items-center gap-2 py-1.5 border-b border-[rgba(255,255,255,.03)] animate-[settleIn_.4s_both]"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="text-[11px] text-[var(--muted)] w-5 text-right flex-shrink-0">
              {i + 1}
            </span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: s.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold truncate">{s.name}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {fmtPop(s.displayPop)}人
              </div>
            </div>
            <div className="w-[60px] h-1 bg-[var(--border)] rounded-sm flex-shrink-0 overflow-hidden">
              <div
                className="h-full rounded-sm transition-[width] duration-600"
                style={{ width: `${pct}%`, background: s.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
