"use client";

import { fmtPop } from "@/lib/format";
import type { SimState } from "@/lib/types";
import SettlementRank from "./SettlementRank";
import type { Settlement } from "@/lib/types";

interface Props {
  state: SimState;
  settlements: Settlement[];
}

export default function SidePanel({ state, settlements }: Props) {
  return (
    <div className="absolute top-[5.5rem] right-5 sm:right-6 w-[min(100%,340px)] sm:w-[320px] max-h-[calc(100vh-6rem)] overflow-y-auto space-y-4 pr-1">
      <div className="panel">
        <div className="panel-title">始祖</div>
        <div className="flex gap-3 mb-3 items-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 font-bold text-[#04202e]"
            style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)" }}
          >
            α
          </div>
          <div>
            <div className="text-base font-bold text-[var(--text)]">{state.adam}</div>
            <div className="text-sm text-[var(--muted)]">{state.adamT}</div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-lg flex-shrink-0 font-bold text-[#2a1f05]"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
          >
            β
          </div>
          <div>
            <div className="text-base font-bold text-[var(--text)]">{state.eve}</div>
            <div className="text-sm text-[var(--muted)]">{state.eveT}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">文明の目標</div>
        <div className="text-base text-[var(--text-secondary)] leading-relaxed font-medium">
          {state.goal}
        </div>
        <div className="h-2 bg-[rgba(0,0,0,.35)] rounded-full mt-4 overflow-hidden border border-[var(--border)]">
          <div
            className="h-full rounded-full transition-[width] duration-700 bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)]"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">地域別人口</div>
        <SettlementRank settlements={settlements} />
      </div>

      <div className="panel">
        <div className="panel-title">統計</div>
        {[
          ["総人口", fmtPop(state.pop) + "人"],
          ["集落数", String(settlements.length)],
          ["発見", String(state.techs.length)],
          ["世代", `第${state.generation}世代`],
        ].map(([label, val]) => (
          <div
            key={label}
            className="flex justify-between py-2 text-base border-b border-[rgba(255,255,255,.06)] last:border-0"
          >
            <span className="text-[var(--muted)]">{label}</span>
            <span className="font-bold text-[var(--text)]">{val}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">発見・技術</div>
        <div className="flex flex-wrap gap-2">
          {state.techs.length === 0 ? (
            <span className="text-sm text-[var(--muted)]">まだない</span>
          ) : (
            state.techs.map((t) => (
              <span
                key={t}
                className="text-sm px-3 py-1 rounded-lg bg-[rgba(56,189,248,.12)] border border-[rgba(56,189,248,.35)] text-[var(--accent1)] font-medium"
              >
                {t}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
