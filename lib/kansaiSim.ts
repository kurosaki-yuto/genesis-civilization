import { KANSAI_CITIES, KANSAI_ROUTES } from "./kansaiMap";

export interface LightPerson {
  mode: "move" | "work";
  from: number;
  to: number;
  t: number;
  speed: number;
  workCity: number;
  workA: number;
  workR: number;
  hue: number;
  pulse: number;
}

function pickNextCity(from: number): number {
  const opts = KANSAI_ROUTES.filter(([a, b]) => a === from || b === from).map(([a, b]) =>
    a === from ? b : a
  );
  if (opts.length === 0) return from;
  return opts[(Math.random() * opts.length) | 0];
}

export function createLightPerson(): LightPerson {
  const route = KANSAI_ROUTES[(Math.random() * KANSAI_ROUTES.length) | 0];
  const flip = Math.random() < 0.5;
  const from = flip ? route[0] : route[1];
  const to = flip ? route[1] : route[0];
  return {
    mode: "move",
    from,
    to,
    t: Math.random(),
    speed: 0.007 + Math.random() * 0.012,
    workCity: to,
    workA: Math.random() * Math.PI * 2,
    workR: 0.012 + Math.random() * 0.022,
    hue: Math.random() < 0.55 ? 195 + Math.random() * 35 : 38 + Math.random() * 28,
    pulse: Math.random() * Math.PI * 2,
  };
}

export function stepLightPeople(people: LightPerson[], speedMul: number, dt: number) {
  const k = speedMul * dt;
  for (const p of people) {
    p.pulse += 0.08 * k;
    if (p.mode === "move") {
      p.t += p.speed * k;
      if (p.t >= 1) {
        p.t = 0;
        if (Math.random() < 0.35) {
          p.mode = "work";
          p.workCity = p.to;
          p.workA = Math.random() * Math.PI * 2;
        } else {
          p.from = p.to;
          p.to = pickNextCity(p.from);
        }
      }
    } else {
      p.workA += (0.04 + Math.random() * 0.06) * k;
      if (Math.random() < 0.02 * k) {
        p.mode = "move";
        p.from = p.workCity;
        p.to = pickNextCity(p.from);
        p.t = 0;
      }
    }
  }
}

export function syncWorkerCount(people: LightPerson[], target: number) {
  while (people.length < target) people.push(createLightPerson());
  while (people.length > target) people.pop();
}

export function cityWeightsTotal(): number {
  return KANSAI_CITIES.reduce((s, c) => s + c.weight, 0);
}
