const perm = new Uint8Array(512);
const p: number[] = [];
for (let i = 0; i < 256; i++) p[i] = i;
for (let i = 255; i > 0; i--) {
  const j = (Math.random() * i) | 0;
  [p[i], p[j]] = [p[j], p[i]];
}
for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

function grad2(h: number, x: number, y: number) {
  const v = h & 3;
  return v === 0 ? x + y : v === 1 ? -x + y : v === 2 ? x - y : -x - y;
}

export function noise2d(x: number, y: number): number {
  const X0 = Math.floor(x) & 255;
  const Y0 = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const a = perm[X0] + Y0;
  const b = perm[X0 + 1] + Y0;
  return lerp(
    lerp(grad2(perm[a], x, y), grad2(perm[b], x - 1, y), u),
    lerp(grad2(perm[a + 1], x, y - 1), grad2(perm[b + 1], x - 1, y - 1), u),
    v
  );
}

export function fbm(x: number, y: number, octaves = 5): number {
  let v = 0,
    a = 0.5,
    f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * noise2d(x * f, y * f);
    a *= 0.5;
    f *= 2;
  }
  return v;
}
