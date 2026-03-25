"use client";

import { useState, useEffect } from "react";
import type { WorldConfig } from "@/lib/types";
import { loadWorld, saveWorld } from "@/lib/worldStorage";

interface Props {
  onBegin: (data: WorldConfig) => void;
  onBack?: () => void;
}

export default function SetupScreen({ onBegin, onBack }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [creator, setCreator] = useState("");

  useEffect(() => {
    const w = loadWorld();
    if (w) {
      setName(w.name);
      setGoal(w.goal);
      setCreator(w.creator);
    }
  }, []);

  const inputClass =
    "w-full bg-[var(--surface-elevated)] border-2 border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] text-base outline-none focus:border-[var(--accent1)] focus:ring-2 focus:ring-[var(--glow1)] transition-shadow placeholder:text-[var(--muted)]";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col lg:flex-row">
      <div className="lg:w-[42%] flex flex-col justify-center p-8 lg:p-14 border-b lg:border-b-0 lg:border-r border-[var(--border)] bg-gradient-to-br from-[#061428] via-[#0a2038] to-[#051018]">
        <div className="setup-world-orb mx-auto lg:mx-0" aria-hidden />
        <p className="mt-8 text-center lg:text-left text-xs font-bold tracking-[0.35em] text-[var(--accent1)] uppercase">
          管理者 · 世界の設定
        </p>
        <h1 className="mt-3 text-center lg:text-left text-3xl sm:text-4xl font-black text-[var(--text)] leading-tight">
          この関西を
          <br />
          <span className="text-[var(--accent2)]">運営する側</span>
        </h1>
        <p className="mt-4 text-center lg:text-left text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto lg:mx-0">
          名前・目標・創造主を保存します。ユーザーは別途「参加」から登録し、地図上に人として現れます。
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-14 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-[var(--text)]">世界を定義</h2>
          {onBack && (
            <button type="button" onClick={onBack} className="text-sm font-bold text-[var(--muted)] hover:text-[var(--text)]">
              戻る
            </button>
          )}
        </div>

        <label className="block text-sm font-bold text-[var(--accent1)] mb-2">名前</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="世界の呼び名"
          className={`${inputClass} mb-6`}
        />

        <label className="block text-sm font-bold text-[var(--accent1)] mb-2">目標</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          placeholder="この世界で何を目指すか"
          className={`${inputClass} resize-none mb-6`}
        />

        <label className="block text-sm font-bold text-[var(--accent1)] mb-2">創造主</label>
        <input
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          type="text"
          placeholder="管理者・創造主のこと"
          className={`${inputClass} mb-10`}
        />

        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto text-lg px-10"
          onClick={() => {
            const d: WorldConfig = {
              name: name.trim() || "無名の世界",
              goal: goal.trim() || "まだ決めていない",
              creator: creator.trim() || "匿名の創造主",
            };
            saveWorld(d);
            onBegin(d);
          }}
        >
          保存して地図を開く
        </button>
      </div>
    </div>
  );
}
