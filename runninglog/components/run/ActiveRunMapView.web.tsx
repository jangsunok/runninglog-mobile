/**
 * Active Run MapView (Web) - 웹에서는 react-native-maps를 사용할 수 없으므로 플레이스홀더 표시
 */

import { forwardRef, type Ref, useImperativeHandle } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import type { Coordinate } from '@/types/run';

export type ActiveRunMapViewRef = {
  moveToRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
};

interface ActiveRunMapViewProps {
  coordinates: Coordinate[];
  initialGpsRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  isFollowingUser?: boolean;
  mapPadding?: { top: number; bottom: number; left: number; right: number };
  style?: object;
}

function ActiveRunMapViewInner(
  { style }: ActiveRunMapViewProps,
  ref: Ref<ActiveRunMapViewRef>
) {
  useImperativeHandle(
    ref,
    () => ({
      moveToRegion: () => {},
    }),
    []
  );

  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>지도 (Development Build 필요)</Text>
      <Text style={styles.placeholderSub}>
        구글맵은 iOS/Android 빌드에서 표시됩니다.
      </Text>
    </View>
  );
}

export const ActiveRunMapView = forwardRef(ActiveRunMapViewInner);

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  placeholderSub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
});
