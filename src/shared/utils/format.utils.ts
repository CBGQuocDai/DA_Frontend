/** Whole đồng: averages would otherwise print "199.333,333 ₫". */
export const formatVnd = (n: number) => `${Math.round(n).toLocaleString('vi-VN')} ₫`;

/** 4980 -> "1 giờ 23 phút" */
export const formatListeningTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes} phút`;
  return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
};

/** 135 -> "02:15" */
export const formatClock = (totalSeconds: number) => {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const minutes = String(Math.floor(safe / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

/** 200 -> "3m 20s" */
export const formatDuration = (seconds?: number | null) => {
  if (!seconds && seconds !== 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};
