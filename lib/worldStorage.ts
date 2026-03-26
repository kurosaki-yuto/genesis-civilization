import type { WorldConfig, MapRegisteredUser } from "./types";

const KEY_WORLDS = "genesis_kansai_worlds_v2";

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `w_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/* ── 世界の一覧 ── */
export function loadWorlds(): WorldConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_WORLDS);
    if (!raw) return migrateV1();
    const arr = JSON.parse(raw) as WorldConfig[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** 旧v1データがあればマイグレーション */
function migrateV1(): WorldConfig[] {
  try {
    const raw = localStorage.getItem("genesis_kansai_world_v1");
    if (!raw) return [];
    const o = JSON.parse(raw) as { name: string; goal: string; creator: string };
    if (!o?.name) return [];
    const w: WorldConfig = { id: uid(), name: o.name, goal: o.goal, creator: o.creator };
    // 旧ユーザーデータもマイグレーション
    const usersRaw = localStorage.getItem("genesis_kansai_users_v1");
    const users: MapRegisteredUser[] = usersRaw ? JSON.parse(usersRaw) : [];
    saveWorlds([w]);
    saveRegisteredUsers(w.id, users);
    return [w];
  } catch {
    return [];
  }
}

export function saveWorlds(worlds: WorldConfig[]): void {
  localStorage.setItem(KEY_WORLDS, JSON.stringify(worlds));
}

export function loadWorld(id: string): WorldConfig | null {
  return loadWorlds().find((w) => w.id === id) ?? null;
}

export function saveWorld(c: WorldConfig): WorldConfig {
  const worlds = loadWorlds();
  if (!c.id) c.id = uid();
  const idx = worlds.findIndex((w) => w.id === c.id);
  if (idx >= 0) {
    worlds[idx] = c;
  } else {
    worlds.push(c);
  }
  saveWorlds(worlds);
  return c;
}

/* ── ユーザー（世界ごと） ── */
function usersKey(worldId: string): string {
  return `genesis_users_${worldId}`;
}

export function loadRegisteredUsers(worldId: string): MapRegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(usersKey(worldId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as MapRegisteredUser[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(worldId: string, users: MapRegisteredUser[]): void {
  localStorage.setItem(usersKey(worldId), JSON.stringify(users));
}

export function appendRegisteredUser(
  worldId: string,
  name: string,
  motto?: string
): MapRegisteredUser {
  const u: MapRegisteredUser = {
    id: uid(),
    displayName: name.trim(),
    motto: motto?.trim() || undefined,
    registeredAt: Date.now(),
  };
  const list = loadRegisteredUsers(worldId);
  list.push(u);
  saveRegisteredUsers(worldId, list);
  return u;
}
