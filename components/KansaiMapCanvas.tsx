"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  KANSAI_LAND,
  KANSAI_BAY,
  KANSAI_CITIES,
  MAP_ASPECT,
} from "@/lib/kansaiMap";
import type { LightPerson } from "@/lib/kansaiSim";
import { stepLightPeople, syncWorkerCount } from "@/lib/kansaiSim";
import type { RegisteredPerson } from "@/lib/registeredPersonSim";
import {
  stepRegisteredPeople,
  syncRegisteredPeople,
  personNormPos,
} from "@/lib/registeredPersonSim";
import type { MapRegisteredUser } from "@/lib/types";

interface Props {
  running: boolean;
  speedMul: number;
  pop: number;
  peopleRef: React.MutableRefObject<LightPerson[]>;
  registeredUsers: MapRegisteredUser[];
  highlightUserId: string | null;
}

function layoutMap(w: number, h: number, pad: number) {
  const iw = w - 2 * pad;
  const ih = h - 2 * pad;
  let drawW: number;
  let drawH: number;
  let ox: number;
  let oy: number;
  if (iw / ih > MAP_ASPECT) {
    drawH = ih;
    drawW = ih * MAP_ASPECT;
    ox = pad + (iw - drawW) / 2;
    oy = pad;
  } else {
    drawW = iw;
    drawH = iw / MAP_ASPECT;
    ox = pad;
    oy = pad + (ih - drawH) / 2;
  }
  return { drawW, drawH, ox, oy };
}

function toScreen(nx: number, ny: number, ox: number, oy: number, drawW: number, drawH: number) {
  return { x: ox + nx * drawW, y: oy + ny * drawH };
}

function drawHumanoid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  walk: number,
  facing: 1 | -1,
  shirtHue: number,
  highlight: boolean,
  scale: number
) {
  const leg = Math.sin(walk) * 3.8;
  const arm = Math.cos(walk * 0.92) * 2.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * facing, scale);

  if (highlight) {
    ctx.strokeStyle = "rgba(251, 191, 36, 0.85)";
    ctx.lineWidth = 3 / scale;
    ctx.beginPath();
    ctx.arc(0, -2, 18, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 13, 7, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#3d5266";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-2.6 + leg * 0.35, 12);
  ctx.moveTo(0, 5);
  ctx.lineTo(2.6 - leg * 0.35, 12);
  ctx.stroke();

  ctx.fillStyle = `hsl(${shirtHue}, 58%, 46%)`;
  ctx.fillRect(-4.5, -4, 9, 9);

  ctx.strokeStyle = "#e8c4a0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3.5, -2);
  ctx.lineTo(-8.5, 0.5 + arm);
  ctx.moveTo(3.5, -2);
  ctx.lineTo(8.5, 0.5 - arm * 0.65);
  ctx.stroke();

  ctx.fillStyle = "#f0cfa8";
  ctx.beginPath();
  ctx.arc(0, -9, 4.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(38, 30, 26, 0.92)";
  ctx.beginPath();
  ctx.arc(0, -10.2, 4.9, Math.PI * 1.08, Math.PI * 1.92);
  ctx.lineTo(-2, -9);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export default function KansaiMapCanvas({
  running,
  speedMul,
  pop,
  peopleRef,
  registeredUsers,
  highlightUserId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastRef = useRef(0);
  const regRef = useRef<RegisteredPerson[]>([]);

  useEffect(() => {
    syncRegisteredPeople(regRef.current, registeredUsers);
  }, [registeredUsers]);

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const pad = Math.min(48, w * 0.04);
      const { drawW, drawH, ox, oy } = layoutMap(w, h, pad);
      const huScale = Math.min(drawW, drawH) * 0.026;

      ctx.fillStyle = "#061a2e";
      ctx.fillRect(0, 0, w, h);

      const landGrad = ctx.createLinearGradient(0, oy, drawW + ox, oy + drawH);
      landGrad.addColorStop(0, "#1a4d3a");
      landGrad.addColorStop(0.45, "#2d6b45");
      landGrad.addColorStop(1, "#3d7a52");
      ctx.beginPath();
      const p0 = toScreen(KANSAI_LAND[0][0], KANSAI_LAND[0][1], ox, oy, drawW, drawH);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < KANSAI_LAND.length; i++) {
        const p = toScreen(KANSAI_LAND[i][0], KANSAI_LAND[i][1], ox, oy, drawW, drawH);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fillStyle = landGrad;
      ctx.fill();
      ctx.strokeStyle = "rgba(180, 230, 200, 0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const bay = toScreen(KANSAI_BAY.cx, KANSAI_BAY.cy, ox, oy, drawW, drawH);
      const brx = KANSAI_BAY.rx * drawW;
      const bry = KANSAI_BAY.ry * drawH;
      ctx.beginPath();
      ctx.ellipse(bay.x, bay.y, brx, bry, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(8, 45, 78, 0.55)";
      ctx.fill();
      ctx.strokeStyle = "rgba(120, 200, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (const c of KANSAI_CITIES) {
        const { x, y } = toScreen(c.nx, c.ny, ox, oy, drawW, drawH);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 18);
        g.addColorStop(0, "rgba(255, 248, 220, 0.35)");
        g.addColorStop(0.4, "rgba(251, 191, 36, 0.12)");
        g.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 252, 240, 0.9)";
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      const people = peopleRef.current;
      for (const p of people) {
        let nx: number;
        let ny: number;
        if (p.mode === "move") {
          const a = KANSAI_CITIES[p.from];
          const b = KANSAI_CITIES[p.to];
          const e = 1 - (1 - p.t) ** 2;
          nx = a.nx + (b.nx - a.nx) * e;
          ny = a.ny + (b.ny - a.ny) * e;
        } else {
          const c = KANSAI_CITIES[p.workCity];
          nx = c.nx + Math.cos(p.workA) * p.workR;
          ny = c.ny + Math.sin(p.workA) * p.workR * 0.85;
        }
        const { x, y } = toScreen(nx, ny, ox, oy, drawW, drawH);
        const pulse = 0.65 + Math.sin(p.pulse) * 0.35;
        const r = 2.8 + pulse * 1.4;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5);
        g.addColorStop(0, `hsla(${p.hue}, 95%, 70%, ${0.55 * pulse})`);
        g.addColorStop(0.35, `hsla(${p.hue}, 90%, 55%, ${0.22 * pulse})`);
        g.addColorStop(1, `hsla(${p.hue}, 85%, 45%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `hsla(${p.hue}, 30%, 98%, ${0.75 * pulse})`;
        ctx.beginPath();
        ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const rp of regRef.current) {
        const { nx, ny } = personNormPos(rp);
        const { x, y } = toScreen(nx, ny, ox, oy, drawW, drawH);
        drawHumanoid(
          ctx,
          x,
          y,
          rp.walk,
          rp.facing,
          rp.shirtHue,
          highlightUserId === rp.id,
          huScale
        );
        const label = rp.displayName;
        ctx.font = "600 11px Outfit, Noto Sans JP, sans-serif";
        const tw = ctx.measureText(label).width;
        const ly = y + huScale * 14;
        ctx.fillStyle = "rgba(8, 12, 20, 0.88)";
        ctx.fillRect(x - tw / 2 - 4, ly - 2, tw + 8, 16);
        ctx.fillStyle = highlightUserId === rp.id ? "#fde68a" : "#f1f5f9";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, x, ly);
      }

      ctx.font = "600 13px Outfit, Noto Sans JP, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const c of KANSAI_CITIES) {
        const { x, y } = toScreen(c.nx, c.ny, ox, oy, drawW, drawH);
        ctx.fillStyle = "rgba(15, 25, 35, 0.92)";
        const label = c.name;
        const tw = ctx.measureText(label).width;
        ctx.fillRect(x - tw / 2 - 5, y + 10, tw + 10, 20);
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(label, x, y + 14);
      }
    },
    [peopleRef, highlightUserId]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let anim: number;

    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (t: number) => {
      const prev = lastRef.current;
      lastRef.current = t;
      const dt = prev ? Math.min(32, t - prev) / 16 : 1;
      syncRegisteredPeople(regRef.current, registeredUsers);
      const target = Math.min(2200, Math.max(100, Math.floor(pop * 2.2)));
      syncWorkerCount(peopleRef.current, target);
      if (running) {
        stepLightPeople(peopleRef.current, speedMul, dt);
        stepRegisteredPeople(regRef.current, speedMul, dt);
      }
      drawFrame(ctx, canvas.width, canvas.height);
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", resize);
    };
  }, [running, speedMul, pop, drawFrame, peopleRef, registeredUsers]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}
