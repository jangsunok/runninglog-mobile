import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import type { ApiCoordinate } from '@/types/activity';
import type { Coordinate } from '@/types/run';

interface RoutePathSvgProps {
  coordinates: Coordinate[] | [number, number][] | ApiCoordinate[];
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
  padding?: number;
}

function normalizeCoords(
  coords: Coordinate[] | [number, number][] | ApiCoordinate[],
): { lat: number; lng: number }[] {
  return coords.map((c) => {
    if (Array.isArray(c)) return { lat: c[0], lng: c[1] };
    if ('latitude' in c) return { lat: c.latitude, lng: c.longitude };
    return { lat: c.lat, lng: c.lng };
  });
}

export function RoutePathSvg({
  coordinates,
  width,
  height,
  strokeColor = '#FF6F00',
  strokeWidth = 3,
  padding = 20,
}: RoutePathSvgProps) {
  const pathD = useMemo(() => {
    const pts = normalizeCoords(coordinates);
    if (pts.length < 2) return '';

    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const drawW = width - padding * 2;
    const drawH = height - padding * 2;

    const mapped = pts.map((p) => ({
      x: padding + ((p.lng - minLng) / lngRange) * drawW,
      y: padding + ((maxLat - p.lat) / latRange) * drawH,
    }));

    return mapped.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [coordinates, width, height, padding]);

  if (!pathD) return null;

  return (
    <Svg width={width} height={height}>
      <Path
        d={pathD}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
