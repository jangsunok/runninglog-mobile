import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ThemedView } from '@/components/themed-view';
import { BrandOrange, BrandOrangeLight, Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AIPacemakerCard } from '@/components/ai-pacemaker-card';
import { getActivities } from '@/lib/api/activities';
import { getStatisticsSummary } from '@/lib/api/statistics';
import type { StatisticsSummary } from '@/types/activity';

// ─── 주간 캘린더 생성 ──────────────────────────────────────────
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekCalendar(runDays: Set<number>) {
  const today = new Date();
  const todayDate = today.getDate();
  const dayOfWeek = today.getDay(); // 0=일
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const date = d.getDate();
    return {
      label: WEEKDAY_LABELS[i],
      date,
      hasRun: runDays.has(date),
      isToday: date === todayDate && d.getMonth() === today.getMonth(),
    };
  });
}

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [runDays, setRunDays] = useState<Set<number>>(new Set());
  const [aiMessage, setAiMessage] = useState(
    '오늘 달리기 딱 좋은 날씨인데, 잠깐만 나가서 달리고 오는 건 어때?'
  );

  const today = new Date();
  const displayDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const fetchData = useCallback(async () => {
    try {
      const [sumData, actData] = await Promise.all([
        getStatisticsSummary(),
        getActivities({ page: 1, page_size: 50 }),
      ]);
      setSummary(sumData);

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

  /** RUN 버튼 누르면 액티브 런 화면으로 이동 */
  const handleRunPress = () => {
    router.push('/(tabs)/run/active');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 날짜 헤더 */}
        <Text style={[styles.dateText, { color: theme.text }]}>
          {displayDate}
        </Text>

        {/* 주간 스트릭 캘린더 */}
        <View style={[styles.weekCalendar, { backgroundColor: theme.background }]}>
          {/* 요일 라벨 행 */}
          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <View key={day.label} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: theme.textTertiary }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          {/* 날짜 원형 행 */}
          <View style={styles.weekRow}>
            {weekDays.map((day) => {
              let bgColor = '#E5E5E5';
              let textColor = '#737373';

              if (day.hasRun) {
                bgColor = BrandOrange;
                textColor = '#FFFFFF';
              }
              if (day.isToday && !day.hasRun) {
                bgColor = '#1A1A1A';
                textColor = '#FFFFFF';
              }

              return (
                <View key={day.date} style={styles.dayColumn}>
                  <View style={[styles.dateBadge, { backgroundColor: bgColor }]}>
                    <Text style={[styles.dateNumber, { color: textColor }]}>
                      {day.date}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 거리 표시 */}
        <View style={styles.distanceSection}>
          <Text style={styles.distanceValue}>
            {summary ? summary.total_distance_km.toFixed(1) : '0'}
          </Text>
          <Text style={[styles.distanceUnit, { color: theme.text }]}>km</Text>
        </View>

        {/* 타이머 표시 */}
        <Text style={[styles.timerText, { color: theme.text }]}>
          {summary?.total_duration_display ?? '00:00:00'}
        </Text>

        {/* 페이스 & 심박수 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {summary?.average_pace_display ?? '-'}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              평균 페이스
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.heartRateRow}>
              <Text style={styles.heartIcon}>♡</Text>
            </View>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              심박수 bpm
            </Text>
          </View>
        </View>

        {/* AI 페이스메이커 카드 */}
        <AIPacemakerCard message={aiMessage} style={styles.aiCard} />

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
              <Text style={styles.runButtonText}>RUN</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  /* 날짜 헤더 */
  dateText: {
    fontSize: 28,
    fontFamily: F.inter700,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  /* 주간 스트릭 캘린더 */
  weekCalendar: {
    borderRadius: 16,
    marginBottom: 32,
    paddingVertical: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontFamily: F.inter500,
    marginBottom: 8,
  },
  dateBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumber: {
    fontSize: 15,
    fontFamily: F.inter600,
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
  },
  heartIcon: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FF4D6A',
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
    color: '#FFFFFF',
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
