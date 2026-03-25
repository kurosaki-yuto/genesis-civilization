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
    <div className="max-h-[280px] overflow-y-auto">
      {sorted.map((s, i) => {
        const pct = Math.round((s.pop / Math.max(1, maxPop)) * 100);
        return (
          <div
            key={s.id}
            className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,.06)] animate-[settleIn_.35s_both]"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <span className="text-sm text-[var(--muted)] w-6 text-right flex-shrink-0 font-bold tabular-nums">
              {i + 1}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-[rgba(255,255,255,.2)]"
              style={{ background: s.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-bold text-[var(--text)] truncate">{s.name}</div>
              <div className="text-sm text-[var(--muted)] tabular-nums">{fmtPop(s.displayPop)}人</div>
            </div>
            <div className="w-14 h-1.5 bg-[rgba(0,0,0,.35)] rounded-full flex-shrink-0 overflow-hidden border border-[var(--border)]">
              <div
                className="h-full rounded-full transition-[width] duration-600"
                style={{ width: `${pct}%`, background: s.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
