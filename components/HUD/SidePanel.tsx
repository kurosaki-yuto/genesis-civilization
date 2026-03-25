"use client";

import { fmtPop } from "@/lib/format";
import type { SimState, RegisteredUser } from "@/lib/types";
import SettlementRank from "./SettlementRank";
import type { Settlement } from "@/lib/types";
import RegisteredUsers from "../RegisteredUsers";

interface Props {
  state: SimState;
  settlements: Settlement[];
  registeredUsers: RegisteredUser[];
}

export default function SidePanel({ state, settlements, registeredUsers }: Props) {
  return (
    <div className="absolute top-20 right-6 w-[280px] max-h-[calc(100vh-100px)] overflow-y-auto space-y-3">
      {/* Founders */}
      <div className="panel">
        <div className="panel-title">始祖</div>
        <div className="flex gap-3 mb-2 items-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-[rgba(168,85,247,.2)] border-2 border-[#a855f7]">
            ♂
          </div>
          <div>
            <div className="text-sm font-bold">{state.adam}</div>
            <div className="text-[11px] text-[var(--muted)]">{state.adamT}</div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 bg-[rgba(72,153,236,.2)] border-2 border-[#ec4899]">
            ♀
          </div>
          <div>
            <div className="text-sm font-bold">{state.eve}</div>
            <div className="text-[11px] text-[var(--muted)]">{state.eveT}</div>
          </div>
        </div>
      </div>

      {/* Goal */}
      <div className="panel">
        <div className="panel-title">目標</div>
        <div className="text-sm text-[var(--accent3)] leading-relaxed">{state.goal}</div>
        <div className="h-[3px] bg-[var(--border)] rounded mt-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent1)] to-[var(--accent2)] transition-[width] duration-800"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      </div>

      {/* Registered Users */}
      <RegisteredUsers users={registeredUsers} />

      {/* Settlement rank */}
      <div className="panel">
        <div className="panel-title">地域別人口</div>
        <SettlementRank settlements={settlements} />
      </div>

      {/* Stats */}
      <div className="panel">
        <div className="panel-title">統計</div>
        {[
          ["総人口", fmtPop(state.pop) + "人"],
          ["集落数", String(settlements.length)],
          ["発見", String(state.techs.length)],
          ["世代", `第${state.generation}世代`],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between py-1 text-sm border-b border-[rgba(255,255,255,.03)] last:border-0">
            <span className="text-[var(--muted)]">{label}</span>
            <span className="font-bold">{val}</span>
          </div>
        ))}
      </div>

      {/* Techs */}
      <div className="panel">
        <div className="panel-title">発見・技術</div>
        <div className="flex flex-wrap gap-1">
          {state.techs.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-[rgba(168,85,247,.1)] border border-[rgba(168,85,247,.2)] text-[var(--accent1)]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
