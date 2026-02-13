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

import { BrandOrange, Colors, HeartRed } from '@/constants/theme';

let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {
  // expo-linear-gradient not installed — fallback handled in render
}

// ── Mock Data ────────────────────────────────────────────────
const MOCK_INITIAL_SECONDS = 28 * 60 + 45; // 28분 45초
const MOCK_DISTANCE = 5.23;
const MOCK_PACE = "5'29\"";
const MOCK_HEART_RATE = 156;

const SPLIT_DATA = {
  km: 5,
  currentPace: "5'18\"",
  averagePace: "5'24\"",
};

// ── Colors (pen design variables) ────────────────────────────
const backgroundDark = '#0D0D0D';
const mapDark = '#1F2937';
const surfaceDark = '#262626';
const textDark = '#FAFAFA';
const darkGray = '#374151';
const lightGray = '#F3F4F6';
const textSecondary = '#6B7280';
const deepNavy = '#1E3A5F';

// ── Utility ──────────────────────────────────────────────────
function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

// ── Component ────────────────────────────────────────────────
export default function RunActiveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [seconds, setSeconds] = useState(MOCK_INITIAL_SECONDS);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    setIsPaused(true);

    if (Platform.OS === 'web') {
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

  const handleDismissSplit = useCallback(() => {
    setShowSplit(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Map Section ─────────────────────────────── */}
      <View style={styles.mapSection}>
        {/* Gradient overlay: transparent -> mapDark */}
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

        {/* Route path visualization (curved arc) */}
        <View style={styles.routePathContainer}>
          <View style={styles.routePath} />
        </View>

        {/* Start marker */}
        <View style={styles.startMarker} />

        {/* Current position marker */}
        <View style={styles.currentMarker} />

        {/* Status bar overlay */}
        <View style={[styles.statusBar, { paddingTop: insets.top > 0 ? insets.top : 16 }]}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <MaterialIcons name="signal-cellular-alt" size={16} color="#FFFFFF" />
            <MaterialIcons name="wifi" size={16} color="#FFFFFF" />
            <MaterialIcons name="battery-full" size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Split Notification Card */}
        {showSplit && (
          <View style={styles.splitCard}>
            {/* Header */}
            <View style={styles.splitHeader}>
              <View style={styles.splitTitle}>
                <View style={styles.splitBadge}>
                  <Text style={styles.splitBadgeText}>{SPLIT_DATA.km} km</Text>
                </View>
                <Text style={styles.splitTitleText}>스플릿 완료!</Text>
              </View>
              <Pressable onPress={handleDismissSplit} hitSlop={12}>
                <MaterialIcons name="close" size={20} color={textSecondary} />
              </Pressable>
            </View>
            {/* Stats */}
            <View style={styles.splitMetrics}>
              <View style={styles.splitMetricItem}>
                <Text style={styles.splitPaceValue}>{SPLIT_DATA.currentPace}</Text>
                <Text style={styles.splitPaceLabel}>이번 구간 페이스</Text>
              </View>
              <View style={styles.splitMetricItem}>
                <Text style={styles.splitAvgValue}>{SPLIT_DATA.averagePace}</Text>
                <Text style={styles.splitPaceLabel}>평균 페이스</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* ── Metrics Section ─────────────────────────── */}
      <View style={styles.metricsSection}>
        {/* Distance */}
        <View style={styles.mainMetrics}>
          <Text style={styles.distanceValue}>{MOCK_DISTANCE.toFixed(2)}</Text>
          <Text style={styles.distanceLabel}>km</Text>
        </View>

        {/* Timer */}
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>

        {/* Pace & Heart Rate */}
        <View style={styles.secondaryMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{MOCK_PACE}</Text>
            <Text style={styles.metricLabel}>현재 페이스</Text>
          </View>
          <View style={styles.metricItem}>
            <View style={styles.heartValueRow}>
              <MaterialIcons name="favorite" size={20} color={HeartRed} />
              <Text style={styles.metricValue}> {MOCK_HEART_RATE}</Text>
            </View>
            <Text style={styles.metricLabel}>심박수 bpm</Text>
          </View>
        </View>
      </View>

      {/* ── Button Section ──────────────────────────── */}
      <View style={[styles.buttonSection, { paddingBottom: Math.max(insets.bottom, 48) }]}>
        {/* Pause / Resume */}
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
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.actionButtonText}>
            {isPaused ? '재개' : '일시정지'}
          </Text>
        </Pressable>

        {/* Stop */}
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

// ── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundDark,
  },

  /* ── Map Section ──────────────────────────── */
  mapSection: {
    height: 320,
    backgroundColor: mapDark,
    position: 'relative',
    overflow: 'hidden',
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  mapGradientFallback: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    backgroundColor: 'rgba(31,41,55,0.4)',
  },
  routePathContainer: {
    position: 'absolute',
    left: 40,
    top: 80,
    width: 310,
    height: 180,
    zIndex: 2,
  },
  routePath: {
    width: 200,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: BrandOrange,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '30deg' }],
    position: 'absolute',
    right: 20,
    top: 0,
  },
  startMarker: {
    position: 'absolute',
    left: 36,
    top: 236,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BrandOrange,
    zIndex: 3,
  },
  currentMarker: {
    position: 'absolute',
    right: 30,
    top: 136,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BrandOrange,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 3,
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
  },
  statusTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* ── Split Card ───────────────────────────── */
  splitCard: {
    position: 'absolute',
    left: 24,
    width: 342,
    top: 200,
    backgroundColor: lightGray,
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
    color: deepNavy,
    fontSize: 24,
    fontWeight: '700',
  },
  splitPaceLabel: {
    color: textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },

  /* ── Metrics Section ──────────────────────── */
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

  /* ── Button Section ───────────────────────── */
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
