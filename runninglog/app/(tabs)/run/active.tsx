import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
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

import { BrandOrange } from '@/constants/theme';

// ─── 목업 데이터 ────────────────────────────────────────────
/** 초기 경과 시간(초) — 목업용 28분 45초 */
const MOCK_INITIAL_SECONDS = 28 * 60 + 45;

/** 목업 거리(km) */
const MOCK_DISTANCE = 5.23;

/** 목업 페이스 */
const MOCK_PACE = "5'29\"";

/** 목업 심박수 */
const MOCK_HEART_RATE = 156;

/** 스플릿 카드 데이터 */
const SPLIT_DATA = {
  km: 5,
  currentPace: "5'18\"",
  averagePace: "5'24\"",
};

// ─── 다크 테마 색상 ─────────────────────────────────────────
const DARK_BG = '#1A1A2E';
const DARK_SURFACE = '#16213E';
const DARK_CARD = '#2A2A40';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#A3A3B8';

// ─── 유틸리티 ────────────────────────────────────────────────
/** 초를 HH:MM:SS 문자열로 변환 */
function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function RunActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 타이머 상태
  const [seconds, setSeconds] = useState(MOCK_INITIAL_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 스플릿 알림 카드 표시 여부
  const [showSplit, setShowSplit] = useState(false);
  const splitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1초 간격 타이머 카운트업
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  // 3초 후 스플릿 알림 자동 표시
  useEffect(() => {
    splitTimerRef.current = setTimeout(() => {
      setShowSplit(true);
    }, 3000);
    return () => {
      if (splitTimerRef.current) clearTimeout(splitTimerRef.current);
    };
  }, []);

  /** 일시정지 / 재개 토글 */
  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  /** 종료 확인 후 홈으로 이동 */
  const handleStop = useCallback(() => {
    // 타이머 일시정지
    setIsPaused(true);

    if (Platform.OS === 'web') {
      // 웹에서는 window.confirm 사용
      const confirmed = window.confirm('러닝을 종료하시겠습니까?');
      if (confirmed) {
        router.replace('/(tabs)/');
      } else {
        setIsPaused(false);
      }
    } else {
      Alert.alert('러닝 종료', '러닝을 종료하시겠습니까?', [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setIsPaused(false),
        },
        {
          text: '종료',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)/'),
        },
      ]);
    }
  }, [router]);

  /** 스플릿 카드 닫기 */
  const handleDismissSplit = useCallback(() => {
    setShowSplit(false);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 지도 영역 (플레이스홀더) */}
      <View style={styles.mapArea}>
        <View style={styles.mapPlaceholder}>
          {/* 가상 경로 원호 */}
          <View style={styles.arcContainer}>
            <View style={styles.arc} />
          </View>
          {/* 현재 위치 점 */}
          <View style={styles.locationDot} />
        </View>

        {/* 스플릿 알림 카드 */}
        {showSplit && (
          <View style={styles.splitCard}>
            <View style={styles.splitHeader}>
              <View style={styles.splitBadge}>
                <Text style={styles.splitBadgeText}>
                  {SPLIT_DATA.km} km
                </Text>
              </View>
              <Text style={styles.splitTitle}>스플릿 완료!</Text>
              <Pressable
                onPress={handleDismissSplit}
                hitSlop={12}
                style={styles.splitClose}
              >
                <MaterialIcons name="close" size={20} color={TEXT_SECONDARY} />
              </Pressable>
            </View>
            <View style={styles.splitStats}>
              <View style={styles.splitStatItem}>
                <Text style={styles.splitStatValue}>
                  {SPLIT_DATA.currentPace}
                </Text>
                <Text style={styles.splitStatLabel}>이번 구간 페이스</Text>
              </View>
              <View style={styles.splitStatItem}>
                <Text style={styles.splitStatValue}>
                  {SPLIT_DATA.averagePace}
                </Text>
                <Text style={styles.splitStatLabel}>평균 페이스</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 대시보드 영역 */}
      <View style={styles.dashboard}>
        {/* 실시간 거리 */}
        <Text style={styles.distanceValue}>
          {MOCK_DISTANCE.toFixed(2)}
        </Text>
        <Text style={styles.distanceUnit}>km</Text>

        {/* 타이머 */}
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>

        {/* 페이스 & 심박수 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{MOCK_PACE}</Text>
            <Text style={styles.statLabel}>현재 페이스</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.heartRateRow}>
              <Text style={styles.heartIcon}>♡</Text>
              <Text style={styles.statValue}> {MOCK_HEART_RATE}</Text>
            </View>
            <Text style={styles.statLabel}>심박수 bpm</Text>
          </View>
        </View>

        {/* 하단 버튼 영역 */}
        <View
          style={[styles.buttonRow, { paddingBottom: insets.bottom + 24 }]}
        >
          {/* 일시정지 / 재개 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.pauseButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handlePauseToggle}
          >
            <MaterialIcons
              name={isPaused ? 'play-arrow' : 'pause'}
              size={22}
              color={TEXT_PRIMARY}
            />
            <Text style={styles.actionButtonText}>
              {isPaused ? '재개' : '일시정지'}
            </Text>
          </Pressable>

          {/* 종료 버튼 */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.stopButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleStop}
          >
            <MaterialIcons name="stop" size={22} color={TEXT_PRIMARY} />
            <Text style={styles.actionButtonText}>종료</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── 스타일 ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },

  /* 지도 영역 */
  mapArea: {
    height: 280,
    backgroundColor: DARK_SURFACE,
    position: 'relative',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    position: 'relative',
  },
  arcContainer: {
    position: 'absolute',
    right: 40,
    top: 60,
    width: 120,
    height: 120,
  },
  arc: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: BrandOrange,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  locationDot: {
    position: 'absolute',
    right: 60,
    top: 60,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BrandOrange,
  },

  /* 스플릿 카드 */
  splitCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: DARK_CARD,
    borderRadius: 16,
    padding: 16,
  },
  splitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  splitBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  splitBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  splitTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  splitClose: {
    padding: 4,
  },
  splitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  splitStatItem: {
    alignItems: 'center',
  },
  splitStatValue: {
    color: BrandOrange,
    fontSize: 22,
    fontWeight: '700',
  },
  splitStatLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 4,
  },

  /* 대시보드 */
  dashboard: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 24,
  },

  /* 거리 */
  distanceValue: {
    fontSize: 80,
    fontWeight: '800',
    color: BrandOrange,
    letterSpacing: -2,
    lineHeight: 88,
  },
  distanceUnit: {
    fontSize: 20,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },

  /* 타이머 */
  timerText: {
    fontSize: 44,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
    marginBottom: 20,
  },

  /* 통계 */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF4D6A',
  },
  statLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },

  /* 하단 버튼 */
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 'auto',
    paddingTop: 16,
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
    backgroundColor: '#404060',
  },
  stopButton: {
    backgroundColor: BrandOrange,
  },
  actionButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
});
