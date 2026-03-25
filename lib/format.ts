export function fmtYear(y: number): string {
  return y < 0
    ? `紀元前 ${Math.abs(Math.round(y)).toLocaleString()}年`
    : `紀元 ${Math.round(y).toLocaleString()}年`;
}

export function fmtPop(p: number): string {
  if (p >= 1e16) return (p / 1e16).toFixed(1) + "京";
  if (p >= 1e12) return (p / 1e12).toFixed(1) + "兆";
  if (p >= 1e9) return (p / 1e9).toFixed(1) + "億";
  if (p >= 1e6) return (p / 1e6).toFixed(1) + "百万";
  if (p >= 1e4) return Math.round(p / 1e4) + "万";
  return p.toLocaleString();
}
