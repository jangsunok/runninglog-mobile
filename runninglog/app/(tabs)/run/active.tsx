/**
 * Active Run - 실시간 달리기 기록 화면
 * - 네이버 지도 + GPS 경로, 거리/시간/페이스
 * - 위치 권한 온보딩 및 거절 시 설정 이동
 * - 일시정지/재개/종료
 * - 다크/라이트 테마 지원
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, usePreventRemove } from '@react-navigation/native';
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

let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // fallback in render
}

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
  } = useRunStore();

  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleStart = useCallback(() => {
    startRun();
    startLocationUpdates().catch((e) =>
      console.warn('[active] startLocationUpdates', e)
    );
  }, [startRun]);

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
  const pauseButtonBg = isDark ? '#374151' : theme.lightGray;
  const gradientEnd = theme.mapDark;

  const startPauseLabel =
    status === 'idle' ? '시작' : status === 'paused' ? '재개' : '일시중단';
  const startPauseIcon =
    status === 'idle' || status === 'paused' ? 'play-arrow' : 'pause';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* ── Map Section ─────────────────────────────── */}
      <View style={[styles.mapSection, { backgroundColor: theme.mapDark }]}>
        <ActiveRunMapView
          coordinates={coordinates}
          isFollowingUser={status === 'running'}
          style={styles.mapFill}
        />
        {LinearGradient ? (
          <LinearGradient
            colors={[`rgba(31,41,55,0)`, gradientEnd]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.mapGradient}
          />
        ) : (
          <View style={[styles.mapGradientFallback, { backgroundColor: `${gradientEnd}66` }]} />
        )}

        {/* Header: back + title + LIVE + GPS */}
        <View
          style={[
            styles.headerBar,
            {
              paddingTop: Math.max(insets.top, 16),
              backgroundColor: isDark ? 'rgba(13,13,13,0.6)' : 'rgba(245,245,245,0.85)',
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.headerBack}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.text}
            />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            Active Run - Map View
          </Text>
          <View style={styles.statusIcons}>
            {status === 'running' && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <Pressable
              onPress={
                gpsEnabled === false
                  ? () => openAppSettings()
                  : undefined
              }
              style={[
                styles.gpsBadge,
                gpsEnabled === false && styles.gpsBadgeDisabled,
              ]}
            >
              <MaterialIcons
                name="gps-fixed"
                size={14}
                color={gpsEnabled === false ? '#9CA3AF' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.gpsText,
                  gpsEnabled === false && styles.gpsTextDisabled,
                ]}
              >
                GPS
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Metrics overlay (지도 하단 반투명 카드) */}
        <View
          style={[
            styles.metricsOverlay,
            {
              backgroundColor: isDark ? 'rgba(13,13,13,0.85)' : 'rgba(245,245,245,0.9)',
            },
          ]}
        >
          <View style={styles.mainMetrics}>
            <Text style={styles.distanceValue}>{distanceKm.toFixed(2)}</Text>
            <Text style={[styles.distanceLabel, { color: theme.text }]}>km</Text>
          </View>
          <Text style={[styles.timerText, { color: theme.text }]}>
            {formatTime(displaySeconds)}
          </Text>
          <View style={styles.secondaryMetrics}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: theme.text }]}>{paceStr}</Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>페이스</Text>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.heartValueRow}>
                <MaterialIcons name="favorite" size={20} color={HeartRed} />
                {/* 2차: HealthKit / Health Connect 연동 시 실시간 심박수 표시 */}
                <Text style={[styles.metricValue, { color: theme.text }]}> --</Text>
              </View>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>심박수</Text>
            </View>
          </View>
        </View>

        {/* Split Notification (예시: 1km 구간 시 연출 가능) */}
        {showSplit && (
          <View style={[styles.splitCard, { backgroundColor: theme.lightGray }]}>
            <View style={styles.splitHeader}>
              <View style={styles.splitTitle}>
                <View style={styles.splitBadge}>
                  <Text style={styles.splitBadgeText}>1 km</Text>
                </View>
                <Text style={[styles.splitTitleText, { color: theme.text }]}>스플릿 완료!</Text>
              </View>
              <Pressable onPress={handleDismissSplit} hitSlop={12}>
                <MaterialIcons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.splitMetrics}>
              <View style={styles.splitMetricItem}>
                <Text style={styles.splitPaceValue}>{paceStr}</Text>
                <Text style={[styles.splitPaceLabel, { color: theme.textSecondary }]}>이번 구간 페이스</Text>
              </View>
              <View style={styles.splitMetricItem}>
                <Text style={[styles.splitAvgValue, { color: theme.text }]}>{paceStr}</Text>
                <Text style={[styles.splitPaceLabel, { color: theme.textSecondary }]}>평균 페이스</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── Button Section ──────────────────────────── */}
      <View
        style={[
          styles.buttonSection,
          {
            paddingBottom: Math.max(insets.bottom, 48),
            backgroundColor: theme.background,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: pauseButtonBg },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handlePauseToggle}
        >
          <MaterialIcons
            name={startPauseIcon}
            size={24}
            color={isDark ? '#FFFFFF' : theme.text}
          />
          <Text
            style={[
              styles.actionButtonText,
              { color: isDark ? '#FFFFFF' : theme.text },
            ]}
          >
            {startPauseLabel}
          </Text>
        </Pressable>
        <EndRunButton onComplete={handleStop} disabled={saving} />
      </View>

      {saving && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-only">
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
              },
            ]}
          >
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
              저장 중...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },

  mapSection: {
    height: 320,
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
    pointerEvents: 'none',
  },

  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 4,
    gap: 12,
  },
  headerBack: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
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
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
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
  gpsBadgeDisabled: {
    backgroundColor: 'rgba(107,114,128,0.8)',
  },
  gpsTextDisabled: {
    color: '#9CA3AF',
  },

  metricsOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
    zIndex: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  mainMetrics: {
    alignItems: 'center',
    gap: 4,
  },
  distanceValue: {
    fontSize: 56,
    fontWeight: '800',
    color: BrandOrange,
  },
  distanceLabel: {
    fontSize: 20,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 40,
    fontWeight: '700',
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
    fontSize: 24,
    fontWeight: '700',
  },
  heartValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  splitCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    top: 200,
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
    fontSize: 24,
    fontWeight: '700',
  },
  splitPaceLabel: {
    fontSize: 12,
    fontWeight: '500',
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
  stopButton: {
    backgroundColor: BrandOrange,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
