import type { WorldConfig, MapRegisteredUser } from "./types";

const KEY_WORLD = "genesis_kansai_world_v1";
const KEY_USERS = "genesis_kansai_users_v1";

export function loadWorld(): WorldConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_WORLD);
    if (!raw) return null;
    const o = JSON.parse(raw) as WorldConfig;
    if (!o?.name || !o?.goal || !o?.creator) return null;
    return o;
  } catch {
    return null;
  }
}

export function saveWorld(c: WorldConfig): void {
  localStorage.setItem(KEY_WORLD, JSON.stringify(c));
}

export function loadRegisteredUsers(): MapRegisteredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_USERS);
    if (!raw) return [];
    const arr = JSON.parse(raw) as MapRegisteredUser[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: MapRegisteredUser[]): void {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

export function appendRegisteredUser(
  name: string,
  motto?: string
): MapRegisteredUser {
  const u: MapRegisteredUser = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    displayName: name.trim(),
    motto: motto?.trim() || undefined,
    registeredAt: Date.now(),
  };
  const list = loadRegisteredUsers();
  list.push(u);
  saveRegisteredUsers(list);
  return u;
}
