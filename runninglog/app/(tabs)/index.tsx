import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandOrange, Colors } from '@/constants/theme';
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
  { label: '일', date: 18, hasRun: true },
];

/** 누적 거리 (km) */
const TOTAL_DISTANCE = '5.23';

/** 타이머 표시 */
const TIMER_DISPLAY = '00:28:45';

/** 현재 페이스 */
const CURRENT_PACE = "5'29\"";

/** 심박수 */
const HEART_RATE = 156;

/** AI 페이스메이커 메시지 */
const AI_MESSAGE =
  '와, 이번주에는 주 5일이나 달리기를 진행했네! 너무 고생 많았어. 달린 후 회복을 위한 스트레칭도 잊지 말고 꼭 해줘. 내일도 행복한 러닝하자';

// ─── 컴포넌트 ────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 날짜 */}
        <Text style={[styles.dateText, { color: theme.text }]}>
          {DISPLAY_DATE}
        </Text>

        {/* 주간 캘린더 */}
        <View style={styles.weekCalendar}>
          {/* 요일 라벨 */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => (
              <View key={day.label} style={styles.dayColumn}>
                <Text
                  style={[
                    styles.dayLabel,
                    { color: isDark ? '#A3A3A3' : '#737373' },
                  ]}
                >
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
          {/* 날짜 숫자 */}
          <View style={styles.weekRow}>
            {WEEK_DAYS.map((day) => {
              const isActive = day.hasRun;
              const isToday = day.isToday;

              return (
                <View key={day.date} style={styles.dayColumn}>
                  <View
                    style={[
                      styles.dateBadge,
                      isActive && styles.dateBadgeActive,
                      isToday && styles.dateBadgeToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateNumber,
                        isActive && styles.dateNumberActive,
                        isToday && styles.dateNumberToday,
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

        {/* 누적 거리 */}
        <View style={styles.distanceSection}>
          <Text style={styles.distanceValue}>{TOTAL_DISTANCE}</Text>
          <Text style={[styles.distanceUnit, { color: theme.text }]}> km</Text>
        </View>

        {/* 타이머 */}
        <Text style={[styles.timerText, { color: theme.text }]}>
          {TIMER_DISPLAY}
        </Text>

        {/* 페이스 & 심박수 */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {CURRENT_PACE}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? '#A3A3A3' : '#737373' },
              ]}
            >
              현재 페이스
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.heartRateRow}>
              <Text style={styles.heartIcon}>♡</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {' '}
                {HEART_RATE}
              </Text>
            </View>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? '#A3A3A3' : '#737373' },
              ]}
            >
              심박수 bpm
            </Text>
          </View>
        </View>

        {/* AI 페이스메이커 카드 */}
        <View
          style={[
            styles.aiCard,
            {
              backgroundColor: isDark ? '#262626' : '#F5F5F5',
            },
          ]}
        >
          <Text
            style={[
              styles.aiMessage,
              { color: isDark ? '#D4D4D4' : '#404040' },
            ]}
          >
            {AI_MESSAGE}
          </Text>
          <View style={styles.aiFooter}>
            <Text
              style={[
                styles.aiLabel,
                { color: isDark ? '#A3A3A3' : '#737373' },
              ]}
            >
              당신의 페이스메이커
            </Text>
            <View
              style={[
                styles.aiIconCircle,
                { backgroundColor: BrandOrange },
              ]}
            >
              <MaterialIcons name="smart-toy" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* RUN 버튼 */}
        <View style={styles.runButtonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.runButton,
              pressed && styles.runButtonPressed,
            ]}
            onPress={handleRunPress}
          >
            <MaterialIcons
              name="directions-run"
              size={36}
              color="#FFFFFF"
            />
            <Text style={styles.runButtonText}>RUN</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// ─── 스타일 ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },

  /* 날짜 */
  dateText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },

  /* 주간 캘린더 */
  weekCalendar: {
    marginBottom: 32,
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
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E5E5',
  },
  dateBadgeActive: {
    backgroundColor: BrandOrange,
  },
  dateBadgeToday: {
    backgroundColor: '#1A1A1A',
  },
  dateNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#737373',
  },
  dateNumberActive: {
    color: '#FFFFFF',
  },
  dateNumberToday: {
    color: '#FFFFFF',
  },

  /* 누적 거리 */
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
    fontSize: 28,
    fontWeight: '600',
  },

  /* 타이머 */
  timerText: {
    fontSize: 42,
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
    fontSize: 26,
    fontWeight: '700',
  },
  heartRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 22,
    color: '#FF4D6A',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },

  /* AI 카드 */
  aiCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  aiMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* RUN 버튼 */
  runButtonContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  runButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
    /* 그림자 */
    shadowColor: BrandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  runButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  runButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
});
