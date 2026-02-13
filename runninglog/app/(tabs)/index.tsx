import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BrandOrange, BrandOrangeLight, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ─── 목업 데이터 ────────────────────────────────────────────
/** 표시 날짜 */
const DISPLAY_DATE = '2025년 1월 17일';

/** 주간 캘린더 (월~일) */
const WEEK_DAYS = [
  { label: '월', date: 12, hasRun: true },
  { label: '화', date: 13, hasRun: true },
  { label: '수', date: 14, hasRun: false },
  { label: '목', date: 15, hasRun: false },
  { label: '금', date: 16, hasRun: false },
  { label: '토', date: 17, hasRun: true, isToday: true },
  { label: '일', date: 18, hasRun: false },
];

/** AI 페이스메이커 메시지 */
const AI_MESSAGE =
  '오늘 달리기 딱 좋은 날씨인데, 잠깐만 나가서 달리고 오는 건 어때?';

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
          {DISPLAY_DATE}
        </Text>

        {/* 주간 스트릭 캘린더 */}
        <View style={[styles.weekCalendar, { backgroundColor: theme.background }]}>
          {/* 요일 라벨 행 */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <View key={day.label} style={styles.dayColumn}>
                <Text style={[styles.dayLabel, { color: theme.textTertiary }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          {/* 날짜 원형 행 */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => {
              const hasRun = day.hasRun;
              const isToday = !!day.isToday;

              // 오늘이면서 달린 날: 오늘 스타일 우선 (today+run -> BrandOrange)
              // 디자인 명세: 17(today+run) -> 오렌지 표시
              let bgColor = '#E5E5E5';
              let textColor = '#737373';

              if (hasRun) {
                bgColor = BrandOrange;
                textColor = '#FFFFFF';
              }
              if (isToday && !hasRun) {
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
          <Text style={styles.distanceValue}>0</Text>
          <Text style={[styles.distanceUnit, { color: theme.text }]}>km</Text>
        </View>

        {/* 타이머 표시 */}
        <Text style={[styles.timerText, { color: theme.text }]}>
          00:00:00
        </Text>

        {/* 페이스 & 심박수 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>-</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              현재 페이스
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
        <View
          style={[
            styles.aiCard,
            { backgroundColor: theme.surface },
          ]}
        >
          <Text style={styles.aiMessage}>
            {AI_MESSAGE}
          </Text>
          <View style={styles.aiFooter}>
            <Text style={[styles.aiLabel, { color: theme.textSecondary }]}>
              당신의 페이스메이커
            </Text>
            <View style={styles.aiIconCircle}>
              <MaterialIcons name="smart-toy" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

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
    fontWeight: '700',
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
    fontWeight: '500',
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
    fontWeight: '600',
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
    fontWeight: '800',
    color: BrandOrange,
    letterSpacing: -2,
  },
  distanceUnit: {
    fontSize: 24,
    fontWeight: '500',
    marginLeft: 8,
  },

  /* 타이머 */
  timerText: {
    fontSize: 48,
    fontWeight: '700',
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
    fontWeight: '700',
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  aiMessage: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
    color: '#374151',
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  aiLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  aiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: -2,
  },

  /* FAB 하단 간격 */
  fabSpacer: {
    height: 80,
  },
});
