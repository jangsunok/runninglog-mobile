import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, Heart, Share2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ThemedView } from '@/components/themed-view';
import { BrandOrange, BrandOrangeLight, Colors, F, HeartRed } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AIPacemakerCard } from '@/components/ai-pacemaker-card';
import { getActivities } from '@/lib/api/activities';
import { useCoachingMessage } from '@/hooks/use-coaching-message';
import type { ActivityListItem } from '@/types/activity';

// ─── 주간 캘린더 생성 (일요일 시작) ──────────────────────────────────────────
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getWeekCalendar(runDays: Set<number>) {
  const today = new Date();
  const todayDate = today.getDate();
  const dayOfWeek = today.getDay(); // 0=일요일, 1=월, ..., 6=토
  const sundayOffset = -dayOfWeek; // 이번 주 일요일까지의 차이

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + sundayOffset + i);
    const date = d.getDate();
    return {
      label: WEEKDAY_LABELS[i],
      date,
      hasRun: runDays.has(date),
      isToday: date === todayDate && d.getMonth() === today.getMonth(),
    };
  });
}

function formatDurationHHMMSS(value?: string | null): string {
  if (!value) return '00:00:00';
  const parts = value.split(':').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return '00:00:00';
  }
  const [h, m, s] = parts;
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':');
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

  const handleShare = useCallback(async () => {
    if (!latestActivity) {
      Toast.show({ type: 'info', text1: '공유할 러닝 기록이 아직 없어요.' });
      return;
    }

    const distance = latestActivity.distance_km.toFixed(2);
    const duration = formatDurationHHMMSS(latestActivity.duration_display);
    const pace = (latestActivity.average_pace_display?.trim() || "00'00\"");

    const messageLines = [
      `오늘의 러닝 기록을 공유할게요 🏃‍♀️`,
      '',
      `거리: ${distance} km`,
      `시간: ${duration}`,
      `평균 페이스: ${pace}`,
      '',
      aiMessage ? `페이스메이커 한마디: ${aiMessage}` : '',
      'with Runninglog',
    ].filter(Boolean);

    try {
      await Share.share({
        message: messageLines.join('\n'),
      });
    } catch {
      Toast.show({ type: 'error', text1: '공유하기에 실패했어요. 다시 시도해 주세요.' });
    }
  }, [latestActivity, aiMessage]);

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
            onPress={() => router.push('/(tabs)/my/notifications')}
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
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* 주간 스트릭 캘린더 (기록 주간 뷰와 동일 디자인·간격, 배경 없음) */}
        <View style={styles.weekCalendar}>
          <View style={styles.weekdayRow}>
            {weekDays.map((day) => (
              <View key={day.label} style={styles.weekdayCell}>
                <Text style={[styles.weekdayText, { color: theme.textTertiary }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.weekRow}>
            {weekDays.map((day) => {
              const hasRun = day.hasRun;
              const todayFlag = day.isToday;

              return (
                <View key={`${day.label}-${day.date}`} style={styles.dayCell}>
                  <View
                    style={[
                      styles.dayBadge,
                      hasRun && styles.dayBadgeRun,
                      !hasRun && !todayFlag && [styles.dayBadgeEmpty, { backgroundColor: theme.lightGray }],
                      todayFlag && !hasRun && styles.dayBadgeToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: theme.text },
                        hasRun && styles.dayTextRun,
                        todayFlag && !hasRun && styles.dayTextToday,
                      ]}
                    >
                      {day.date}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 기록 영역 + 공유 버튼 (가장 최신 기록 기준) */}
        <View style={styles.recordContainer}>
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
              color={colorScheme === 'dark' ? '#FFFFFF' : theme.icon}
              strokeWidth={2}
            />
          </Pressable>

          {/* 거리 표시 */}
          <View style={styles.distanceSection}>
            <Text style={styles.distanceValue}>
              {latestActivity ? latestActivity.distance_km.toFixed(2) : '0.00'}
            </Text>
            <Text style={[styles.distanceUnit, { color: theme.text }]}>KM</Text>
          </View>

          {/* 타이머 표시 */}
          <Text style={[styles.timerText, { color: theme.text }]}>
            {formatDurationHHMMSS(latestActivity?.duration_display)}
          </Text>

          {/* 현재 페이스 & 심박수 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {(latestActivity?.average_pace_display?.trim() || "00'00\"")}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                평균 페이스
              </Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.heartRateRow}>
                <Heart size={22} color={HeartRed} fill={HeartRed} strokeWidth={2} />
                <Text style={[styles.statValue, { color: theme.text }]}>-</Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                심박수 bpm
              </Text>
            </View>
          </View>
        </View>

        {/* AI 페이스메이커 카드 */}
        <AIPacemakerCard message={aiMessage} style={styles.aiCard} theme={theme} />

        {/* RUN 버튼 */}
        <View style={styles.runButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.runButtonOuter,
              pressed && styles.runButtonPressed,
            ]}
            onPress={handleRunPress}
          >
            <LinearGradient
              colors={[BrandOrangeLight, BrandOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.runButtonGradient}
            >
              <MaterialIcons
                name="directions-run"
                size={34}
                color="#FFFFFF"
              />
              <Text style={[styles.runButtonText, { color: '#FFFFFF' }]}>
                RUN
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* FAB 하단 간격 */}
        <View style={styles.fabSpacer} />
      </ScrollView>
    </ThemedView>
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

  /* 주간 스트릭 캘린더 (기록 주간 뷰와 동일 간격, 배경 없음) */
  weekCalendar: {
    marginBottom: 32,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontFamily: F.inter400,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeRun: {
    backgroundColor: BrandOrange,
  },
  dayBadgeEmpty: {
    backgroundColor: undefined,
  },
  dayBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  dayText: {
    fontSize: 15,
    fontFamily: F.inter500,
  },
  dayTextRun: {
    color: '#FFFFFF',
    fontFamily: F.inter700,
  },
  dayTextToday: {
    color: BrandOrange,
    fontFamily: F.inter700,
  },

  /* 기록 영역 래퍼 (공유 버튼 오버레이) */
  recordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  shareButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },

  /* 거리 표시 */
  distanceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 72,
    fontFamily: F.mont800,
    color: BrandOrange,
    letterSpacing: -2,
  },
  distanceUnit: {
    fontSize: 24,
    fontFamily: F.inter500,
    marginLeft: 8,
  },

  /* 타이머 */
  timerText: {
    fontSize: 48,
    fontFamily: F.mont700,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
  },

  /* 페이스 & 심박수 */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 28,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: F.mont700,
  },
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
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

  /* FAB 하단 간격 */
  fabSpacer: {
    height: 80,
  },
});
