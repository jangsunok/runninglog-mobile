/**
 * Active Run MapView - 네이버 지도 기반 실시간 러닝 경로 표시
 * - 시작/현재 위치 주황색 원형 마커(NaverMapCircleOverlay), 경로 폴리라인
 * - 좌표가 없을 때는 initialGpsRegion 또는 서울 기본 중심 표시
 * - ref로 moveToRegion() 노출 → 현재 위치 버튼 등에서 사용
 */

import {
  forwardRef,
  type Ref,
  useImperativeHandle,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import type { Coordinate } from '@/types/run';
import { BrandOrange } from '@/constants/theme';

export type ActiveRunMapViewRef = {
  /** 해당 region으로 카메라 이동 */
  moveToRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
};

// 네이버 지도는 네이티브(iOS/Android) 전용. 웹/미지원 환경에서는 플레이스홀더
let NaverMapView: any = null;
let NaverMapPolylineOverlay: any = null;
let NaverMapCircleOverlay: any = null;

try {
  const NaverMap = require('@mj-studio/react-native-naver-map');
  NaverMapView = NaverMap.NaverMapView;
  NaverMapPolylineOverlay = NaverMap.NaverMapPolylineOverlay;
  NaverMapCircleOverlay = NaverMap.NaverMapCircleOverlay;
} catch {
  // Development Build 없이 실행 시 fallback
}

/** 서울 시청 기본 중심 (좌표 없을 때) */
const DEFAULT_REGION = {
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

interface ActiveRunMapViewProps {
  /** 경로 좌표 (시작 ~ 현재) */
  coordinates: Coordinate[];
  /** 최초 진입 시 현재 GPS로 지도 중심 (좌표 없을 때 사용) */
  initialGpsRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  /** 초기/현재 중심 (선택, 없으면 coordinates 또는 initialGpsRegion 또는 DEFAULT_REGION) */
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  /** 사용자 위치 추적 모드 (카메라가 현재 위치 따라감) */
  isFollowingUser?: boolean;
  /** 지도 콘텐츠 패딩 (오버레이 UI를 고려한 중심 보정) */
  mapPadding?: { top: number; bottom: number; left: number; right: number };
  style?: object;
}

function computeRegion(coords: Coordinate[], padding = 1.4): typeof DEFAULT_REGION {
  if (coords.length === 0) return DEFAULT_REGION;
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * padding, 0.005);
  const lngDelta = Math.max((maxLng - minLng) * padding, 0.005);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

function ActiveRunMapViewInner(
  {
    coordinates,
    initialGpsRegion,
    region: regionProp,
    isFollowingUser = true,
    mapPadding,
    style,
  }: ActiveRunMapViewProps,
  ref: Ref<ActiveRunMapViewRef>
) {
  const mapRef = useRef<any>(null);

  const region = useMemo(() => {
    if (regionProp) return regionProp;
    if (coordinates.length > 0) return computeRegion(coordinates);
    if (initialGpsRegion) return initialGpsRegion;
    return DEFAULT_REGION;
  }, [coordinates, regionProp, initialGpsRegion]);

  const startCoord = coordinates[0] ?? null;
  const currentCoord = coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;

  // 최신 좌표로 카메라를 따라감 (isFollowingUser 활성 시)
  useEffect(() => {
    if (!isFollowingUser || coordinates.length === 0 || !mapRef.current?.animateRegionTo) return;
    const latest = coordinates[coordinates.length - 1];
    mapRef.current.animateRegionTo({
      latitude: latest.latitude,
      longitude: latest.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
      duration: 300,
    });
  }, [coordinates.length, isFollowingUser]);

  useImperativeHandle(
    ref,
    () => ({
      moveToRegion: (r: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }) => {
        mapRef.current?.animateRegionTo?.({ ...r, duration: 300 });
      },
    }),
    []
  );

  if (Platform.OS === 'web' || !NaverMapView) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderText}>지도 (Development Build 필요)</Text>
        <Text style={styles.placeholderSub}>네이버 지도는 iOS/Android 빌드에서 표시됩니다.</Text>
      </View>
    );
  }

  return (
    <NaverMapView
      ref={mapRef}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={region}
      region={region}
      isShowLocationButton={true}
      isShowCompass={false}
      isShowScaleBar={false}
      mapPadding={mapPadding}
    >
      {coordinates.length >= 2 && (
        <NaverMapPolylineOverlay
          coords={coordinates.map((c) => ({ latitude: c.latitude, longitude: c.longitude }))}
          width={5}
          color={BrandOrange}
          zIndex={10}
        />
      )}
      {/* 초기 GPS 위치 마커 (러닝 시작 전, 주황색 원형) */}
      {coordinates.length === 0 && initialGpsRegion && (
        <NaverMapCircleOverlay
          latitude={initialGpsRegion.latitude}
          longitude={initialGpsRegion.longitude}
          radius={10}
          color={BrandOrange}
          outlineWidth={2}
          outlineColor="#FFFFFF"
          zIndex={20}
        />
      )}
      {startCoord && (
        <NaverMapCircleOverlay
          latitude={startCoord.latitude}
          longitude={startCoord.longitude}
          radius={8}
          color={BrandOrange}
          outlineWidth={2}
          outlineColor="#FFFFFF"
          zIndex={20}
        />
      )}
      {currentCoord && coordinates.length > 1 && (
        <NaverMapCircleOverlay
          latitude={currentCoord.latitude}
          longitude={currentCoord.longitude}
          radius={10}
          color={BrandOrange}
          outlineWidth={2}
          outlineColor="#FFFFFF"
          zIndex={21}
        />
      )}
    </NaverMapView>
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
