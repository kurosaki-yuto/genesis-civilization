import { KANSAI_CITIES, KANSAI_ROUTES } from "./kansaiMap";
import type { MapRegisteredUser } from "./types";

export interface RegisteredPerson {
  id: string;
  displayName: string;
  mode: "move" | "work";
  from: number;
  to: number;
  t: number;
  speed: number;
  workCity: number;
  workA: number;
  workR: number;
  walk: number;
  facing: 1 | -1;
  shirtHue: number;
}

function pickNextCity(from: number): number {
  const opts = KANSAI_ROUTES.filter(([a, b]) => a === from || b === from).map(([a, b]) =>
    a === from ? b : a
  );
  if (opts.length === 0) return from;
  return opts[(Math.random() * opts.length) | 0];
}

function hueFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function createRegisteredPerson(u: MapRegisteredUser): RegisteredPerson {
  const route = KANSAI_ROUTES[(Math.random() * KANSAI_ROUTES.length) | 0];
  const flip = Math.random() < 0.5;
  const from = flip ? route[0] : route[1];
  const to = flip ? route[1] : route[0];
  const a = KANSAI_CITIES[from];
  const b = KANSAI_CITIES[to];
  return {
    id: u.id,
    displayName: u.displayName,
    mode: "move",
    from,
    to,
    t: Math.random() * 0.4,
    speed: 0.005 + Math.random() * 0.008,
    workCity: to,
    workA: Math.random() * Math.PI * 2,
    workR: 0.014 + Math.random() * 0.018,
    walk: Math.random() * Math.PI * 2,
    facing: b.nx >= a.nx ? 1 : -1,
    shirtHue: hueFromId(u.id),
  };
}

export function stepRegisteredPeople(people: RegisteredPerson[], speedMul: number, dt: number) {
  const k = speedMul * dt;
  for (const p of people) {
    p.walk += 0.22 * k;
    if (p.mode === "move") {
      const a = KANSAI_CITIES[p.from];
      const b = KANSAI_CITIES[p.to];
      p.facing = b.nx >= a.nx ? 1 : -1;
      p.t += p.speed * k;
      if (p.t >= 1) {
        p.t = 0;
        if (Math.random() < 0.4) {
          p.mode = "work";
          p.workCity = p.to;
          p.workA = Math.random() * Math.PI * 2;
        } else {
          p.from = p.to;
          p.to = pickNextCity(p.from);
          const na = KANSAI_CITIES[p.from];
          const nb = KANSAI_CITIES[p.to];
          p.facing = nb.nx >= na.nx ? 1 : -1;
        }
      }
    } else {
      p.workA += (0.055 + Math.random() * 0.05) * k;
      if (Math.random() < 0.025 * k) {
        p.mode = "move";
        p.from = p.workCity;
        p.to = pickNextCity(p.from);
        p.t = 0;
        const na = KANSAI_CITIES[p.from];
        const nb = KANSAI_CITIES[p.to];
        p.facing = nb.nx >= na.nx ? 1 : -1;
      }
    }
  }
}

export function syncRegisteredPeople(people: RegisteredPerson[], users: MapRegisteredUser[]) {
  const ids = new Set(users.map((u) => u.id));
  for (let i = people.length - 1; i >= 0; i--) {
    if (!ids.has(people[i].id)) people.splice(i, 1);
  }
  for (const u of users) {
    if (!people.some((p) => p.id === u.id)) people.push(createRegisteredPerson(u));
  }
}

export function personNormPos(p: RegisteredPerson): { nx: number; ny: number } {
  if (p.mode === "move") {
    const a = KANSAI_CITIES[p.from];
    const b = KANSAI_CITIES[p.to];
    const e = 1 - (1 - p.t) ** 2;
    return {
      nx: a.nx + (b.nx - a.nx) * e,
      ny: a.ny + (b.ny - a.ny) * e,
    };
  }
  const c = KANSAI_CITIES[p.workCity];
  return {
    nx: c.nx + Math.cos(p.workA) * p.workR,
    ny: c.ny + Math.sin(p.workA) * p.workR * 0.88,
  };
}
