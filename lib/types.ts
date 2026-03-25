export interface Entity {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  name: string;
  gen: number;
  color: string;
  size: number;
  age: number;
  maxAge: number;
  isRegisteredUser?: boolean;
  uid?: string;
}

export interface Settlement {
  x: number;
  y: number;
  name: string;
  pop: number;
  size: number;
  id: number;
  color: string;
  displayPop: number;
  animDelay: number;
}

export interface TerrainPoint {
  x: number;
  y: number;
  h: number;
}

export interface Era {
  n: string;
  y: number;
  c: string;
}

export interface SimState {
  userName: string;
  adam: string;
  eve: string;
  adamT: string;
  eveT: string;
  goal: string;
  creatorTrait: string;
  year: number;
  pop: number;
  era: Era;
  techs: string[];
  logs: LogEntry[];
  progress: number;
  generation: number;
  births: number;
  deaths: number;
  discoveries: number;
  tickCount: number;
}

export interface LogEntry {
  year: number;
  text: string;
  major: boolean;
}

export interface RegisteredUser {
  uid: string;
  name: string;
  trait: string;
  registeredAt: number;
}

export interface AIEventResult {
  events?: { type: string; title: string; text: string; impact: string }[];
  newDiscovery?: string | null;
  storyFragment?: string | null;
}

export interface EpochResult {
  title: string;
  subtitle: string;
  description: string;
}

/** 管理者が保存する世界の定義 */
export interface WorldConfig {
  name: string;
  goal: string;
  creator: string;
}

/** ユーザー側の登録（地図上の「人」1体と対応） */
export interface MapRegisteredUser {
  id: string;
  displayName: string;
  motto?: string;
  registeredAt: number;
}

export type Phase = "landing" | "admin_setup" | "user_register" | "world";
