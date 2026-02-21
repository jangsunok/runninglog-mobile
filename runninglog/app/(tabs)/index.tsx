import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Check, Heart, Share2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { ThemedView } from '@/components/themed-view';
import { BrandOrange, Colors, F, HeartRed } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AIPacemakerCard } from '@/components/ai-pacemaker-card';
import { getActivities } from '@/lib/api/activities';
import { useCoachingMessage } from '@/hooks/use-coaching-message';
import type { ActivityListItem } from '@/types/activity';

// ─── 주간 캘린더 생성 (월요일 시작) ──────────────────────────────────────────
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekCalendar(runDays: Set<number>) {
  const today = new Date();
  const todayDate = today.getDate();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 이번 주 월요일

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const date = d.getDate();
    const isFuture = d.getTime() > today.getTime() && date !== todayDate;
    return {
      label: WEEKDAY_LABELS[i],
      date,
      hasRun: runDays.has(date),
      isToday: date === todayDate && d.getMonth() === today.getMonth(),
      isFuture,
    };
  });
}

/** 연속 달린 날 수 계산 (오늘 기준 역순) */
function calcStreak(runDays: Set<number>): number {
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (runDays.has(d.getDate())) {
      streak++;
    } else {
      // 오늘 아직 안 뛰었으면 어제부터 카운트
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

function formatDurationHHMMSS(value?: string | null): string {
  if (!value) return '00:00:00';

  const raw = value.trim();
  if (!raw) return '00:00:00';

  const parts = raw.split(':').map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) {
    // 백엔드에서 이미 보기 좋은 형태로 내려주는 경우 그대로 사용
    return raw;
  }

  if (parts.length === 2) {
    const [m, s] = parts;
    return ['0', m, s].map((n) => n.toString().padStart(2, '0')).join(':');
  }

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
  }

  // 예상하지 못한 포맷이면 원본을 그대로 노출
  return raw;
}

function parseDurationToSeconds(value?: string | null): number {
  if (!value) return 0;

  const raw = value.trim();
  if (!raw) return 0;

  const parts = raw.split(':').map((p) => Number(p));
  if (parts.some((n) => Number.isNaN(n))) {
    return 0;
  }

  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }

  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }

  return 0;
}

function formatSecondsToHHMMSS(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '00:00:00';
  }

  const s = Math.floor(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  const parts = [h, m, sec].map((n) => n.toString().padStart(2, '0'));
  return parts.join(':');
}

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [latestActivity, setLatestActivity] = useState<ActivityListItem | null>(null);
  const [activitiesList, setActivitiesList] = useState<ActivityListItem[]>([]);
  const [runDays, setRunDays] = useState<Set<number>>(new Set());
  const aiMessage = useCoachingMessage(activitiesList);

  const [displayDistance, setDisplayDistance] = useState(0);
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState(0);

  const distanceRafRef = useRef<number | null>(null);
  const durationRafRef = useRef<number | null>(null);

  // 주간 스트릭 캘린더 애니메이션
  const weekCalendarProgress = useSharedValue(0);
  const todayBadgeScale = useSharedValue(1);

  // RUN 버튼 상시 펄스 + 터치 스케일
  const runButtonBaseScale = useSharedValue(1);
  const runButtonPressScale = useSharedValue(1);

  const today = new Date();
  const displayDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const fetchData = useCallback(async () => {
    try {
      const actData = await getActivities({ page: 1, page_size: 50 });

      // 오늘 날짜 기준 가장 최신 기록 1건
      const sorted = [...actData.results].sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );
      setLatestActivity(sorted[0] ?? null);
      setActivitiesList(actData.results);

      // 이번 달 달린 날짜 추출
      const thisMonth = today.getMonth();
      const thisYear = today.getFullYear();
      const days = new Set<number>();
      for (const act of actData.results) {
        const d = new Date(act.started_at);
        if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
          days.add(d.getDate());
        }
      }
      setRunDays(days);
    } catch {
      Toast.show({ type: 'error', text1: '데이터를 불러오지 못했어요.' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weekDays = getWeekCalendar(runDays);
  const streak = calcStreak(runDays);

  const startDistanceAnimation = useCallback((targetKm: number) => {
    const safeTarget = Number.isFinite(targetKm) ? targetKm : 0;

    if (distanceRafRef.current != null) {
      cancelAnimationFrame(distanceRafRef.current);
    }

    const startTime = Date.now();
    const durationMs = 700;

    const step = () => {
      const now = Date.now();
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = safeTarget * eased;
      setDisplayDistance(value);

      if (t < 1) {
        distanceRafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayDistance(safeTarget);
        distanceRafRef.current = null;
      }
    };

    step();
  }, []);

  const startDurationAnimation = useCallback((targetSeconds: number) => {
    const safeTarget = Number.isFinite(targetSeconds) ? targetSeconds : 0;

    if (durationRafRef.current != null) {
      cancelAnimationFrame(durationRafRef.current);
    }

    const startTime = Date.now();
    const durationMs = 700;

    const step = () => {
      const now = Date.now();
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = safeTarget * eased;
      setDisplayDurationSeconds(value);

      if (t < 1) {
        durationRafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayDurationSeconds(safeTarget);
        durationRafRef.current = null;
      }
    };

    step();
  }, []);

  useEffect(
    () => () => {
      if (distanceRafRef.current != null) {
        cancelAnimationFrame(distanceRafRef.current);
      }
      if (durationRafRef.current != null) {
        cancelAnimationFrame(durationRafRef.current);
      }
    },
    []
  );

  /** 기록(거리/타이머) + 스트릭 캘린더 애니메이션 실행 */
  const runRecordAndStreakAnimations = useCallback(() => {
    // 거리 / 타이머 숫자 카운트 업
    const targetDistance = latestActivity ? latestActivity.distance_km : 0;
    const targetDurationSeconds = latestActivity
      ? parseDurationToSeconds(latestActivity.duration_display)
      : 0;

    startDistanceAnimation(targetDistance);
    startDurationAnimation(targetDurationSeconds);

    // 주간 스트릭 캘린더
    if (runDays.size > 0) {
      weekCalendarProgress.value = 0;
      weekCalendarProgress.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });

      const todayDate = new Date().getDate();
      if (runDays.has(todayDate)) {
        todayBadgeScale.value = 0.9;
        todayBadgeScale.value = withSequence(
          withTiming(1.06, {
            duration: 550,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, {
            duration: 500,
            easing: Easing.out(Easing.cubic),
          })
        );
      }
    }
  }, [latestActivity, runDays, startDistanceAnimation, startDurationAnimation]);

  // 화면에 진입할 때마다 기록·스트릭 애니메이션 실행
  useFocusEffect(
    useCallback(() => {
      runRecordAndStreakAnimations();
    }, [runRecordAndStreakAnimations])
  );

  // 데이터 로드/갱신 시에도 한 번 실행 (첫 로드 시 useFocusEffect가 빈 데이터로 먼저 돌 수 있음)
  useEffect(() => {
    runRecordAndStreakAnimations();
  }, [runRecordAndStreakAnimations]);

  // RUN 버튼 숨쉬기(펄스) 애니메이션
  useEffect(() => {
    runButtonBaseScale.value = withRepeat(
      withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [runButtonBaseScale]);

  const runButtonAnimatedStyle = useAnimatedStyle(() => {
    const baseScale = runButtonBaseScale.value;
    const pressScale = runButtonPressScale.value;

    return {
      transform: [
        {
          scale: baseScale * pressScale,
        },
      ],
    };
  });

  const handleShare = useCallback(() => {
    if (!latestActivity) {
      Toast.show({ type: 'info', text1: '공유할 러닝 기록이 아직 없어요.' });
      return;
    }
    router.push({
      pathname: '/(tabs)/run/share-edit' as any,
      params: { source: 'activity', id: String(latestActivity.activity_id) },
    });
  }, [latestActivity, router]);

  /** RUN 버튼 누르면 액티브 런 화면으로 이동 */
  const handleRunPress = () => {
    router.push('/(tabs)/run/active');
  };

  return (
    <ThemedView style={styles.container}>
      {/* 상단 고정 헤더 */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top, backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.dateText, { color: theme.text }]}>
            {displayDate}
          </Text>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            hitSlop={12}
          >
            <Bell size={24} color={theme.icon} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { flexGrow: 1, paddingBottom: insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 주간 스트릭 캘린더 (카드 스타일) */}
        <View style={styles.weekCalendar}>
          <View style={styles.streakHeaderRow}>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>WEEKLY STREAK</Text>
            {streak > 0 && (
              <Text style={styles.streakCount}>{streak}일 연속 달성 중</Text>
            )}
          </View>
          <View style={[styles.weekCard, { backgroundColor: theme.surface }]}>
            <View style={styles.weekRow}>
              {weekDays.map((day, index) => (
                <WeekDayCell
                  key={`${day.label}-${day.date}`}
                  day={day}
                  index={index}
                  theme={theme}
                  weekCalendarProgress={weekCalendarProgress}
                  todayBadgeScale={todayBadgeScale}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 기록 카드 (가장 최신 기록 기준) */}
        <View style={[styles.recordCard, { backgroundColor: theme.surface }]}>
          {/* 공유 버튼 */}
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareButton,
              pressed && styles.shareButtonPressed,
            ]}
            hitSlop={8}
          >
            <Share2
              size={18}
              color={theme.textSecondary}
              strokeWidth={2}
            />
          </Pressable>

          {/* LATEST ACTIVITY 라벨 */}
          <Text style={styles.latestLabel}>LATEST ACTIVITY</Text>

          {/* 거리 표시 */}
          <View style={styles.distanceSection}>
            <Text style={styles.distanceValue}>
              {displayDistance.toFixed(2)}
            </Text>
            <Text style={[styles.distanceUnit, { color: theme.textSecondary }]}>KM</Text>
          </View>

          {/* 3열 스탯 (구분선 포함) */}
          <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
            <View style={styles.statItem}>
              <View style={styles.statLabelRow}>
                <MaterialIcons name="schedule" size={14} color={theme.textTertiary} />
                <Text style={[styles.statLabelText, { color: theme.textTertiary }]}>TIME</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatSecondsToHHMMSS(displayDurationSeconds)}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <View style={styles.statLabelRow}>
                <MaterialIcons name="speed" size={14} color={theme.textTertiary} />
                <Text style={[styles.statLabelText, { color: theme.textTertiary }]}>PACE</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {(latestActivity?.average_pace_display?.trim() || "0'00\"")}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <View style={styles.statLabelRow}>
                <Heart size={14} color={HeartRed} fill={HeartRed} />
                <Text style={[styles.statLabelText, { color: theme.textTertiary }]}>AVG HR</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                -- BPM
              </Text>
            </View>
          </View>
        </View>

        {/* AI 페이스메이커 카드 */}
        <AIPacemakerCard message={aiMessage} style={styles.aiCard} theme={theme} />

        {/* RUN 버튼 */}
        <View style={styles.runButtonContainer}>
          <Animated.View style={runButtonAnimatedStyle}>
            <Pressable
              style={({ pressed }) => [
                styles.runButtonOuter,
                pressed && styles.runButtonPressed,
              ]}
              onPress={handleRunPress}
              onPressIn={() => {
                runButtonPressScale.value = withTiming(0.94, {
                  duration: 120,
                  easing: Easing.out(Easing.cubic),
                });
              }}
              onPressOut={() => {
                runButtonPressScale.value = withTiming(1, {
                  duration: 160,
                  easing: Easing.out(Easing.cubic),
                });
              }}
            >
              <View style={[styles.runButtonGradient, { backgroundColor: BrandOrange }]}>
                <MaterialIcons name="directions-run" size={34} color="#FFFFFF" />
                <Text style={[styles.runButtonText, { color: '#FFFFFF' }]}>RUN</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* FAB 하단 간격 */}
        <View style={styles.fabSpacer} />
      </ScrollView>
    </ThemedView>
  );
}

type WeekDayCellProps = {
  day: {
    label: string;
    date: number;
    hasRun: boolean;
    isToday: boolean;
    isFuture: boolean;
  };
  index: number;
  theme: any;
  weekCalendarProgress: SharedValue<number>;
  todayBadgeScale: SharedValue<number>;
};

function WeekDayCell({
  day,
  index,
  theme,
  weekCalendarProgress,
  todayBadgeScale,
}: WeekDayCellProps) {
  const hasRun = day.hasRun;
  const todayFlag = day.isToday;
  const isDark = theme.background === '#0D0D0D';

  // 과거 달린 날 (오늘 제외): 체크 아이콘
  const isPastRun = hasRun && !todayFlag;

  const runDayAnimatedStyle = useAnimatedStyle(() => {
    if (!hasRun) return {};
    const progress = weekCalendarProgress.value;
    const eased = 1 - Math.pow(1 - progress, 3);
    if (todayFlag) {
      return { backgroundColor: eased < 0.5 ? (isDark ? '#333' : '#E5E5E5') : BrandOrange };
    }
    // 과거 달린 날: 오렌지 20% 배경
    return { backgroundColor: eased < 0.5 ? (isDark ? '#333' : '#E5E5E5') : (isDark ? 'rgba(255,110,0,0.2)' : 'rgba(255,110,0,0.15)') };
  });

  const todayAnimatedStyle = useAnimatedStyle(() => {
    if (!(todayFlag && hasRun)) return {};
    return { transform: [{ scale: todayBadgeScale.value }] };
  });

  const labelColor = todayFlag ? BrandOrange : theme.textTertiary;

  return (
    <View style={styles.dayCell}>
      {/* 요일 라벨 */}
      <Text style={[styles.weekdayText, { color: labelColor }]}>{day.label}</Text>
      {/* 날짜 배지 */}
      <Animated.View
        style={[
          styles.dayBadge,
          !hasRun && !todayFlag && { borderWidth: 1, borderColor: isDark ? '#404040' : '#E5E5E5' },
          todayFlag && !hasRun && styles.dayBadgeToday,
          todayFlag && hasRun && styles.dayBadgeTodayRun,
          runDayAnimatedStyle,
          todayAnimatedStyle,
        ]}
      >
        {isPastRun ? (
          <Check size={16} color={BrandOrange} strokeWidth={3} />
        ) : (
          <Text
            style={[
              styles.dayText,
              { color: theme.text },
              todayFlag && hasRun && styles.dayTextRun,
              todayFlag && !hasRun && styles.dayTextToday,
            ]}
          >
            {day.date}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

// ─── 스타일 ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    zIndex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* 헤더: 날짜 + 알림 */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateText: {
    fontSize: 28,
    fontFamily: F.inter700,
  },

  /* 주간 스트릭 캘린더 */
  weekCalendar: {
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  streakHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  streakLabel: {
    fontSize: 11,
    fontFamily: F.inter700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  streakCount: {
    fontSize: 12,
    fontFamily: F.inter600,
    color: BrandOrange,
  },
  weekCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  weekdayText: {
    fontSize: 10,
    fontFamily: F.inter700,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  dayBadgeTodayRun: {
    shadowColor: BrandOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  dayText: {
    fontSize: 14,
    fontFamily: F.inter600,
  },
  dayTextRun: {
    color: '#FFFFFF',
    fontFamily: F.inter700,
  },
  dayTextToday: {
    color: BrandOrange,
    fontFamily: F.inter700,
  },

  /* 기록 카드 */
  recordCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 4,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  shareButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  latestLabel: {
    fontSize: 11,
    fontFamily: F.inter700,
    color: BrandOrange,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  /* 거리 표시 */
  distanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  distanceValue: {
    fontSize: 56,
    fontFamily: F.mont800,
    color: BrandOrange,
    letterSpacing: -2,
  },
  distanceUnit: {
    fontSize: 20,
    fontFamily: F.inter600,
    marginLeft: 6,
  },

  /* 3열 스탯 */
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    gap: 6,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabelText: {
    fontSize: 10,
    fontFamily: F.inter600,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontFamily: F.inter700,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: 12,
  },

  /* AI 페이스메이커 카드 */
  aiCard: {
    marginBottom: 32,
  },

  /* RUN 버튼 */
  runButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  runButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    shadowColor: '#00000020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  runButtonGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  runButtonText: {
    fontSize: 10,
    fontFamily: F.inter600,
    letterSpacing: 1.2,
    marginTop: -2,
  },

  /* FAB/탭바 하단 여유 (작은 기기 대비, 여유 스크롤 최소화) */
  fabSpacer: {
    height: 24,
  },
});
