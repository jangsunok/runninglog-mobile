/**
 * Active Run - 실시간 달리기 기록 화면
 * - 네이버 지도 + GPS 경로, 거리/시간/페이스
 * - 위치 권한 온보딩 및 거절 시 설정 이동
 * - 일시정지/재개/종료
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveRunMapView } from '@/components/run/ActiveRunMapView';
import { LocationPermissionDenied } from '@/components/run/LocationPermissionDenied';
import { LocationPermissionOnboarding } from '@/components/run/LocationPermissionOnboarding';
import { BrandOrange, Colors, HeartRed } from '@/constants/theme';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { formatPace } from '@/lib/utils/geo';
import {
  startLocationUpdates,
  stopLocationUpdates,
} from '@/services/location/LocationService';
import { runStore } from '@/stores/runStore';
import { useRunStore } from '@/stores/runStoreSelectors';

let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // fallback in render
}

const backgroundDark = '#0D0D0D';
const mapDark = '#1F2937';
const textDark = '#FAFAFA';
const darkGray = '#374151';

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function RunActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  } = useRunStore();

  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 진입 시 권한 확인 후 러닝 시작
  useFocusEffect(
    useCallback(() => {
      if (foreground === 'loading' || isRequesting) return;
      if (!canRun) return; // 거절/미허용 시 UI에서 처리

      if (status === 'idle') {
        startRun();
        startLocationUpdates().catch((e) =>
          console.warn('[active] startLocationUpdates', e)
        );
      }
      return () => {};
    }, [canRun, foreground, isRequesting, status, startRun])
  );

  // 앱 설정에서 돌아왔을 때 권한 재확인
  useFocusEffect(
    useCallback(() => {
      refreshPermission();
    }, [refreshPermission])
  );

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
      startLocationUpdates().catch((e) =>
        console.warn('[active] startLocationUpdates', e)
      );
    }
  }, [requestForRun, startRun]);

  const handlePauseToggle = useCallback(() => {
    if (status === 'running') {
      pauseRun();
      stopLocationUpdates();
    } else if (status === 'paused') {
      resumeRun();
      startLocationUpdates().catch((e) =>
        console.warn('[active] startLocationUpdates', e)
      );
    }
  }, [status, pauseRun, resumeRun]);

  const handleStop = useCallback(() => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('러닝을 종료하시겠습니까?');
      if (confirmed) {
        stopLocationUpdates();
        finishRun();
        router.replace('/(tabs)/');
      }
    } else {
      Alert.alert('러닝 종료', '러닝을 종료하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '종료',
          style: 'destructive',
          onPress: () => {
            stopLocationUpdates();
            finishRun();
            router.replace('/(tabs)/');
          },
        },
      ]);
    }
  }, [router, finishRun]);

  const handleDismissSplit = useCallback(() => setShowSplit(false), []);

  // 권한 로딩
  if (foreground === 'loading') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>위치 권한 확인 중...</Text>
      </View>
    );
  }

  // 권한 거절/제한 → 설정 이동 유도
  if (!canRun && (foreground === 'denied' || foreground === 'restricted')) {
    return (
      <View style={styles.container}>
        <LocationPermissionDenied onOpenSettings={openAppSettings} />
      </View>
    );
  }

  // 아직 권한 요청 전 (undetermined) → 온보딩
  if (!canRun && foreground === 'undetermined') {
    return (
      <View style={styles.container}>
        <LocationPermissionOnboarding onRequest={handleOnboardingRequest} />
      </View>
    );
  }

  // 권한 있음 + 러닝 중/일시정지 → 메인 UI
  const coordinates = currentSession?.coordinates ?? [];
  const distanceKm = (liveMetrics.distanceMeters / 1000);
  const paceStr = formatPace(liveMetrics.paceMinPerKm);

  return (
    <View style={styles.container}>
      {/* ── Map Section ─────────────────────────────── */}
      <View style={styles.mapSection}>
        <ActiveRunMapView
          coordinates={coordinates}
          isFollowingUser={status === 'running'}
          style={styles.mapFill}
        />
        {LinearGradient ? (
          <LinearGradient
            colors={['rgba(31,41,55,0)', mapDark]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.mapGradient}
          />
        ) : (
          <View style={styles.mapGradientFallback} />
        )}

        {/* Status bar overlay */}
        <View style={[styles.statusBar, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.statusTime}>
            {new Date().toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </Text>
          <View style={styles.statusIcons}>
            {status === 'running' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <View style={styles.gpsBadge}>
              <MaterialIcons name="gps-fixed" size={14} color="#FFFFFF" />
              <Text style={styles.gpsText}>GPS</Text>
            </View>
          </View>
        </View>

        {/* Split Notification (예시: 1km 구간 시 연출 가능) */}
        {showSplit && (
          <View style={styles.splitCard}>
            <View style={styles.splitHeader}>
              <View style={styles.splitTitle}>
                <View style={styles.splitBadge}>
                  <Text style={styles.splitBadgeText}>1 km</Text>
                </View>
                <Text style={styles.splitTitleText}>스플릿 완료!</Text>
              </View>
              <Pressable onPress={handleDismissSplit} hitSlop={12}>
                <MaterialIcons name="close" size={20} color="#6B7280" />
              </Pressable>
            </View>
            <View style={styles.splitMetrics}>
              <View style={styles.splitMetricItem}>
                <Text style={styles.splitPaceValue}>{paceStr}</Text>
                <Text style={styles.splitPaceLabel}>이번 구간 페이스</Text>
              </View>
              <View style={styles.splitMetricItem}>
                <Text style={styles.splitAvgValue}>{paceStr}</Text>
                <Text style={styles.splitPaceLabel}>평균 페이스</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── Metrics Section ─────────────────────────── */}
      <View style={styles.metricsSection}>
        <View style={styles.mainMetrics}>
          <Text style={styles.distanceValue}>{distanceKm.toFixed(2)}</Text>
          <Text style={styles.distanceLabel}>km</Text>
        </View>
        <Text style={styles.timerText}>{formatTime(displaySeconds)}</Text>
        <View style={styles.secondaryMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{paceStr}</Text>
            <Text style={styles.metricLabel}>페이스</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.heartValueRow}>
              <MaterialIcons name="favorite" size={20} color={HeartRed} />
              <Text style={styles.metricValue}> --</Text>
            </View>
            <Text style={styles.metricLabel}>심박수 bpm</Text>
          </View>
        </View>
      </View>

      {/* ── Button Section ──────────────────────────── */}
      <View style={[styles.buttonSection, { paddingBottom: Math.max(insets.bottom, 48) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.pauseButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handlePauseToggle}
        >
          <MaterialIcons
            name={status === 'paused' ? 'play-arrow' : 'pause'}
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {status === 'paused' ? '재개' : '일시중단'}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.stopButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleStop}
        >
          <MaterialIcons name="stop" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>종료</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundDark,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: textDark,
    fontSize: 16,
  },

  mapSection: {
    height: 320,
    backgroundColor: mapDark,
    position: 'relative',
    overflow: 'hidden',
  },
  mapFill: {
    ...StyleSheet.absoluteFillObject,
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    pointerEvents: 'none',
  },
  mapGradientFallback: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(31,41,55,0.4)',
    pointerEvents: 'none',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4,
    pointerEvents: 'none',
  },
  statusTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,128,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gpsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  splitCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    top: 200,
    backgroundColor: Colors.dark.lightGray,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    zIndex: 5,
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
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '600',
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
    color: '#1E3A5F',
    fontSize: 24,
    fontWeight: '700',
  },
  splitPaceLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },

  metricsSection: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: backgroundDark,
    gap: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mainMetrics: {
    alignItems: 'center',
    gap: 8,
  },
  distanceValue: {
    fontSize: 72,
    fontWeight: '800',
    color: BrandOrange,
  },
  distanceLabel: {
    fontSize: 24,
    fontWeight: '500',
    color: textDark,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  secondaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  metricItem: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heartValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: textDark,
  },

  buttonSection: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    paddingTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  pauseButton: {
    backgroundColor: darkGray,
  },
  stopButton: {
    backgroundColor: BrandOrange,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
