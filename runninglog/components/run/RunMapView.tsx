/**
 * 러닝 경로 실시간 지도
 * - react-native-maps MapView, Polyline으로 경로 표시
 * - 마지막 좌표에 현재 위치 마커
 *
 * 사용 전: npx expo install react-native-maps, app.json에 config plugin 추가
 */

import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Coordinate } from '@/types/run';

// react-native-maps 설치 후 주석 해제
// import MapView, { Polyline, Marker } from 'react-native-maps';

interface RunMapViewProps {
  coordinates: Coordinate[];
  /** 지도 영역 패딩 (숫자) */
  padding?: number;
}

export function RunMapView({ coordinates, padding = 48 }: RunMapViewProps) {
  const region = useMemo(() => {
    if (coordinates.length === 0) return null;
    const lats = coordinates.map((c) => c.latitude);
    const lngs = coordinates.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latDelta = Math.max((maxLat - minLat) * 1.2, 0.005);
    const lngDelta = Math.max((maxLng - minLng) * 1.2, 0.005);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  }, [coordinates]);

  const lastCoord = coordinates[coordinates.length - 1];

  return (
    <View style={[styles.container, { padding }]}>
      {/* react-native-maps 설치 후 MapView 사용
      <MapView style={StyleSheet.absoluteFillObject} region={region ?? undefined}>
        {coordinates.length >= 2 && (
          <Polyline
            coordinates={coordinates}
            strokeColor="#00aa00"
            strokeWidth={4}
          />
        )}
        {lastCoord && (
          <Marker coordinate={lastCoord} title="현재 위치" />
        )}
      </MapView>
      */}
      {/* 플레이스홀더: 지도 영역 */}
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
  },
});
