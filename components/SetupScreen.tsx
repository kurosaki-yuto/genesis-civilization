"use client";

import { useState, useEffect } from "react";
import type { WorldConfig } from "@/lib/types";
import { loadWorlds, saveWorld } from "@/lib/worldStorage";

interface Props {
  onBegin: (data: WorldConfig) => void;
  onBack?: () => void;
}

export default function SetupScreen({ onBegin, onBack }: Props) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    const worlds = loadWorlds();
    if (worlds.length > 0) {
      const w = worlds[worlds.length - 1];
      setName(w.name);
      setGoal(w.goal);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="setup-world-orb mx-auto" aria-hidden />

        <p className="mt-10 text-xs font-bold tracking-[0.3em] text-[var(--accent1)] uppercase opacity-70">
          Genesis Civilization
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-black text-[var(--text)] text-center">
          世界をつくる
        </h1>

        <div className="mt-14 w-full space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-2 tracking-wide">世界の名前</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="例: 新関西文明"
              className="w-full bg-transparent border-b-2 border-[var(--border)] px-1 py-4 text-xl text-[var(--text)] outline-none focus:border-[var(--accent1)] transition-colors placeholder:text-[var(--muted)] placeholder:opacity-40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-2 tracking-wide">目標</label>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              type="text"
              placeholder="例: 繁栄する都市を築く"
              className="w-full bg-transparent border-b-2 border-[var(--border)] px-1 py-4 text-xl text-[var(--text)] outline-none focus:border-[var(--accent1)] transition-colors placeholder:text-[var(--muted)] placeholder:opacity-40"
            />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary w-full text-lg mt-14 py-5"
          onClick={() => {
            const d: WorldConfig = {
              id: "",
              name: name.trim() || "無名の世界",
              goal: goal.trim() || "まだ決めていない",
              creator: "",
            };
            const saved = saveWorld(d);
            onBegin(saved);
          }}
        >
          はじめる
        </button>

        {onBack && (
          <button type="button" onClick={onBack} className="mt-6 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            戻る
          </button>
        )}
      </div>
    </div>
  );
}
