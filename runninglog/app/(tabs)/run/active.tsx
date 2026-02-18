/**
 * Active Run - 실시간 달리기 기록 화면
 * - 네이버 지도 + GPS 경로, 거리/시간/페이스
 * - 위치 권한 온보딩 및 거절 시 설정 이동
 * - 일시정지/재개/종료
 * - 전체 화면 지도 + 블러 오버레이 UI
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ActiveRunMapView,
  type ActiveRunMapViewRef,
} from '@/components/run/ActiveRunMapView';
import { EndRunButton } from '@/components/run/EndRunButton';
import { LocationPermissionDenied } from '@/components/run/LocationPermissionDenied';
import { LocationPermissionOnboarding } from '@/components/run/LocationPermissionOnboarding';
import { BrandOrange, Colors, HeartRed } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { useSyncRunToServer } from '@/hooks/use-sync-run-to-server';
import { formatPace } from '@/lib/utils/geo';
import {
  startLocationUpdates,
  stopLocationUpdates,
} from '@/services/location/LocationService';
import * as Location from 'expo-location';
import type { RunRecord } from '@/types/run';
import { useRunStore } from '@/stores/runStoreSelectors';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function RunActiveScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const isDark = colorScheme === 'dark';

  const {
    canRun,
    foreground,
    isRequesting,
    requestForRun,
    refresh: refreshPermission,
    openAppSettings,
  } = useLocationPermission();

  const {
    status,
    currentSession,
    liveMetrics,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    addLocations,
  } = useRunStore();

  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState<boolean | null>(null);
  /** 최초 진입 시 현재 GPS로 지도 중심용 (좌표 없을 때 사용) */
  const [initialGpsRegion, setInitialGpsRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<ActiveRunMapViewRef>(null);
  const watchSubscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const { sync, loading: saving, error: syncError } = useSyncRunToServer();

  const handleSaveAndLeave = useCallback(
    async (record: RunRecord) => {
      const result = await sync(record);
      if (result != null) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          '저장 실패',
          syncError ?? '서버에 저장하지 못했습니다. 다시 시도해 주세요.'
        );
      }
    },
    [sync, router, syncError]
  );

  // 기록 진행 중 백버튼/이탈 시도 시 일시정지 후 알림. 취소 시 즉시 재개
  usePreventRemove(status === 'running', ({ data }) => {
    pauseRun();
    stopLocationUpdates();

    if (Platform.OS === 'web') {
      const ok = window.confirm(
        '기록을 중단할까요? 취소하면 기록이 다시 진행됩니다.'
      );
      if (ok) {
        navigation.dispatch(data.action);
      } else {
        resumeRun();
        startLocationUpdates().catch((e) =>
          console.warn('[active] startLocationUpdates', e)
        );
      }
    } else {
      Alert.alert(
        '기록을 중단할까요?',
        '취소하면 기록이 바로 다시 진행됩니다.',
        [
          {
            text: '취소',
            style: 'cancel',
            onPress: () => {
              resumeRun();
              startLocationUpdates().catch((e) =>
                console.warn('[active] startLocationUpdates', e)
              );
            },
          },
          {
            text: '중단',
            style: 'destructive',
            onPress: () => navigation.dispatch(data.action),
          },
        ]
      );
    }
  });

  // 권한 확인 + 기기 GPS(위치 서비스) 활성 여부 확인
  useFocusEffect(
    useCallback(() => {
      refreshPermission();
      if (Platform.OS !== 'web') {
        Location.getProviderStatusAsync()
          .then((status) => setGpsEnabled(status.locationServicesEnabled))
          .catch(() => setGpsEnabled(false));
      } else {
        setGpsEnabled(true);
      }
    }, [refreshPermission])
  );

  // 최초 진입 시 현재 GPS로 지도 중심 설정 (좌표가 없을 때 지도에 현재 위치 표시)
  useFocusEffect(
    useCallback(() => {
      if (!canRun || Platform.OS === 'web') return;
      let mounted = true;
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      })
        .then((loc) => {
          if (!mounted) return;
          const { latitude, longitude } = loc.coords;
          setInitialGpsRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        })
        .catch((e) => console.warn('[active] initial GPS for map', e));
      return () => {
        mounted = false;
      };
    }, [canRun])
  );

  // 포그라운드 위치 watch: Android 등에서 백그라운드 태스크만으로는 업데이트가 느릴 수 있어 실시간 보강
  useEffect(() => {
    if (status !== 'running') {
      if (watchSubscriptionRef.current) {
        watchSubscriptionRef.current.remove();
        watchSubscriptionRef.current = null;
      }
      return;
    }
    let mounted = true;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 3000,
      },
      (loc) => {
        if (!mounted) return;
        addLocations([
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp,
          },
        ]);
      }
    )
      .then((sub) => {
        if (mounted) watchSubscriptionRef.current = sub;
        else sub.remove();
      })
      .catch((e) => console.warn('[active] watchPositionAsync', e));
    return () => {
      mounted = false;
      watchSubscriptionRef.current?.remove();
      watchSubscriptionRef.current = null;
    };
  }, [status, addLocations]);

  // 1초마다 경과 시간 갱신 (running/paused)
  useEffect(() => {
    if (status !== 'running' && status !== 'paused' || !currentSession) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const update = () => {
      if (!currentSession) return;
      if (status === 'running') {
        const elapsed =
          (Date.now() - currentSession.startedAt - (currentSession.pausedDurationMs ?? 0)) / 1000;
        setDisplaySeconds(Math.floor(elapsed));
      } else {
        setDisplaySeconds(Math.floor(currentSession.totalDurationMs / 1000));
      }
    };
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, currentSession?.id, currentSession?.startedAt, currentSession?.pausedDurationMs, currentSession?.totalDurationMs]);

  const handleOnboardingRequest = useCallback(async () => {
    const granted = await requestForRun();
    if (granted) {
      startRun();
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        addLocations([
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            timestamp: loc.timestamp,
          },
        ]);
      } catch (e) {
        console.warn('[active] getCurrentPosition on onboarding', e);
      }
      startLocationUpdates().catch((e) =>
        console.warn('[active] startLocationUpdates', e)
      );
    }
  }, [requestForRun, startRun, addLocations]);

  const handleMoveToCurrentLocation = useCallback(async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      const { latitude, longitude } = loc.coords;
      mapRef.current?.moveToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (e) {
      console.warn('[active] getCurrentPosition', e);
    }
  }, []);

  const handleStart = useCallback(async () => {
    startRun();
    // 첫 좌표를 즉시 넣어 출발 마커·지도 중심 표시 (Android 등에서 백그라운드 태스크 지연 대비)
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      addLocations([
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          timestamp: loc.timestamp,
        },
      ]);
    } catch (e) {
      console.warn('[active] getCurrentPosition on start', e);
    }
    startLocationUpdates().catch((e) =>
      console.warn('[active] startLocationUpdates', e)
    );
  }, [startRun, addLocations]);

  const handlePauseToggle = useCallback(() => {
    if (status === 'idle') {
      handleStart();
    } else if (status === 'running') {
      pauseRun();
      stopLocationUpdates();
    } else if (status === 'paused') {
      resumeRun();
      startLocationUpdates().catch((e) =>
        console.warn('[active] startLocationUpdates', e)
      );
    }
  }, [status, handleStart, pauseRun, resumeRun]);

  const handleStop = useCallback(() => {
    stopLocationUpdates();
    const record = finishRun();
    if (!record) return;
    handleSaveAndLeave(record);
  }, [finishRun]);

  const handleDismissSplit = useCallback(() => setShowSplit(false), []);

  // 권한 로딩
  if (foreground === 'loading') {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>위치 권한 확인 중...</Text>
      </View>
    );
  }

  // 권한 거절/제한 → 설정 이동 유도
  if (!canRun && (foreground === 'denied' || foreground === 'restricted')) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LocationPermissionDenied onOpenSettings={openAppSettings} />
      </View>
    );
  }

  // 아직 권한 요청 전 (undetermined) → 온보딩
  if (!canRun && foreground === 'undetermined') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LocationPermissionOnboarding onRequest={handleOnboardingRequest} />
      </View>
    );
  }

  // 권한 있음 + 러닝 중/일시정지/대기 → 메인 UI
  const coordinates = currentSession?.coordinates ?? [];
  const distanceKm = liveMetrics.distanceMeters / 1000;
  const paceStr = formatPace(liveMetrics.paceMinPerKm);

  // 오버레이 UI를 고려한 지도 패딩 (현재 위치가 보이는 영역의 중심에 오도록)
  const mapPadding = useMemo(() => ({
    top: insets.top + 260,
    bottom: Math.max(insets.bottom, 16) + 90,
    left: 0,
    right: 0,
  }), [insets.top, insets.bottom]);

  const startPauseLabel =
    status === 'idle' ? '시작' : status === 'paused' ? '재개' : '일시중단';
  const startPauseIcon =
    status === 'idle' || status === 'paused' ? 'play-arrow' : 'pause';

  return (
    <View style={styles.container}>
      {/* ── 전체 화면 지도 ─────────────────────────── */}
      <ActiveRunMapView
        ref={mapRef}
        coordinates={coordinates}
        initialGpsRegion={initialGpsRegion}
        isFollowingUser={status === 'running'}
        mapPadding={mapPadding}
        style={StyleSheet.absoluteFill}
      />

      {/* ── 상단 그라디언트 ─────────────────────────── */}
      <LinearGradient
        colors={['rgba(0,0,0,0.53)', 'transparent']}
        style={[styles.topGradient, { height: insets.top + 90 }]}
      />

      {/* ── 헤더: 뒤로가기 + LIVE + GPS ────────────── */}
      <View style={[styles.headerBar, { top: insets.top + 6 }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.headerBack}
        >
          <MaterialIcons name="chevron-left" size={28} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleMoveToCurrentLocation}
            style={styles.blurBadge}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.locationButtonInner}>
              <MaterialIcons name="my-location" size={18} color="#FFFFFF" />
            </View>
          </Pressable>
          {status === 'running' && (
            <View style={styles.blurBadge}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.liveBadgeInner}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
          )}
          <Pressable
            onPress={gpsEnabled === false ? () => openAppSettings() : undefined}
            style={styles.blurBadge}
          >
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.gpsBadgeInner}>
              <MaterialIcons
                name="gps-fixed"
                size={14}
                color={gpsEnabled === false ? '#9CA3AF' : '#00FF88'}
              />
              <Text
                style={[
                  styles.gpsText,
                  gpsEnabled === false && styles.gpsTextDisabled,
                ]}
              >
                GPS
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* ── 스탯 오버레이 (블러 카드) ─────────────── */}
      <View
        style={[styles.overlayContent, { top: insets.top + 52 }]}
        pointerEvents="box-none"
      >
        <View style={styles.statsOverlayWrap}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.statsContent}>
            <View style={styles.distanceRow}>
              <Text style={styles.distanceValue}>{distanceKm.toFixed(2)}</Text>
              <Text style={styles.distanceUnit}>km</Text>
            </View>
            <Text style={styles.timeValue}>{formatTime(displaySeconds)}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{paceStr}</Text>
                <Text style={styles.statLabel}>페이스</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.hrValueRow}>
                  <MaterialIcons name="favorite" size={20} color={HeartRed} />
                  <Text style={styles.statValue}> --</Text>
                </View>
                <Text style={styles.statLabel}>심박수</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 스플릿 알림 */}
        {showSplit && (
          <View style={styles.splitCard}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.splitContent}>
              <View style={styles.splitHeader}>
                <View style={styles.splitTitle}>
                  <View style={styles.splitBadge}>
                    <Text style={styles.splitBadgeText}>1 km</Text>
                  </View>
                  <Text style={styles.splitTitleText}>스플릿 완료!</Text>
                </View>
                <Pressable onPress={handleDismissSplit} hitSlop={12}>
                  <MaterialIcons name="close" size={20} color="rgba(255,255,255,0.67)" />
                </Pressable>
              </View>
              <View style={styles.splitMetrics}>
                <View style={styles.splitMetricItem}>
                  <Text style={styles.splitPaceValue}>{paceStr}</Text>
                  <Text style={styles.splitLabel}>이번 구간 페이스</Text>
                </View>
                <View style={styles.splitMetricItem}>
                  <Text style={styles.splitAvgValue}>{paceStr}</Text>
                  <Text style={styles.splitLabel}>평균 페이스</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── 하단 그라디언트 ─────────────────────────── */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.53)']}
        style={styles.bottomGradient}
      />

      {/* ── 버튼 영역 ──────────────────────────────── */}
      <View
        style={[
          styles.buttonContainer,
          { bottom: Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.pauseButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handlePauseToggle}
        >
          <View style={styles.buttonIconCircle}>
            <MaterialIcons name={startPauseIcon} size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.buttonText}>{startPauseLabel}</Text>
        </Pressable>
        <EndRunButton onComplete={handleStop} disabled={saving} />
      </View>

      {/* ── 저장 오버레이 ──────────────────────────── */}
      {saving && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-only">
          <View style={styles.savingOverlay}>
            <Text style={styles.savingText}>저장 중...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },

  /* 상단 그라디언트 */
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  /* 헤더 */
  headerBar: {
    position: 'absolute',
    left: 12,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  headerBack: {
    padding: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  /* 블러 뱃지 (LIVE / GPS) */
  blurBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  locationButtonInner: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: HeartRed,
  },
  liveText: {
    color: HeartRed,
    fontSize: 11,
    fontWeight: '700',
  },
  gpsBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  gpsText: {
    color: '#00FF88',
    fontSize: 11,
    fontWeight: '700',
  },
  gpsTextDisabled: {
    color: '#9CA3AF',
  },

  /* 오버레이 컨텐츠 컨테이너 */
  overlayContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    gap: 12,
    zIndex: 4,
  },

  /* 스탯 오버레이 카드 */
  statsOverlayWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsContent: {
    padding: 20,
    paddingHorizontal: 24,
    gap: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  distanceValue: {
    fontSize: 64,
    fontWeight: '800',
    color: BrandOrange,
    lineHeight: 68,
  },
  distanceUnit: {
    fontSize: 22,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.67)',
    lineHeight: 28,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.67)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.19)',
  },
  hrValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  /* 스플릿 카드 */
  splitCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  splitContent: {
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  splitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  splitBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  splitBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  splitTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  splitMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  splitMetricItem: {
    alignItems: 'center',
    gap: 2,
  },
  splitPaceValue: {
    color: BrandOrange,
    fontSize: 24,
    fontWeight: '700',
  },
  splitAvgValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  splitLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.67)',
  },

  /* 하단 그라디언트 */
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },

  /* 버튼 */
  buttonContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 16,
    height: 60,
    zIndex: 5,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    borderRadius: 16,
    gap: 8,
  },
  buttonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },

  /* 저장 오버레이 */
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  savingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
