"use client";

import { useState, useCallback, useEffect } from "react";
import SetupScreen from "@/components/SetupScreen";
import KansaiWorldScreen from "@/components/KansaiWorldScreen";
import type { WorldConfig, MapRegisteredUser } from "@/lib/types";
import { loadWorlds, loadRegisteredUsers } from "@/lib/worldStorage";

export default function AdminPage() {
  const [phase, setPhase] = useState<"setup" | "world">("setup");
  const [world, setWorld] = useState<WorldConfig | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<MapRegisteredUser[]>([]);

  const refresh = useCallback(() => {
    if (!world) return;
    setRegisteredUsers(loadRegisteredUsers(world.id));
  }, [world]);

  useEffect(() => {
    const worlds = loadWorlds();
    if (worlds.length > 0) {
      const w = worlds[worlds.length - 1]; // 最新の世界
      setWorld(w);
      setRegisteredUsers(loadRegisteredUsers(w.id));
      setPhase("world");
    }
  }, []);

  useEffect(() => {
    if (!world) return;
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh, world]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  if (phase === "setup" || !world) {
    return (
      <SetupScreen
        onBegin={(d) => {
          setWorld(d);
          setRegisteredUsers(loadRegisteredUsers(d.id));
          setPhase("world");
        }}
      />
    );
  }

  return (
    <KansaiWorldScreen
      name={world.name}
      goal={world.goal}
      creator={world.creator}
      registeredUsers={registeredUsers}
      viewerRole="admin"
      highlightUserId={null}
      onBack={() => setPhase("setup")}
    />
  );
}
