"use client";

import { useState, useCallback, useEffect } from "react";
import UserRegisterScreen from "@/components/UserRegisterScreen";
import KansaiWorldScreen from "@/components/KansaiWorldScreen";
import type { WorldConfig, MapRegisteredUser } from "@/lib/types";
import { loadWorlds, loadRegisteredUsers } from "@/lib/worldStorage";

export default function UserPage() {
  const [phase, setPhase] = useState<"select" | "register" | "world">("select");
  const [worlds, setWorlds] = useState<WorldConfig[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<WorldConfig | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<MapRegisteredUser[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setWorlds(loadWorlds());
    if (selectedWorld) {
      setRegisteredUsers(loadRegisteredUsers(selectedWorld.id));
    }
  }, [selectedWorld]);

  useEffect(() => {
    setWorlds(loadWorlds());
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  // ── 世界選択画面 ──
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6">
        <div className="setup-world-orb mb-6 scale-75" aria-hidden />
        <p className="text-xs font-bold tracking-[0.3em] text-[var(--accent2)] uppercase">
          ユーザー
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-black text-[var(--text)] text-center">
          どの世界で働く？
        </h1>
        <p className="mt-3 text-[var(--muted)] text-center max-w-md text-sm leading-relaxed">
          管理者が作った世界を選んで、そこで働き始めましょう。
        </p>

        {worlds.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] p-8 text-center max-w-md">
            <p className="text-lg font-bold text-[var(--text)]">まだ世界がありません</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              管理者が /admin で世界を作ると、ここに表示されます。
            </p>
          </div>
        ) : (
          <div className="mt-10 w-full max-w-2xl space-y-3">
            {worlds.map((w) => {
              const users = loadRegisteredUsers(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    setSelectedWorld(w);
                    setRegisteredUsers(loadRegisteredUsers(w.id));
                    setPhase("register");
                  }}
                  className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent2)] p-5 text-left transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-black text-[var(--text)] truncate">
                        {w.name}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted)] truncate">
                        by {w.creator}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-[var(--accent1)]">
                        {users.length} 人が活動中
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--accent2)] font-semibold">{w.goal}</p>
                  <div className="mt-3 text-xs font-bold text-[var(--accent2)] tracking-wider uppercase">
                    ここで働く →
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!selectedWorld) return null;

  // ── 登録画面 ──
  if (phase === "register") {
    return (
      <UserRegisterScreen
        worldId={selectedWorld.id}
        worldName={selectedWorld.name}
        onRegistered={(u) => {
          setMyUserId(u.id);
          setRegisteredUsers(loadRegisteredUsers(selectedWorld.id));
          setPhase("world");
        }}
        onBack={() => setPhase("select")}
      />
    );
  }

  // ── マップ画面 ──
  return (
    <KansaiWorldScreen
      name={selectedWorld.name}
      goal={selectedWorld.goal}
      creator={selectedWorld.creator}
      registeredUsers={registeredUsers}
      viewerRole="user"
      highlightUserId={myUserId}
      onBack={() => setPhase("select")}
    />
  );
}
