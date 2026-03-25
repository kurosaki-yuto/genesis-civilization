"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";
import { fbm } from "@/lib/noise";
import type { Entity, Settlement, TerrainPoint } from "@/lib/types";

function eraStrokeRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return `rgba(56,189,248,${alpha})`;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export interface WorldCanvasHandle {
  nearestLand: (cx: number, cy: number) => { x: number; y: number };
  getSize: () => { w: number; h: number };
}

interface Props {
  entities: Entity[];
  settlements: Settlement[];
  connections: [Settlement, Settlement, number][];
  eraColor: string;
  running: boolean;
}

const WorldCanvas = forwardRef<WorldCanvasHandle, Props>(function WorldCanvas(
  { entities, settlements, connections, eraColor, running },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terrainRef = useRef<TerrainPoint[]>([]);
  const terrainOx = useRef(Math.random() * 1000);
  const terrainOy = useRef(Math.random() * 1000);
  const fcRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  const genTerrain = useCallback((w: number, h: number) => {
    const ox = terrainOx.current;
    const oy = terrainOy.current;
    const terrain: TerrainPoint[] = [];
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const nx = x / w;
        const ny = y / h;
        const base = fbm((x + ox) * 0.003, (y + oy) * 0.003, 6);
        // 関西盆地＋瀬戸内寄りの大まかな骨格（大阪平野の低地、北摂・六甲側の隆起、南西の水域）
        const cx = 0.48;
        const cy = 0.5;
        const basin = Math.exp(-((nx - cx) ** 2 * 2.0 + (ny - cy) ** 2 * 1.6)) * 0.18;
        const bay = Math.exp(-((nx - 0.22) ** 2 * 1.4 + (ny - 0.78) ** 2 * 2.2)) * 0.42;
        const rangeNorth = Math.max(0, ny - 0.22) ** 1.35 * 0.38;
        const rangeNE = Math.max(0, nx * 0.85 + ny - 0.82) ** 1.2 * 0.32;
        const height =
          base * 0.92 - basin * 0.85 - bay * 1.05 + rangeNorth * 0.55 + rangeNE * 0.48;
        terrain.push({ x, y, h: height });
      }
    }
    terrainRef.current = terrain;
  }, []);

  const nearestLand = useCallback((cx: number, cy: number) => {
    let bx = cx, by = cy, bd = Infinity;
    for (const t of terrainRef.current) {
      if (t.h >= 0) {
        const d = (t.x - cx) ** 2 + (t.y - cy) ** 2;
        if (d < bd) { bd = d; bx = t.x; by = t.y; }
      }
    }
    return { x: bx, y: by };
  }, []);

  useImperativeHandle(ref, () => ({
    nearestLand,
    getSize: () => sizeRef.current,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      sizeRef.current = { w: innerWidth, h: innerHeight };
      genTerrain(innerWidth, innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    const drawTerrain = () => {
      for (const t of terrainRef.current) {
        let r: number, g: number, b: number;
        if (t.h < -0.15) { r = 12; g = 62; b = 98; }
        else if (t.h < -0.05) { r = 24; g = 88; b = 118; }
        else if (t.h < 0.05) { r = 38; g = 108; b = 72; }
        else if (t.h < 0.2) { r = 52; g = 128; b = 64; }
        else if (t.h < 0.35) { r = 78; g = 132; b = 58; }
        else { r = 110; g = 118; b = 72; }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(t.x, t.y, 4, 4);
      }
    };

    let animId: number;
    const frame = () => {
      fcRef.current++;
      const fc = fcRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = "rgba(5, 12, 22, 0.14)";
      ctx.fillRect(0, 0, W, H);
      if (fc % 100 === 1) drawTerrain();

      // Connections
      for (const [a, b] of connections) {
        const alpha = Math.min(0.35, 0.08 + settlements.length * 0.006);
        ctx.strokeStyle = eraStrokeRgba(eraColor, alpha);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Settlements
      for (const s of settlements) {
        const r = s.size;
        const g1 = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 5);
        g1.addColorStop(0, s.color + "40");
        g1.addColorStop(1, s.color + "00");
        ctx.fillStyle = g1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 5, 0, Math.PI * 2);
        ctx.fill();

        const g2 = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 2);
        g2.addColorStop(0, s.color + "80");
        g2.addColorStop(1, s.color + "00");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(2, r * 0.35), 0, Math.PI * 2);
        ctx.fill();

        // Pulse ring
        const pulse = (fc * 2 + s.id * 50) % 120;
        if (pulse < 60) {
          const pr = r * 2 + pulse * 0.5;
          ctx.strokeStyle = s.color + Math.round((1 - pulse / 60) * 40).toString(16).padStart(2, "0");
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, pr, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Entities
      for (const e of entities) {
        ctx.globalAlpha = Math.min(1, e.age / 20);

        if (e.isRegisteredUser) {
          // Registered users get a glowing ring
          const rg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 3);
          rg.addColorStop(0, "rgba(236,72,153,0.3)");
          rg.addColorStop(1, "rgba(236,72,153,0)");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        ctx.fillStyle = e.color + "25";
        ctx.beginPath();
        ctx.arc(e.x - e.vx * 4, e.y - e.vy * 4, e.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Name label for registered users
        if (e.isRegisteredUser) {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px Inter, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(e.name, e.x, e.y - e.size - 4);
        }
      }
      ctx.globalAlpha = 1;

      // Ambient particles
      if (running && Math.random() < 0.5) {
        const ax = Math.random() * W;
        const ay = Math.random() * H;
        ctx.fillStyle = eraStrokeRgba(eraColor || "#38bdf8", 0.12);
        ctx.beginPath();
        ctx.arc(ax, ay, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(frame);
    };

    ctx.fillStyle = "#050a12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [genTerrain, entities, settlements, connections, eraColor, running]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 z-0" />;
});

export default WorldCanvas;
