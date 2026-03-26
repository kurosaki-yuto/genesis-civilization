"use client";

import { useRef, useEffect, useCallback } from "react";
import { KANSAI_CITIES, MAP_ASPECT } from "@/lib/kansaiMap";
import type { LightPerson } from "@/lib/kansaiSim";
import { stepLightPeople, syncWorkerCount } from "@/lib/kansaiSim";
import type { RegisteredPerson } from "@/lib/registeredPersonSim";
import {
  stepRegisteredPeople,
  syncRegisteredPeople,
  personNormPos,
} from "@/lib/registeredPersonSim";
import type { MapRegisteredUser } from "@/lib/types";
import {
  Tile,
  GRID_W,
  GRID_H,
  PALETTE,
  WATER_ALT,
  generateTileMap,
  TREE_SPRITE,
  TREE_COLORS,
  BUILDING_SPRITE,
  BUILDING_COLORS,
  CHAR_FRAME_0,
  CHAR_FRAME_1,
  tileSeed,
} from "@/lib/kansaiTileMap";

interface Props {
  running: boolean;
  speedMul: number;
  pop: number;
  peopleRef: React.MutableRefObject<LightPerson[]>;
  registeredUsers: MapRegisteredUser[];
  highlightUserId: string | null;
}

/* ── レイアウト計算 ── */
function layoutMap(w: number, h: number, pad: number) {
  const iw = w - 2 * pad;
  const ih = h - 2 * pad;
  let drawW: number, drawH: number, ox: number, oy: number;
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

/* ── オフスクリーンにタイルマップを描画 ── */
function renderTileLayer(
  tileMap: Uint8Array,
  ts: number,
  waterFrame: number
): HTMLCanvasElement {
  const cw = GRID_W * ts;
  const ch = GRID_H * ts;
  const off = document.createElement("canvas");
  off.width = cw;
  off.height = ch;
  const ctx = off.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const t = tileMap[gy * GRID_W + gx];
      const x = gx * ts;
      const y = gy * ts;

      // 水タイルはアニメーション
      const isWater =
        t === Tile.DEEP_WATER || t === Tile.WATER || t === Tile.BIWA;
      let pal =
        isWater && waterFrame % 2 === 1 && WATER_ALT[t]
          ? WATER_ALT[t]
          : PALETTE[t];
      if (!pal) pal = PALETTE[Tile.GRASS];

      // メインブロック
      ctx.fillStyle = pal.top;
      ctx.fillRect(x, y, ts, ts);

      // ハイライト（上辺・左辺 1px）
      ctx.fillStyle = pal.hi;
      ctx.fillRect(x, y, ts, 1);
      ctx.fillRect(x, y, 1, ts);

      // シャドウ（下辺・右辺 1px）
      ctx.fillStyle = pal.side;
      ctx.fillRect(x, y + ts - 1, ts, 1);
      ctx.fillRect(x + ts - 1, y, 1, ts);

      // 水タイルの波紋パターン
      if (isWater && ts >= 6) {
        const seed = tileSeed(gx, gy);
        if (seed < 0.3) {
          ctx.fillStyle = pal.hi;
          const wx = x + Math.floor(seed * (ts - 3)) + 1;
          const wy = y + Math.floor((seed * 7.3) % 1 * (ts - 2)) + 1;
          ctx.fillRect(wx, wy, 2, 1);
        }
      }
    }
  }

  // スプライトオーバーレイ
  const spriteScale = Math.max(1, Math.floor(ts / 5));

  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const t = tileMap[gy * GRID_W + gx];
      const x = gx * ts;
      const y = gy * ts;

      // 森タイル → 木スプライト
      if (t === Tile.FOREST && tileSeed(gx, gy) < 0.55) {
        drawSprite(
          ctx,
          TREE_SPRITE,
          TREE_COLORS,
          x + Math.floor(ts * 0.1),
          y + Math.floor(ts * 0.05) - spriteScale,
          spriteScale
        );
      }

      // 都市タイル → 建物スプライト
      if (t === Tile.CITY && tileSeed(gx + 100, gy + 100) < 0.4) {
        drawSprite(
          ctx,
          BUILDING_SPRITE,
          BUILDING_COLORS,
          x + Math.floor(ts * 0.1),
          y + Math.floor(ts * 0.05),
          spriteScale
        );
      }
    }
  }

  return off;
}

/* ── スプライト描画 ── */
function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: number[][],
  colors: string[],
  sx: number,
  sy: number,
  scale: number
) {
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      const c = sprite[row][col];
      if (c === 0) continue;
      ctx.fillStyle = colors[c];
      ctx.fillRect(sx + col * scale, sy + row * scale, scale, scale);
    }
  }
}

/* ── ピクセルアートキャラクター描画 ── */
function drawPixelChar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  walk: number,
  facing: 1 | -1,
  shirtHue: number,
  highlight: boolean,
  pixelSize: number
) {
  const frame = Math.floor(walk / Math.PI) % 2 === 0 ? CHAR_FRAME_0 : CHAR_FRAME_1;
  const sw = 6; // sprite width
  const sh = frame.length; // sprite height

  // 色マップ
  const skinColor = "#e8b888";
  const hairColor = "#3a2a1a";
  const shirtColor = `hsl(${shirtHue}, 55%, 45%)`;
  const pantsColor = "#3a3a50";
  const shoeColor = "#2a2a2a";
  const colorMap = ["", skinColor, hairColor, shirtColor, pantsColor, shoeColor];

  const ps = Math.max(1, Math.round(pixelSize));
  const totalW = sw * ps;
  const totalH = sh * ps;

  // ハイライト枠
  if (highlight) {
    ctx.strokeStyle = "rgba(251, 191, 36, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      Math.round(x - totalW / 2 - 3),
      Math.round(y - totalH - 3),
      totalW + 6,
      totalH + 6
    );
  }

  // 影
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(
    Math.round(x - totalW / 2 + 1),
    Math.round(y),
    totalW - 2,
    Math.max(1, ps / 2)
  );

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y - totalH));
  if (facing === -1) {
    ctx.scale(-1, 1);
    ctx.translate(-totalW, 0);
  } else {
    ctx.translate(-totalW / 2, 0);
  }

  for (let row = 0; row < sh; row++) {
    for (let col = 0; col < sw; col++) {
      const c = frame[row][col];
      if (c === 0) continue;
      ctx.fillStyle = colorMap[c];
      ctx.fillRect(col * ps, row * ps, ps, ps);
    }
  }
  ctx.restore();
}

/* ── メインコンポーネント ── */
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
  const tileMapRef = useRef<Uint8Array | null>(null);
  const tileLayerRef = useRef<HTMLCanvasElement | null>(null);
  const tileSizeRef = useRef(0);
  const waterFrameRef = useRef(0);
  const waterTickRef = useRef(0);

  useEffect(() => {
    syncRegisteredPeople(regRef.current, registeredUsers);
  }, [registeredUsers]);

  // タイルマップは1回だけ生成
  useEffect(() => {
    tileMapRef.current = generateTileMap();
  }, []);

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const tileMap = tileMapRef.current;
      if (!tileMap) return;

      ctx.imageSmoothingEnabled = false;

      const pad = Math.min(48, w * 0.04);
      const { drawW, drawH, ox, oy } = layoutMap(w, h, pad);

      // タイルサイズ算出（整数ピクセルでクリスピーに）
      const ts = Math.max(2, Math.floor(Math.min(drawW / GRID_W, drawH / GRID_H)));
      const mapPxW = GRID_W * ts;
      const mapPxH = GRID_H * ts;
      const mapOx = Math.round(ox + (drawW - mapPxW) / 2);
      const mapOy = Math.round(oy + (drawH - mapPxH) / 2);

      // 水アニメーション更新
      waterTickRef.current++;
      if (waterTickRef.current >= 40) {
        waterTickRef.current = 0;
        waterFrameRef.current++;
        tileLayerRef.current = null; // 再描画トリガー
      }

      // タイルレイヤーをキャッシュ（サイズ変更 or 水アニメで再生成）
      if (!tileLayerRef.current || tileSizeRef.current !== ts) {
        tileSizeRef.current = ts;
        tileLayerRef.current = renderTileLayer(
          tileMap,
          ts,
          waterFrameRef.current
        );
      }

      // 背景（深海色 — 少し明るめ）
      ctx.fillStyle = "#162a40";
      ctx.fillRect(0, 0, w, h);

      // タイルレイヤーblit
      ctx.drawImage(tileLayerRef.current, mapOx, mapOy);

      // ── 都市マーカー ── */
      for (const c of KANSAI_CITIES) {
        const sx = Math.round(mapOx + c.nx * mapPxW);
        const sy = Math.round(mapOy + c.ny * mapPxH);
        // ブロック風グロー（4段階の四角）
        const gs = Math.max(2, Math.floor(ts * 0.6));
        ctx.fillStyle = "rgba(255, 220, 100, 0.12)";
        ctx.fillRect(sx - gs * 2, sy - gs * 2, gs * 4, gs * 4);
        ctx.fillStyle = "rgba(255, 220, 100, 0.2)";
        ctx.fillRect(sx - gs, sy - gs, gs * 2, gs * 2);
        ctx.fillStyle = "rgba(255, 250, 230, 0.6)";
        ctx.fillRect(sx - 1, sy - 1, 3, 3);
      }

      // ── 光の粒（ライトピープル） ── */
      const people = peopleRef.current;
      const dotSize = Math.max(1, Math.floor(ts * 0.15));
      for (const p of people) {
        let nx: number, ny: number;
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
        const sx = Math.round(mapOx + nx * mapPxW);
        const sy = Math.round(mapOy + ny * mapPxH);
        const pulse = 0.5 + Math.sin(p.pulse) * 0.3;

        // 小さなピクセルドット
        ctx.globalAlpha = 0.35 * pulse;
        ctx.fillStyle = `hsl(${p.hue}, 70%, 60%)`;
        ctx.fillRect(sx, sy, dotSize, dotSize);
        ctx.globalAlpha = 0.7 * pulse;
        ctx.fillStyle = `hsl(${p.hue}, 30%, 90%)`;
        ctx.fillRect(sx, sy, 1, 1);
        ctx.globalAlpha = 1;
      }

      // ── 登録ユーザー（ピクセルキャラクター） ── */
      const charPixel = Math.max(1, Math.floor(ts * 0.35));
      for (const rp of regRef.current) {
        const { nx, ny } = personNormPos(rp);
        const sx = Math.round(mapOx + nx * mapPxW);
        const sy = Math.round(mapOy + ny * mapPxH);
        drawPixelChar(
          ctx,
          sx,
          sy,
          rp.walk,
          rp.facing,
          rp.shirtHue,
          highlightUserId === rp.id,
          charPixel
        );

        // 名前ラベル
        const label = rp.displayName;
        const fontSize = Math.max(9, Math.min(13, ts * 0.9));
        ctx.font = `bold ${fontSize}px Outfit, "Noto Sans JP", sans-serif`;
        const tw = ctx.measureText(label).width;
        const ly = sy + 4;
        ctx.fillStyle = "rgba(8, 12, 20, 0.88)";
        ctx.fillRect(
          Math.round(sx - tw / 2 - 3),
          ly,
          Math.round(tw + 6),
          Math.round(fontSize + 4)
        );
        ctx.fillStyle =
          highlightUserId === rp.id ? "#fde68a" : "#f1f5f9";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, sx, ly + 2);
      }

      // ── 都市ラベル ── */
      const cityFontSize = Math.max(10, Math.min(14, ts * 1.1));
      ctx.font = `bold ${cityFontSize}px Outfit, "Noto Sans JP", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const c of KANSAI_CITIES) {
        const sx = Math.round(mapOx + c.nx * mapPxW);
        const sy = Math.round(mapOy + c.ny * mapPxH);
        const label = c.name;
        const tw = ctx.measureText(label).width;
        const labelY = sy + Math.max(6, ts * 0.5);

        // ピクセル風ラベル背景
        ctx.fillStyle = "rgba(10, 18, 28, 0.92)";
        ctx.fillRect(
          Math.round(sx - tw / 2 - 4),
          Math.round(labelY - 1),
          Math.round(tw + 8),
          Math.round(cityFontSize + 5)
        );
        // 上辺ハイライト
        ctx.fillStyle = "rgba(255, 220, 100, 0.3)";
        ctx.fillRect(
          Math.round(sx - tw / 2 - 4),
          Math.round(labelY - 1),
          Math.round(tw + 8),
          1
        );
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(label, sx, Math.round(labelY + 1));
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
      tileLayerRef.current = null; // サイズ変更で再描画
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (t: number) => {
      const prev = lastRef.current;
      lastRef.current = t;
      const dt = prev ? Math.min(32, t - prev) / 16 : 1;
      syncRegisteredPeople(regRef.current, registeredUsers);
      const target = Math.max(0, pop);
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
