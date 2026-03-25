import type { Era, SimState, Settlement, Entity } from "./types";

export const ERAS: Era[] = [
  { n: "虚無の時代", y: -100000, c: "#444" },
  { n: "覚醒の時代", y: -50000, c: "#4a9" },
  { n: "火と石の時代", y: -20000, c: "#a85" },
  { n: "言葉の時代", y: -8000, c: "#a65" },
  { n: "土と種の時代", y: -4000, c: "#6a5" },
  { n: "集いの時代", y: -2000, c: "#5a8" },
  { n: "秩序の時代", y: -500, c: "#85a" },
  { n: "知の爆発", y: 200, c: "#a5c" },
  { n: "鉄と血の時代", y: 800, c: "#c55" },
  { n: "目覚めの時代", y: 1400, c: "#ca5" },
  { n: "機械の時代", y: 1750, c: "#5ac" },
  { n: "光の時代", y: 1950, c: "#a855f7" },
  { n: "超越の時代", y: 2050, c: "#ec4899" },
  { n: "星の時代", y: 2200, c: "#f97316" },
];

export const DISCOVERIES: Record<string, string[]> = {
  虚無の時代: [],
  覚醒の時代: ["意識", "共感", "恐怖の克服"],
  火と石の時代: ["火", "石器", "洞窟画", "骨の道具"],
  言葉の時代: ["言語", "歌", "物語", "踊り", "記号"],
  土と種の時代: ["農耕", "土器", "家畜化", "織物", "発酵"],
  集いの時代: ["村", "交易", "祭祀", "長老制", "地図"],
  秩序の時代: ["文字", "法", "通貨", "暦", "建築"],
  知の爆発: ["哲学", "数学", "天文学", "医術", "冶金"],
  鉄と血の時代: ["製鉄", "城壁", "火薬", "印刷", "羅針盤"],
  目覚めの時代: ["科学的方法", "望遠鏡", "解剖学", "活版印刷", "銀行"],
  機械の時代: ["蒸気機関", "電気", "鉄道", "写真", "電信"],
  光の時代: ["コンピュータ", "インターネット", "遺伝子解析", "AI", "量子理論"],
  超越の時代: ["意識転送", "反重力", "テラフォーミング", "統一場理論", "不老"],
  星の時代: ["恒星間航行", "次元操作", "宇宙意識", "時間制御", "万物創造"],
};

export const SETTLEMENT_NAMES = [
  "希望の丘", "静かなる湖", "風の谷", "光の岬", "星降る原",
  "深き森", "白き峰", "黄金の里", "碧の港", "紅の砦",
  "翡翠の泉", "雷鳴の崖", "暁の都", "月影の郷", "虹の架橋",
  "鋼の街", "夢見の浜", "蒼穹の塔", "花咲く野", "氷の宮",
];

export const COLORS = [
  "#a855f7", "#ec4899", "#f97316", "#06b6d4", "#22c55e",
  "#eab308", "#ef4444", "#8b5cf6", "#14b8a6", "#f43f5e",
  "#84cc16", "#6366f1",
];

const ENTITY_NAMES = [
  "ハルト", "レン", "ソウタ", "カイト", "シン", "リク", "ダイチ",
  "サクラ", "アオイ", "ミツキ", "ユイ", "リン", "ハナ", "ミオ",
];

export function getEra(y: number): Era {
  let e = ERAS[0];
  for (const era of ERAS) if (y >= era.y) e = era;
  return e;
}

export function createSettlement(
  settlements: Settlement[],
  x: number,
  y: number,
  name: string
): Settlement {
  const id = settlements.length;
  const s: Settlement = {
    x, y, name, pop: 0, size: 2, id,
    color: COLORS[id % COLORS.length],
    displayPop: 0,
    animDelay: id * 0.12,
  };
  return s;
}

export function spawnEntity(
  sx: number, sy: number, gen: number, nameOverride?: string, isRegistered = false, uid?: string
): Entity {
  return {
    x: sx, y: sy, tx: sx, ty: sy, vx: 0, vy: 0,
    name: nameOverride || ENTITY_NAMES[(Math.random() * ENTITY_NAMES.length) | 0],
    gen, color: COLORS[gen % COLORS.length],
    size: isRegistered ? 5 : 2.5,
    age: 0,
    maxAge: isRegistered ? Infinity : 250 + Math.random() * 350,
    isRegisteredUser: isRegistered,
    uid,
  };
}

export interface TickResult {
  newSettlement?: { name: string };
  eraChanged?: { newEra: Era };
  newDiscoveries: string[];
  localEvents: string[];
  story?: { t: string; s: string };
}

export function doTick(
  S: SimState,
  settlements: Settlement[],
  entities: Entity[],
  W: number,
  H: number,
  nearestLandFn: (x: number, y: number) => { x: number; y: number }
): TickResult {
  const result: TickResult = { newDiscoveries: [], localEvents: [] };
  S.tickCount++;
  const eIdx = ERAS.indexOf(S.era);

  // Year advance
  const advance = eIdx <= 2
    ? Math.random() * 800 + 200
    : eIdx <= 5
      ? Math.random() * 150 + 50
      : eIdx <= 8
        ? Math.random() * 40 + 10
        : Math.random() * 8 + 2;
  S.year += advance;

  // Population growth — NO CAP
  const rate = 0.01 + eIdx * 0.005;
  const growth = Math.max(1, Math.round(S.pop * rate * (1 + Math.random())));
  S.pop += growth;

  // Distribute population
  distributePopulation(S, settlements);

  // Spawn visual agents
  if (entities.length < 250 && Math.random() < 0.4 && settlements.length > 0) {
    const ps = settlements[(Math.random() * settlements.length) | 0];
    S.generation = Math.max(S.generation, Math.floor((S.year + 100000) / 8000));
    entities.push(
      spawnEntity(
        ps.x + (Math.random() - 0.5) * 50,
        ps.y + (Math.random() - 0.5) * 50,
        S.generation
      )
    );
    S.births++;
  }

  // Age & cull (keep registered users)
  for (let i = entities.length - 1; i >= 0; i--) {
    entities[i].age++;
    if (entities[i].age > entities[i].maxAge && entities[i].gen > 0 && !entities[i].isRegisteredUser) {
      entities.splice(i, 1);
      S.deaths++;
    }
  }

  // Move
  for (const e of entities) {
    if (Math.random() < 0.04 && settlements.length > 0) {
      const t = settlements[(Math.random() * settlements.length) | 0];
      e.tx = t.x + (Math.random() - 0.5) * 60;
      e.ty = t.y + (Math.random() - 0.5) * 60;
    }
    e.vx += (e.tx - e.x) * 0.008;
    e.vy += (e.ty - e.y) * 0.008;
    e.vx *= 0.94;
    e.vy *= 0.94;
    e.x += e.vx;
    e.y += e.vy;
  }

  // New settlements
  if (S.pop > settlements.length * 1500 + 50 && Math.random() < 0.12 && settlements.length < 40) {
    const px = settlements[(Math.random() * settlements.length) | 0];
    const nx = px.x + (Math.random() - 0.5) * W * 0.3;
    const ny = px.y + (Math.random() - 0.5) * H * 0.3;
    const land = nearestLandFn(
      Math.max(20, Math.min(W - 20, nx)),
      Math.max(20, Math.min(H - 20, ny))
    );
    const nm = SETTLEMENT_NAMES[settlements.length % SETTLEMENT_NAMES.length];
    const ns = createSettlement(settlements, land.x, land.y, nm);
    ns.pop = 0;
    settlements.push(ns);
    result.newSettlement = { name: nm };
  }

  // Settlement visual growth
  for (const s of settlements) {
    s.size = Math.min(35, 2 + Math.log2(Math.max(1, s.pop)) * 1.5);
  }

  // Era change
  const ne = getEra(S.year);
  if (ne.n !== S.era.n) {
    S.era = ne;
    result.eraChanged = { newEra: ne };
  }

  // Discoveries
  const disc = DISCOVERIES[S.era.n] || [];
  for (const d of disc) {
    if (!S.techs.includes(d) && Math.random() < 0.05) {
      S.techs.push(d);
      S.discoveries++;
      result.newDiscoveries.push(d);
    }
  }

  // Local fallback events
  if (Math.random() < 0.06) {
    result.localEvents.push(generateLocalEvent(S));
  }

  // Story
  if (Math.random() < 0.015) {
    result.story = generateStory(S, settlements);
  }

  S.progress = Math.min(100, ((S.year + 100000) / 102200) * 100);

  return result;
}

function distributePopulation(S: SimState, settlements: Settlement[]) {
  if (settlements.length === 0) return;
  let totalWeight = 0;
  for (const s of settlements) totalWeight += s.size;
  let assigned = 0;
  for (let i = 0; i < settlements.length; i++) {
    if (i === settlements.length - 1) {
      settlements[i].pop = S.pop - assigned;
    } else {
      const w = settlements[i].size / totalWeight;
      settlements[i].pop = Math.round(S.pop * w);
      assigned += settlements[i].pop;
    }
  }
  for (const s of settlements) {
    const diff = s.pop - s.displayPop;
    s.displayPop += Math.ceil(diff * 0.15);
  }
}

const EVENT_TEMPLATES = [
  (S: SimState) => `${S.adam}の血統から新たな指導者が現れた`,
  (S: SimState) => `${S.eve}の知恵が第${S.generation}世代に受け継がれた`,
  (S: SimState) => `人口増加に伴い、社会構造が変化した`,
  (S: SimState) => `「${S.goal}」への集合意識が強まっている`,
  (S: SimState) => `大きな災害が起きたが、民は結束して乗り越えた`,
  (S: SimState) => `未知の領域への探検隊が出発した`,
  (S: SimState) => `異なる集落間で文化の融合が起きた`,
  (S: SimState) => `${S.creatorTrait}の精神が文明の核として根付いた`,
  (S: SimState) => `新たな思想家が「${S.goal}」の本質を問い直した`,
  (S: SimState) => `${S.adam}の意志を継ぐ者たちが新天地を拓いた`,
];

function generateLocalEvent(S: SimState): string {
  return EVENT_TEMPLATES[(Math.random() * EVENT_TEMPLATES.length) | 0](S);
}

function generateStory(
  S: SimState,
  settlements: Settlement[]
): { t: string; s: string } {
  const stories = [
    {
      t: `第${S.generation}世代`,
      s: `${S.adam}と${S.eve}の子孫たちは「${S.goal}」を胸に日々を生きている。`,
    },
    {
      t: "創造主の影響",
      s: `あなたが信じた「${S.creatorTrait}」が今もこの文明の根底に流れている。`,
    },
    {
      t: "ある集落にて",
      s: `「${settlements.length ? settlements[(Math.random() * settlements.length) | 0].name : "始まりの地"}」で一人の子供が生まれた。この子が歴史を変えるかもしれない。`,
    },
  ];
  return stories[(Math.random() * stories.length) | 0];
}
