/**
 * GPS 좌표 기반 거리·페이스 계산 (Haversine)
 */

import type { Coordinate } from '@/types/run';

const EARTH_RADIUS_M = 6_371_000;

/**
 * Haversine 공식으로 두 좌표 간 거리(m) 반환
 */
export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_M * c;
}

/**
 * 좌표 배열을 순회하며 총 이동 거리(m) 계산
 */
export function totalDistanceMeters(coordinates: Coordinate[]): number {
  if (coordinates.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    total += distanceMeters(coordinates[i - 1], coordinates[i]);
  }
  return total;
}

/**
 * 거리(m)와 시간(ms)으로 페이스(min/km) 계산
 * 거리가 0이면 null
 */
export function paceMinPerKm(distanceMeters: number, durationMs: number): number | null {
  if (distanceMeters <= 0) return null;
  const distanceKm = distanceMeters / 1000;
  const durationMin = durationMs / 60_000;
  return durationMin / distanceKm;
}

/**
 * 거리 포맷 (m → "1.23 km" / "450 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * 시간 포맷 (ms → "12:34")
 */
export function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/**
 * 페이스 포맷 (min/km → "5'30\"")
 */
export function formatPace(paceMinPerKm: number | null): string {
  if (paceMinPerKm == null) return '--';
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}'${sec.toString().padStart(2, '0')}"`;
}

export interface SplitData {
  split_number: number;
  distance: number;
  durationMs: number;
  paceMinPerKm: number;
}

/**
 * GPS 좌표 배열에서 1km 단위 스플릿을 계산한다.
 * 타임스탬프가 없으면 총 소요시간(totalDurationMs)을 거리 비율로 배분한다.
 */
export function computeSplits(
  coordinates: Coordinate[],
  totalDurationMs: number,
): SplitData[] {
  if (coordinates.length < 2 || totalDurationMs <= 0) return [];

  const hasTimestamps =
    coordinates[0]?.timestamp != null &&
    coordinates[coordinates.length - 1]?.timestamp != null;

  const splits: SplitData[] = [];
  let cumDist = 0;
  let splitStart = 0;
  let splitStartDist = 0;
  let splitNumber = 1;

  for (let i = 1; i < coordinates.length; i++) {
    const segDist = distanceMeters(coordinates[i - 1], coordinates[i]);
    cumDist += segDist;

    while (cumDist >= splitNumber * 1000) {
      const splitDist = 1000;
      let splitDurMs: number;

      if (hasTimestamps) {
        const t0 = coordinates[splitStart].timestamp!;
        const ratio = (splitNumber * 1000 - splitStartDist) / (cumDist - splitStartDist);
        const tPrev = coordinates[i - 1].timestamp!;
        const tCurr = coordinates[i].timestamp!;
        const tSplit = tPrev + (tCurr - tPrev) * ratio;
        splitDurMs = tSplit - t0;
      } else {
        const distFraction = splitDist / (totalDistanceMeters(coordinates) || 1);
        splitDurMs = totalDurationMs * distFraction;
      }

      splitDurMs = Math.max(splitDurMs, 1000);
      const pace = (splitDurMs / 60_000) / (splitDist / 1000);

      splits.push({
        split_number: splitNumber,
        distance: splitDist,
        durationMs: Math.round(splitDurMs),
        paceMinPerKm: pace,
      });

      splitStart = i;
      splitStartDist = splitNumber * 1000;
      splitNumber++;
    }
  }

  const remaining = cumDist - (splitNumber - 1) * 1000;
  if (remaining >= 100) {
    let splitDurMs: number;

    if (hasTimestamps) {
      const t0 = coordinates[splitStart].timestamp!;
      const tEnd = coordinates[coordinates.length - 1].timestamp!;
      splitDurMs = tEnd - t0;
    } else {
      const distFraction = remaining / (totalDistanceMeters(coordinates) || 1);
      splitDurMs = totalDurationMs * distFraction;
    }

    splitDurMs = Math.max(splitDurMs, 1000);
    const pace = (splitDurMs / 60_000) / (remaining / 1000);

    splits.push({
      split_number: splitNumber,
      distance: Math.round(remaining),
      durationMs: Math.round(splitDurMs),
      paceMinPerKm: pace,
    });
  }

  return splits;
}
