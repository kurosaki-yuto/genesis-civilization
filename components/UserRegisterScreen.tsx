"use client";

import { useState } from "react";
import { appendRegisteredUser } from "@/lib/worldStorage";
import type { MapRegisteredUser } from "@/lib/types";

interface Props {
  worldId: string;
  worldName: string;
  onRegistered: (user: MapRegisteredUser) => void;
  onBack: () => void;
}

export default function UserRegisterScreen({ worldId, worldName, onRegistered, onBack }: Props) {
  const [name, setName] = useState("");
  const [motto, setMotto] = useState("");

  const inputClass =
    "w-full bg-[var(--surface-elevated)] border-2 border-[var(--border)] rounded-xl px-4 py-3.5 text-[var(--text)] text-base outline-none focus:border-[var(--accent2)] transition-shadow placeholder:text-[var(--muted)]";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
      <p className="text-xs font-bold tracking-[0.25em] text-[var(--accent2)] uppercase">ユーザー登録</p>
      <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text)] text-center">
        「{worldName}」に参加
      </h1>
      <p className="mt-3 text-[var(--muted)] text-center max-w-md text-sm leading-relaxed">
        登録後、地図上にあなたのキャラが現れ、勝手に働き回ります（止めなくても動き続けます）。
      </p>

      <div className="mt-10 w-full max-w-md space-y-5">
        <div>
          <label className="block text-sm font-bold text-[var(--accent2)] mb-2">表示名（地図に出ます）</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：たろう、営業の田中"
            className={inputClass}
            maxLength={24}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[var(--muted)] mb-2">ひとこと（任意）</label>
          <input
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="よろしく、など"
            className={inputClass}
            maxLength={40}
          />
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn btn-ghost">
            戻る
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#1a1204" }}
            onClick={() => {
              const n = name.trim();
              if (!n) return;
              const u = appendRegisteredUser(worldId, n, motto.trim() || undefined);
              onRegistered(u);
            }}
          >
            登録して地図へ
          </button>
        </div>
      </div>
    </div>
  );
}
