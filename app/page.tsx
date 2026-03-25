"use client";

import { useState, useCallback, useEffect } from "react";
import LandingScreen from "@/components/LandingScreen";
import SetupScreen from "@/components/SetupScreen";
import UserRegisterScreen from "@/components/UserRegisterScreen";
import KansaiWorldScreen from "@/components/KansaiWorldScreen";
import type { Phase, WorldConfig, MapRegisteredUser } from "@/lib/types";
import { loadWorld, loadRegisteredUsers } from "@/lib/worldStorage";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [world, setWorld] = useState<WorldConfig | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<MapRegisteredUser[]>([]);
  const [viewerRole, setViewerRole] = useState<"admin" | "user">("admin");
  const [highlightUserId, setHighlightUserId] = useState<string | null>(null);

  const refreshFromStorage = useCallback(() => {
    setWorld(loadWorld());
    setRegisteredUsers(loadRegisteredUsers());
  }, []);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  useEffect(() => {
    const onFocus = () => refreshFromStorage();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshFromStorage]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "genesis_kansai_users_v1" || e.key === "genesis_kansai_world_v1") {
        refreshFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshFromStorage]);

  const goWorldAdmin = useCallback(() => {
    refreshFromStorage();
    setViewerRole("admin");
    setHighlightUserId(null);
    setPhase("world");
  }, [refreshFromStorage]);

  const goWorldUser = useCallback((u: MapRegisteredUser) => {
    refreshFromStorage();
    setViewerRole("user");
    setHighlightUserId(u.id);
    setPhase("world");
  }, [refreshFromStorage]);

  return (
    <>
      {phase === "landing" && (
        <LandingScreen
          hasWorld={!!world}
          userCount={registeredUsers.length}
          onAdmin={() => {
            refreshFromStorage();
            setPhase("admin_setup");
          }}
          onUser={() => {
            if (!loadWorld()) return;
            refreshFromStorage();
            setPhase("user_register");
          }}
        />
      )}

      {phase === "admin_setup" && (
        <SetupScreen
          onBegin={(d) => {
            setWorld(d);
            goWorldAdmin();
          }}
          onBack={() => setPhase("landing")}
        />
      )}

      {phase === "user_register" && world && (
        <UserRegisterScreen
          worldName={world.name}
          onRegistered={(u) => {
            refreshFromStorage();
            goWorldUser(u);
          }}
          onBack={() => setPhase("landing")}
        />
      )}

      {phase === "world" && world && (
        <KansaiWorldScreen
          name={world.name}
          goal={world.goal}
          creator={world.creator}
          registeredUsers={registeredUsers}
          viewerRole={viewerRole}
          highlightUserId={highlightUserId}
          onBack={() => {
            refreshFromStorage();
            setPhase("landing");
            setHighlightUserId(null);
          }}
        />
      )}
    </>
  );
}
