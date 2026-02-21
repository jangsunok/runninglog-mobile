import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  Medal as MedalIcon,
  Lock,
  ChevronDown,
  ChevronRight,
  Star,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { BrandOrange, Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAchievementsHistory, getAchievements } from '@/lib/api/achievements';
import type { Achievement, AchievementHistoryItem, MedalType } from '@/types/api';

// ─── 목 데이터 (개발용, 나중에 제거) ───────────────────────────
const MOCK_HISTORY: AchievementHistoryItem[] = [
  { year: 2026, month: 1, gold_count: 2, silver_count: 1, total_records: 3 },
  { year: 2025, month: 12, gold_count: 1, silver_count: 2, total_records: 1 },
  { year: 2025, month: 11, gold_count: 3, silver_count: 1, total_records: 2 },
  { year: 2025, month: 10, gold_count: 0, silver_count: 2, total_records: 0 },
  { year: 2025, month: 9, gold_count: 1, silver_count: 0, total_records: 1 },
];

const MOCK_ACHIEVEMENTS: Record<string, Achievement[]> = {
  '2026-1': [
    { id: 101, distance_type: '5K', distance_type_display: '5K', best_time: '00:22:15', best_time_display: '22분 15초', medal_type: 'GOLD', is_personal_record: true, activity: 1, created_at: '2026-01-08T07:30:00Z' },
    { id: 102, distance_type: '10K', distance_type_display: '10K', best_time: '00:48:30', best_time_display: '48분 30초', medal_type: 'GOLD', is_personal_record: true, activity: 2, created_at: '2026-01-15T08:00:00Z' },
    { id: 103, distance_type: 'HALF', distance_type_display: 'HALF', best_time: '01:52:10', best_time_display: '1시간 52분', medal_type: 'SILVER', is_personal_record: true, activity: 3, created_at: '2026-01-22T06:30:00Z' },
  ],
  '2025-12': [
    { id: 201, distance_type: '5K', distance_type_display: '5K', best_time: '00:23:40', best_time_display: '23분 40초', medal_type: 'GOLD', is_personal_record: false, activity: 4, created_at: '2025-12-05T07:00:00Z' },
    { id: 202, distance_type: '10K', distance_type_display: '10K', best_time: '00:51:20', best_time_display: '51분 20초', medal_type: 'SILVER', is_personal_record: false, activity: 5, created_at: '2025-12-12T08:30:00Z' },
    { id: 203, distance_type: 'HALF', distance_type_display: 'HALF', best_time: '01:58:45', best_time_display: '1시간 58분', medal_type: 'SILVER', is_personal_record: true, activity: 6, created_at: '2025-12-20T06:00:00Z' },
  ],
  '2025-11': [
    { id: 301, distance_type: '5K', distance_type_display: '5K', best_time: '00:21:50', best_time_display: '21분 50초', medal_type: 'GOLD', is_personal_record: true, activity: 7, created_at: '2025-11-03T07:15:00Z' },
    { id: 302, distance_type: '10K', distance_type_display: '10K', best_time: '00:46:10', best_time_display: '46분 10초', medal_type: 'GOLD', is_personal_record: true, activity: 8, created_at: '2025-11-10T08:00:00Z' },
    { id: 303, distance_type: 'HALF', distance_type_display: 'HALF', best_time: '01:55:30', best_time_display: '1시간 55분', medal_type: 'SILVER', is_personal_record: false, activity: 9, created_at: '2025-11-17T06:30:00Z' },
    { id: 304, distance_type: 'FULL', distance_type_display: 'FULL', best_time: '04:12:00', best_time_display: '4시간 12분', medal_type: 'GOLD', is_personal_record: false, activity: 10, created_at: '2025-11-24T05:30:00Z' },
  ],
  '2025-10': [
    { id: 401, distance_type: '5K', distance_type_display: '5K', best_time: '00:25:10', best_time_display: '25분 10초', medal_type: 'SILVER', is_personal_record: false, activity: 11, created_at: '2025-10-07T07:00:00Z' },
    { id: 402, distance_type: '10K', distance_type_display: '10K', best_time: '00:53:45', best_time_display: '53분 45초', medal_type: 'SILVER', is_personal_record: false, activity: 12, created_at: '2025-10-21T08:00:00Z' },
  ],
  '2025-9': [
    { id: 501, distance_type: '5K', distance_type_display: '5K', best_time: '00:24:00', best_time_display: '24분 00초', medal_type: 'GOLD', is_personal_record: true, activity: 13, created_at: '2025-09-14T07:30:00Z' },
  ],
};

const USE_MOCK = __DEV__; // 개발 환경에서만 목 데이터 사용

export default function AchievementHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<AchievementHistoryItem[]>([]);
  const [expandedMonth, setExpandedMonth] = useState<{ year: number; month: number } | null>(null);
  const [monthAchievements, setMonthAchievements] = useState<Achievement[]>([]);
  const [monthLoading, setMonthLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAchievementsHistory();
        const data = res.history.length > 0 ? res.history : USE_MOCK ? MOCK_HISTORY : [];
        setHistory(data);
      } catch {
        if (USE_MOCK) {
          setHistory(MOCK_HISTORY);
        } else {
          Toast.show({ type: 'error', text1: '지난 업적을 불러오지 못했어요.' });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleMonth = useCallback(async (year: number, month: number) => {
    if (expandedMonth?.year === year && expandedMonth?.month === month) {
      setExpandedMonth(null);
      return;
    }
    setExpandedMonth({ year, month });
    setMonthLoading(true);
    try {
      const res = await getAchievements(year, month);
      const data = res.achievements.length > 0 ? res.achievements : USE_MOCK ? (MOCK_ACHIEVEMENTS[`${year}-${month}`] ?? []) : [];
      setMonthAchievements(data);
    } catch {
      if (USE_MOCK) {
        setMonthAchievements(MOCK_ACHIEVEMENTS[`${year}-${month}`] ?? []);
      } else {
        Toast.show({ type: 'error', text1: '업적 상세를 불러오지 못했어요.' });
      }
    } finally {
      setMonthLoading(false);
    }
  }, [expandedMonth]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={BrandOrange} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>지난 업적</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              아직 지난 업적이 없어요.{'\n'}이번 달 첫 업적을 달성해 보세요!
            </Text>
          </View>
        ) : (
          history.map((item) => {
            const isExpanded = expandedMonth?.year === item.year && expandedMonth?.month === item.month;
            const totalMedals = item.gold_count + item.silver_count;

            return (
              <View key={`${item.year}-${item.month}`}>
                <TouchableOpacity
                  style={[
                    styles.monthCard,
                    {
                      backgroundColor: isDark ? theme.surface : '#FFFFFF',
                      borderColor: isExpanded ? BrandOrange + '40' : theme.border,
                    },
                  ]}
                  onPress={() => handleToggleMonth(item.year, item.month)}
                  activeOpacity={0.7}
                >
                  <View style={styles.monthCardLeft}>
                    {/* 월 표시 */}
                    <View style={[styles.monthBadge, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]}>
                      <Text style={[styles.monthBadgeMonth, { color: theme.text }]}>{item.month}월</Text>
                      <Text style={[styles.monthBadgeYear, { color: theme.textSecondary }]}>{item.year}</Text>
                    </View>

                    <View style={styles.monthCardInfo}>
                      <View style={styles.monthCardStats}>
                        {item.gold_count > 0 && (
                          <View style={styles.statChip}>
                            <Trophy size={12} color="#FFD700" />
                            <Text style={[styles.statChipText, { color: theme.textSecondary }]}>
                              금 {item.gold_count}
                            </Text>
                          </View>
                        )}
                        {item.silver_count > 0 && (
                          <View style={styles.statChip}>
                            <MedalIcon size={12} color="#C0C0C0" />
                            <Text style={[styles.statChipText, { color: theme.textSecondary }]}>
                              은 {item.silver_count}
                            </Text>
                          </View>
                        )}
                        {item.total_records > 0 && (
                          <View style={styles.statChip}>
                            <Star size={12} color={BrandOrange} />
                            <Text style={[styles.statChipText, { color: theme.textSecondary }]}>
                              신기록 {item.total_records}
                            </Text>
                          </View>
                        )}
                        {totalMedals === 0 && (
                          <Text style={[styles.noMedalText, { color: theme.textTertiary }]}>
                            달성 업적 없음
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {isExpanded ? (
                    <ChevronDown size={20} color={theme.textSecondary} />
                  ) : (
                    <ChevronRight size={20} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>

                {/* 펼침 상세 */}
                {isExpanded && (
                  <View
                    style={[
                      styles.monthDetail,
                      {
                        backgroundColor: isDark ? theme.surface : '#FFFFFF',
                        borderColor: BrandOrange + '40',
                      },
                    ]}
                  >
                    {monthLoading ? (
                      <ActivityIndicator size="small" color={BrandOrange} style={{ marginVertical: 16 }} />
                    ) : monthAchievements.length === 0 ? (
                      <Text style={[styles.emptyDetailText, { color: theme.textSecondary }]}>
                        이 달의 업적이 없어요.
                      </Text>
                    ) : (
                      <View style={styles.detailGrid}>
                        {monthAchievements.map((a) => (
                          <AchievementDetailCard key={a.id} achievement={a} theme={theme} isDark={isDark} />
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ── 월별 상세 업적 카드 ──
function AchievementDetailCard({
  achievement,
  theme,
  isDark,
}: {
  achievement: Achievement;
  theme: (typeof Colors)['light'];
  isDark: boolean;
}) {
  const isGold = achievement.medal_type === 'GOLD';
  const iconColor = isGold ? '#FFD700' : '#C0C0C0';
  const circleBg = isGold ? 'rgba(255,215,0,0.12)' : 'rgba(192,192,192,0.12)';
  const borderColor = isGold ? 'rgba(255,215,0,0.25)' : 'rgba(192,192,192,0.2)';

  const dateStr = new Date(achievement.created_at).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });

  return (
    <View
      style={[
        styles.detailCard,
        {
          backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB',
          borderColor,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.detailIconCircle, { backgroundColor: circleBg }]}>
        <Trophy size={24} color={iconColor} />
        {achievement.is_personal_record && (
          <View style={styles.prBadge}>
            <Star size={8} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={[styles.detailLabel, { color: theme.text }]}>
        {achievement.distance_type_display}
      </Text>
      <Text style={[styles.detailTime, { color: BrandOrange }]}>
        {achievement.best_time_display}
      </Text>
      <Text style={[styles.detailDate, { color: theme.textSecondary }]}>
        {dateStr}
      </Text>
      {achievement.is_personal_record && (
        <View style={styles.prTag}>
          <Text style={styles.prTagText}>신기록</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 12 },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontFamily: F.inter700,
  },

  // ── 빈 상태 ──
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: F.inter500,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── 월별 카드 ──
  monthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  monthCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  monthBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBadgeMonth: {
    fontSize: 16,
    fontFamily: F.inter700,
  },
  monthBadgeYear: {
    fontSize: 10,
    fontFamily: F.inter400,
  },
  monthCardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  monthCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statChipText: {
    fontSize: 12,
    fontFamily: F.inter500,
  },
  noMedalText: {
    fontSize: 12,
    fontFamily: F.inter400,
  },

  // ── 펼침 상세 ──
  monthDetail: {
    marginTop: -6,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  emptyDetailText: {
    fontSize: 14,
    fontFamily: F.inter400,
    textAlign: 'center',
    paddingVertical: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // ── 상세 업적 카드 ──
  detailCard: {
    width: '47%',
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  detailIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  prBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: BrandOrange,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: F.inter700,
    marginBottom: 2,
  },
  detailTime: {
    fontSize: 13,
    fontFamily: F.inter600,
    marginBottom: 2,
  },
  detailDate: {
    fontSize: 10,
    fontFamily: F.inter400,
  },
  prTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(255,110,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  prTagText: {
    color: BrandOrange,
    fontSize: 9,
    fontFamily: F.inter700,
  },
});
