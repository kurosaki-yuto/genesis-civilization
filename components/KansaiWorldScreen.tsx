"use client";

import { useRef, useState, useMemo } from "react";
import KansaiMapCanvas from "./KansaiMapCanvas";
import { KANSAI_CITIES } from "@/lib/kansaiMap";
import type { LightPerson } from "@/lib/kansaiSim";
import type { WorldConfig, MapRegisteredUser } from "@/lib/types";

interface Props {
  name: string;
  goal: string;
  creator: string;
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
  const peopleRef = useRef<LightPerson[]>([]);

  // 光の粒 = ユーザー1人あたり15個 + ベース20個
  const lightCount = useMemo(
    () => 20 + registeredUsers.length * 15,
    [registeredUsers.length]
  );

  return (
    <>
      <KansaiMapCanvas
        running={speed > 0}
        speedMul={speed > 0 ? speed : 0}
        pop={lightCount}
        peopleRef={peopleRef}
        registeredUsers={registeredUsers}
        highlightUserId={highlightUserId}
      />

      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col">
        {/* ── 上部バー ── */}
        <header className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="rounded-xl bg-[rgba(6,18,32,.85)] backdrop-blur-md border border-[var(--border)] px-4 py-2.5 shadow-lg">
              <h1 className="text-lg sm:text-xl font-black text-[var(--text)] truncate">{name}</h1>
              <p className="text-xs text-[var(--muted)] truncate mt-0.5">
                {viewerRole === "admin" ? `管理者 · ${creator}` : goal}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[rgba(6,18,32,.85)] backdrop-blur-md border border-[var(--border)] px-3 py-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-[var(--accent1)] animate-pulse" />
              <span className="text-sm font-bold text-[var(--text)] tabular-nums">
                {registeredUsers.length}
              </span>
              <span className="text-xs text-[var(--muted)]">人が活動中</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--border)] bg-[rgba(6,18,32,.85)] p-0.5 backdrop-blur-md">
              {([0, 1, 3, 8] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    speed === s
                      ? "bg-[var(--accent1)] text-[#04202e]"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {s === 0 ? "⏸" : `${s}×`}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-[var(--border)] bg-[rgba(6,18,32,.85)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] backdrop-blur-md"
            >
              {viewerRole === "admin" ? "設定" : "戻る"}
            </button>
          </div>
        </header>

        {/* ── 右サイドパネル ── */}
        <aside className="pointer-events-auto mt-auto sm:mt-0 sm:absolute sm:top-16 sm:right-4 w-full sm:w-[200px] max-h-[36vh] sm:max-h-[calc(100vh-5rem)] overflow-y-auto px-4 sm:px-0 pb-4 space-y-2">
          {viewerRole === "admin" && (
            <div className="panel border border-[var(--border)] !py-2.5 !px-3">
              <div className="panel-title !text-[0.6rem] !mb-1.5">都市</div>
              <ul className="space-y-1">
                {KANSAI_CITIES.map((c) => (
                  <li
                    key={c.name}
                    className="flex justify-between items-baseline text-xs"
                  >
                    <span className="font-bold text-[var(--text)]">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="panel border border-[var(--border-strong)] !py-2.5 !px-3">
            <div className="panel-title !text-[0.6rem] !mb-1.5">
              メンバー ({registeredUsers.length}人)
            </div>
            {registeredUsers.length === 0 ? (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                /user から登録するとここに表示されます
              </p>
            ) : (
              <ul className="space-y-1.5 max-h-[180px] overflow-y-auto">
                {registeredUsers.map((u) => (
                  <li
                    key={u.id}
                    className={`text-xs ${
                      u.id === highlightUserId ? "text-[#fde68a]" : "text-[var(--text)]"
                    }`}
                  >
                    <div className="font-bold">{u.displayName}</div>
                    {u.motto && (
                      <div className="text-[var(--muted)] text-[0.65rem] mt-0.5">{u.motto}</div>
                    )}
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
