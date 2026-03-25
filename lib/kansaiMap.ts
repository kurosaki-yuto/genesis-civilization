/** 画面正規化座標（0–1）での関西イメージ。地理の厳密な一致は求めない */

export interface KansaiCity {
  id: string;
  name: string;
  nx: number;
  ny: number;
  /** 人口配分の重み */
  weight: number;
}

/** 陸域の粗い外形（反時計回り） */
export const KANSAI_LAND: [number, number][] = [
  [0.14, 0.38],
  [0.22, 0.18],
  [0.42, 0.08],
  [0.72, 0.10],
  [0.90, 0.28],
  [0.92, 0.55],
  [0.78, 0.82],
  [0.48, 0.94],
  [0.22, 0.78],
  [0.10, 0.55],
];

/** 大阪湾あたり（海を強調） */
export const KANSAI_BAY = { cx: 0.44, cy: 0.52, rx: 0.14, ry: 0.11 };

export const KANSAI_CITIES: KansaiCity[] = [
  { id: "hikone", name: "彦根", nx: 0.74, ny: 0.16, weight: 0.35 },
  { id: "otsu", name: "大津", nx: 0.68, ny: 0.24, weight: 0.5 },
  { id: "kyoto", name: "京都", nx: 0.62, ny: 0.30, weight: 1.1 },
  { id: "nara", name: "奈良", nx: 0.60, ny: 0.52, weight: 0.55 },
  { id: "osaka", name: "大阪", nx: 0.50, ny: 0.50, weight: 1.5 },
  { id: "kobe", name: "神戸", nx: 0.38, ny: 0.44, weight: 1.0 },
  { id: "himeji", name: "姫路", nx: 0.26, ny: 0.40, weight: 0.65 },
  { id: "wakayama", name: "和歌山", nx: 0.46, ny: 0.78, weight: 0.45 },
];

/** 都市インデックスのペア（往来ルート） */
export const KANSAI_ROUTES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [2, 4],
  [4, 3],
  [4, 5],
  [4, 7],
  [5, 6],
  [3, 7],
  [5, 4],
];

export const MAP_ASPECT = 1.22;
