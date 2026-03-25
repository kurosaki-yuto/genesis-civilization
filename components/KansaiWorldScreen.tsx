"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import KansaiMapCanvas from "./KansaiMapCanvas";
import { fmtPop } from "@/lib/format";
import { KANSAI_CITIES } from "@/lib/kansaiMap";
import { cityWeightsTotal } from "@/lib/kansaiSim";
import type { LightPerson } from "@/lib/kansaiSim";
import type { WorldConfig, MapRegisteredUser } from "@/lib/types";

interface Props extends WorldConfig {
  registeredUsers: MapRegisteredUser[];
  viewerRole: "admin" | "user";
  highlightUserId: string | null;
  onBack: () => void;
}

export default function KansaiWorldScreen({
  name,
  goal,
  creator,
  registeredUsers,
  viewerRole,
  highlightUserId,
  onBack,
}: Props) {
  const [speed, setSpeed] = useState(1);
  const [pop, setPop] = useState(420);
  const peopleRef = useRef<LightPerson[]>([]);

  const wSum = useMemo(() => cityWeightsTotal(), []);

  useEffect(() => {
    setPop((p) => Math.max(p, 280 + registeredUsers.length * 120));
  }, [registeredUsers.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPop((p) => p + Math.max(2, Math.floor(p * 0.0012) + ((Math.random() * 3) | 0)));
    }, 280);
    return () => clearInterval(id);
  }, []);

  const cityPops = useMemo(() => {
    return KANSAI_CITIES.map((c) => ({
      name: c.name,
      pop: Math.round((pop * c.weight) / wSum),
    }));
  }, [pop, wSum]);

  return (
    <>
      <KansaiMapCanvas
        running={speed > 0}
        speedMul={speed > 0 ? speed : 0}
        pop={pop}
        peopleRef={peopleRef}
        registeredUsers={registeredUsers}
        highlightUserId={highlightUserId}
      />

      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col">
        <header className="pointer-events-auto flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <div className="max-w-xl rounded-2xl border-2 border-[var(--border)] bg-[rgba(6,18,32,.9)] backdrop-blur-md px-5 py-4 shadow-[var(--hud-shadow)]">
            <div className="text-xs font-bold tracking-[0.2em] text-[var(--accent1)] uppercase">
              {viewerRole === "admin" ? "管理者ビュー" : "ユーザービュー"}
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black text-[var(--text)]">{name}</h1>
            {viewerRole === "admin" ? (
              <>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="text-[var(--muted)]">創造主</span> {creator}
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--accent2)] leading-snug">{goal}</p>
                <p className="mt-3 text-lg font-bold tabular-nums text-[var(--text)]">
                  活動の粒 <span className="text-[var(--accent1)]">{fmtPop(pop)}</span>
                  <span className="text-[var(--muted)] text-base font-semibold ml-3">
                    登録メンバー {registeredUsers.length} 人
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  世界の目標: <span className="text-[var(--accent2)] font-semibold">{goal}</span>
                </p>
                <p className="mt-3 text-base text-[var(--text)]">
                  あなたは地図の上で<span className="text-[var(--accent1)] font-bold">人の形</span>で働いています。
                  止めなくても動き続けます。
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            <div className="flex rounded-xl border-2 border-[var(--border)] bg-[rgba(6,18,32,.9)] p-1 backdrop-blur-md">
              {([0, 1, 3, 8] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                    speed === s
                      ? "bg-[var(--accent1)] text-[#04202e]"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {s === 0 ? "止" : `${s}×`}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border-2 border-[var(--border)] bg-[rgba(6,18,32,.9)] px-4 py-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text)] backdrop-blur-md"
            >
              {viewerRole === "admin" ? "設定・トップへ" : "トップへ"}
            </button>
          </div>
        </header>

        <aside className="pointer-events-auto mt-auto sm:mt-0 sm:absolute sm:top-24 sm:right-5 w-full sm:w-[min(100%,320px)] max-h-[38vh] sm:max-h-[calc(100vh-7rem)] overflow-y-auto px-4 sm:px-0 pb-4 space-y-3">
          <div className="panel border-2 border-[var(--border)]">
            <div className="panel-title">主な都市</div>
            <ul className="space-y-2">
              {cityPops.map((c) => (
                <li
                  key={c.name}
                  className="flex justify-between items-baseline text-sm border-b border-[rgba(255,255,255,.06)] last:border-0 pb-2 last:pb-0"
                >
                  <span className="font-bold text-[var(--text)]">{c.name}</span>
                  <span className="tabular-nums text-[var(--muted)]">{fmtPop(c.pop)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel border-2 border-[var(--border-strong)]">
            <div className="panel-title">登録ユーザー（人として表示）</div>
            {registeredUsers.length === 0 ? (
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                まだ誰もいません。トップから「ユーザー」で参加してもらうと、ここに名前が出て地図を動き回ります。
              </p>
            ) : (
              <ul className="space-y-3 max-h-[200px] overflow-y-auto">
                {registeredUsers.map((u) => (
                  <li
                    key={u.id}
                    className={`text-sm border-b border-[rgba(255,255,255,.06)] last:border-0 pb-2 last:pb-0 ${
                      u.id === highlightUserId ? "text-[#fde68a]" : "text-[var(--text)]"
                    }`}
                  >
                    <div className="font-bold">{u.displayName}</div>
                    {u.motto && <div className="text-[var(--muted)] text-xs mt-0.5">{u.motto}</div>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
