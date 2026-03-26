/**
 * マインクラフト風タイルマップ生成
 * 関西の地形をピクセルアートのブロックグリッドで表現する
 */

import {
  KANSAI_LAND,
  KANSAI_BAY_POLY,
  KANSAI_BIWA,
  KANSAI_CITIES,
  MAP_ASPECT,
} from "./kansaiMap";
import { fbm } from "./noise";

/* ── タイル種別 ── */
export enum Tile {
  DEEP_WATER = 0,
  WATER = 1,
  BIWA = 2,
  SAND = 3,
  GRASS = 4,
  DARK_GRASS = 5,
  FOREST = 6,
  MOUNTAIN = 7,
  PATH = 8,
  CITY = 9,
}

/* ── グリッドサイズ ── */
export const GRID_W = 80;
export const GRID_H = Math.round(GRID_W / MAP_ASPECT); // ~66

/* ── カラーパレット (top, side/shadow, highlight) ── */
export interface BlockColor {
  top: string;
  side: string;
  hi: string;
}

export const PALETTE: Record<number, BlockColor> = {
  [Tile.DEEP_WATER]: { top: "#2a5080", side: "#1e3e66", hi: "#3a6090" },
  [Tile.WATER]: { top: "#4080c0", side: "#3068a8", hi: "#5898d8" },
  [Tile.BIWA]: { top: "#4a90d0", side: "#3878b8", hi: "#62a8e0" },
  [Tile.SAND]: { top: "#e8d488", side: "#d0bc70", hi: "#f0e0a0" },
  [Tile.GRASS]: { top: "#6cb848", side: "#58a038", hi: "#80d060" },
  [Tile.DARK_GRASS]: { top: "#58a83c", side: "#489030", hi: "#68b850" },
  [Tile.FOREST]: { top: "#3c8830", side: "#2c7024", hi: "#4c9840" },
  [Tile.MOUNTAIN]: { top: "#989888", side: "#787870", hi: "#b0b0a0" },
  [Tile.PATH]: { top: "#b0a080", side: "#908060", hi: "#c8b898" },
  [Tile.CITY]: { top: "#888878", side: "#686860", hi: "#a8a898" },
};

/** 水アニメ用の第2パレット */
export const WATER_ALT: Record<number, BlockColor> = {
  [Tile.DEEP_WATER]: { top: "#2e5488", side: "#22426e", hi: "#3e6498" },
  [Tile.WATER]: { top: "#4488c8", side: "#346cb0", hi: "#5ca0d8" },
  [Tile.BIWA]: { top: "#4e98d8", side: "#3c80c0", hi: "#66b0e8" },
};

/* ── Point in polygon (ray casting) ── */
function pip(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0],
      yi = poly[i][1];
    const xj = poly[j][0],
      yj = poly[j][1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/* ── 陸地からの最短距離 (タイル単位, 近似) ── */
function distToLand(
  gx: number,
  gy: number,
  tiles: Uint8Array,
  radius: number
): number {
  for (let r = 1; r <= radius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= GRID_W || ny < 0 || ny >= GRID_H) continue;
        const t = tiles[ny * GRID_W + nx];
        if (
          t === Tile.GRASS ||
          t === Tile.DARK_GRASS ||
          t === Tile.FOREST ||
          t === Tile.MOUNTAIN ||
          t === Tile.SAND ||
          t === Tile.PATH ||
          t === Tile.CITY
        ) {
          return r;
        }
      }
    }
  }
  return radius + 1;
}

/* ── タイルマップ生成 ── */
export function generateTileMap(): Uint8Array {
  const map = new Uint8Array(GRID_W * GRID_H);

  // Pass 1: 基本地形判定
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const nx = (gx + 0.5) / GRID_W;
      const ny = (gy + 0.5) / GRID_H;
      const idx = gy * GRID_W + gx;

      // 琵琶湖チェック
      if (pip(nx, ny, KANSAI_BIWA)) {
        map[idx] = Tile.BIWA;
        continue;
      }
      // 大阪湾チェック
      if (pip(nx, ny, KANSAI_BAY_POLY)) {
        map[idx] = Tile.WATER;
        continue;
      }
      // 陸地チェック
      if (pip(nx, ny, KANSAI_LAND)) {
        // 都市近傍チェック
        let nearCity = false;
        let nearPath = false;
        for (const c of KANSAI_CITIES) {
          const dx = nx - c.nx;
          const dy = ny - c.ny;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 0.025) {
            nearCity = true;
            break;
          }
          if (d < 0.045) {
            nearPath = true;
          }
        }

        if (nearCity) {
          map[idx] = Tile.CITY;
        } else if (nearPath) {
          map[idx] = Tile.PATH;
        } else {
          // Perlinノイズでバイオーム決定
          const n = fbm(nx * 7 + 3.7, ny * 7 + 1.2, 3);
          // 標高も考慮（北部・内陸部は山が多い）
          const elev = fbm(nx * 4 + 10, ny * 4 + 10, 2);
          if (elev > 0.18) {
            map[idx] = Tile.MOUNTAIN;
          } else if (n > 0.08) {
            map[idx] = Tile.FOREST;
          } else if (n > -0.05) {
            map[idx] = Tile.DARK_GRASS;
          } else {
            map[idx] = Tile.GRASS;
          }
        }
      } else {
        map[idx] = Tile.WATER;
      }
    }
  }

  // Pass 2: 砂浜（陸地で隣接する水タイルがある場所）
  const copy = new Uint8Array(map);
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const idx = gy * GRID_W + gx;
      const t = copy[idx];
      if (
        t !== Tile.GRASS &&
        t !== Tile.DARK_GRASS &&
        t !== Tile.FOREST &&
        t !== Tile.MOUNTAIN
      )
        continue;

      let touchesWater = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx2 = gx + dx;
          const ny2 = gy + dy;
          if (nx2 < 0 || nx2 >= GRID_W || ny2 < 0 || ny2 >= GRID_H) continue;
          const nt = copy[ny2 * GRID_W + nx2];
          if (nt === Tile.WATER || nt === Tile.DEEP_WATER || nt === Tile.BIWA) {
            touchesWater = true;
            break;
          }
        }
        if (touchesWater) break;
      }
      if (touchesWater) {
        map[idx] = Tile.SAND;
      }
    }
  }

  // Pass 3: 深海（陸地から3タイル以上離れた水）
  for (let gy = 0; gy < GRID_H; gy++) {
    for (let gx = 0; gx < GRID_W; gx++) {
      const idx = gy * GRID_W + gx;
      if (map[idx] !== Tile.WATER) continue;
      const d = distToLand(gx, gy, map, 4);
      if (d >= 4) {
        map[idx] = Tile.DEEP_WATER;
      }
    }
  }

  return map;
}

/* ── ピクセルアートスプライトデータ ── */

/**
 * 木スプライト (5×7)
 * 0=透明, 1=幹(茶), 2=葉(緑), 3=葉ハイライト
 */
export const TREE_SPRITE: number[][] = [
  [0, 0, 3, 0, 0],
  [0, 3, 2, 3, 0],
  [3, 2, 2, 2, 3],
  [2, 2, 2, 2, 2],
  [0, 2, 2, 2, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 1, 0, 0],
];

export const TREE_COLORS = ["", "#5c3a1e", "#2a7a22", "#3c9a34"];

/**
 * 建物スプライト (5×6)
 * 0=透明, 1=壁, 2=屋根, 3=窓, 4=ドア
 */
export const BUILDING_SPRITE: number[][] = [
  [0, 2, 2, 2, 0],
  [2, 2, 2, 2, 2],
  [1, 3, 1, 3, 1],
  [1, 1, 1, 1, 1],
  [1, 3, 4, 3, 1],
  [1, 1, 4, 1, 1],
];

export const BUILDING_COLORS = ["", "#a09080", "#8b4a2a", "#4a6a8a", "#5a3a1a"];

/**
 * マイクラ風キャラクタースプライト (6×10)
 * 0=透明, 1=肌, 2=髪, 3=シャツ(hue色), 4=パンツ(暗), 5=靴(暗)
 * 2フレーム（歩行アニメ）
 */
export const CHAR_FRAME_0: number[][] = [
  [0, 2, 2, 2, 0, 0],
  [0, 2, 1, 2, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 3, 3, 3, 0, 0],
  [3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 0, 0],
  [0, 4, 0, 4, 0, 0],
  [0, 4, 0, 4, 0, 0],
  [0, 5, 0, 5, 0, 0],
];

export const CHAR_FRAME_1: number[][] = [
  [0, 2, 2, 2, 0, 0],
  [0, 2, 1, 2, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 3, 3, 3, 0, 0],
  [3, 3, 3, 3, 3, 0],
  [0, 3, 3, 3, 0, 0],
  [0, 0, 4, 4, 0, 0],
  [0, 4, 0, 0, 4, 0],
  [0, 5, 0, 0, 5, 0],
];

/**
 * シードベースの疑似乱数（タイル座標からツリー配置を決定的に）
 */
export function tileSeed(gx: number, gy: number): number {
  let h = gx * 374761393 + gy * 668265263;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}
