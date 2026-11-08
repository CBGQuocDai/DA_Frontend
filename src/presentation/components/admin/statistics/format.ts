const compactFormatter = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });
const countFormatter = new Intl.NumberFormat('vi-VN');

/** 847000 -> "847 N", 1200000 -> "1,2 Tr" (axis ticks and tight spots) */
export const formatCompact = (value: number) => compactFormatter.format(value);

export const formatCount = (value: number) => countFormatter.format(value);

/** "2026-11" -> { short: "T11", long: "tháng 11/2026", month: 11, year: 2026 } */
export const parseMonth = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return { year, month, short: `T${month}`, long: `tháng ${month}/${year}` };
};

/** Percent change, or null when there is nothing to compare against. */
export const changePercent = (current: number, previous: number): number | null =>
  previous > 0 ? ((current - previous) / previous) * 100 : null;

export const formatPercent = (value: number) =>
  `${value.toLocaleString('vi-VN', { maximumFractionDigits: value >= 100 || value <= -100 ? 0 : 1 })}%`;

/** Round an axis maximum up to 1, 2, 2.5 or 5 times a power of ten. */
export const niceCeil = (value: number) => {
  if (value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= value) ?? 10;
  return step * power;
};
