/**
 * Activity API 요청용 포맷 (duration, pace → HH:MM:SS)
 */

/**
 * 경과 시간(ms) → API duration "HH:MM:SS"
 */
export function msToDurationHHMMSS(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}

/**
 * 페이스(min/km) → API pace "HH:MM:SS" (실제로는 00:MM:SS)
 */
export function paceMinPerKmToDurationHHMMSS(minPerKm: number): string {
  const totalSec = Math.round(minPerKm * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
}
