import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Bell,
  MapPin,
  Clock,
  Hash,
  Trophy,
  Medal as MedalIcon,
  Lock,
  Pencil,
  CheckCircle,
  ChevronRight,
  X,
  Sunrise,
  Flame,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { BrandOrange, Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentGoal, createGoal, updateGoal, deleteGoal } from '@/lib/api/goals';
import { getCurrentAchievements } from '@/lib/api/achievements';
import { getActivities } from '@/lib/api/activities';
import { AIPacemakerCard } from '@/components/ai-pacemaker-card';
import { useCoachingMessage } from '@/hooks/use-coaching-message';
import type { Goal, GoalType as ApiGoalType, Achievement, MedalType } from '@/types/api';
import type { ActivityListItem } from '@/types/activity';

// ─── 목표 유형 세그먼트 ────────────────────────────────────────
type GoalType = 'distance' | 'time' | 'count';

const GOAL_SEGMENTS: { key: GoalType; apiKey: ApiGoalType; icon: LucideIcon; label: string }[] = [
  { key: 'distance', apiKey: 'DISTANCE', icon: MapPin, label: '거리' },
  { key: 'time', apiKey: 'TIME', icon: Clock, label: '시간' },
  { key: 'count', apiKey: 'COUNT', icon: Hash, label: '횟수' },
];

const UNIT_MAP: Record<GoalType, string> = {
  distance: 'km',
  time: '시간',
  count: '회',
};

const PLACEHOLDER_MAP: Record<GoalType, string> = {
  distance: '목표 거리를 입력해주세요',
  time: '목표 시간을 입력해주세요',
  count: '목표 횟수를 입력해주세요',
};

const LABEL_MAP: Record<GoalType, string> = {
  distance: '목표 거리',
  time: '목표 시간',
  count: '목표 횟수',
};

const API_TO_LOCAL: Record<ApiGoalType, GoalType> = {
  DISTANCE: 'distance',
  TIME: 'time',
  COUNT: 'count',
};

// ─── 현재 월 표시 헬퍼 ─────────────────────────────────────────
function getCurrentMonthLabel(): string {
  const month = new Date().getMonth() + 1;
  return `${month}월의`;
}

// ─── 다양한 업적 정의 ──────────────────────────────────────────
interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  condition: string;
  tip: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'early_bird', name: '얼리버드', description: '이른 아침의 상쾌한 러닝을 즐기는 당신!', condition: '오전 7시 이전에 러닝을 시작하면 달성', tip: '알람을 맞춰놓고 아침 러닝에 도전해보세요.', icon: Sunrise, color: '#F59E0B', bgColor: 'rgba(245,158,11,0.15)' },
  { id: 'consistency', name: '꾸준러너', description: '꾸준함이 실력을 만듭니다.', condition: '이번 달 러닝 10회 이상 완료 시 달성', tip: '주 3회 이상 러닝하면 자연스럽게 달성돼요.', icon: Flame, color: '#EF4444', bgColor: 'rgba(239,68,68,0.15)' },
  { id: 'speed_star', name: '스피드스타', description: '빠른 페이스로 달리는 스피드의 아이콘!', condition: '평균 페이스 5분/km 이하로 러닝 시 달성', tip: '인터벌 훈련으로 속도를 끌어올려보세요.', icon: Zap, color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.15)' },
  { id: 'long_run', name: '장거리왕', description: '긴 거리를 달릴 수 있는 당신의 지구력!', condition: '10km 이상 거리를 완주하면 달성', tip: '매주 한 번 롱런 세션을 넣어보세요.', icon: Target, color: '#3B82F6', bgColor: 'rgba(59,130,246,0.15)' },
  { id: 'improver', name: '성장러너', description: '매번 더 나은 자신을 만들어가는 중!', condition: '직전 러닝보다 더 빠른 페이스로 달리면 달성', tip: '조금씩 페이스를 올려보세요. 성장이 보입니다.', icon: TrendingUp, color: '#10B981', bgColor: 'rgba(16,185,129,0.15)' },
  { id: 'marathoner', name: '마라토너', description: '풀코스 마라톤 거리를 한 달에 달성!', condition: '이번 달 누적 러닝 거리 42km 이상 달성', tip: '매주 10km씩 달리면 한 달에 달성할 수 있어요.', icon: Trophy, color: '#F97316', bgColor: 'rgba(249,115,22,0.15)' },
];

/** 활동 데이터 기반으로 다양한 업적 달성 여부 + 진행도 계산 */
function computeBadges(activities: ActivityListItem[]): { badge: BadgeDefinition; earned: boolean; progress: string }[] {
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const monthActivities = activities.filter((a) => {
    const d = new Date(a.started_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });

  const earlyBirdCount = monthActivities.filter((a) => new Date(a.started_at).getHours() < 7).length;
  const earlyBird = earlyBirdCount > 0;

  const runCount = monthActivities.length;
  const consistency = runCount >= 10;

  const speedStar = monthActivities.some((a) => {
    if (!a.average_pace) return false;
    const parts = a.average_pace.split(':').map(Number);
    if (parts.length < 2) return false;
    const totalMinutes = (parts[0] ?? 0) * 60 + (parts[1] ?? 0) + (parts[2] ?? 0) / 60;
    return totalMinutes > 0 && totalMinutes <= 5;
  });

  const longRunCount = monthActivities.filter((a) => a.distance_km >= 10).length;
  const longRun = longRunCount > 0;

  // 성장러너: 최근 2개 활동의 페이스 비교
  const sorted = [...monthActivities].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  const improver = sorted.length >= 2 && !!sorted[0].average_pace && !!sorted[1].average_pace && sorted[0].average_pace < sorted[1].average_pace;

  const totalKm = monthActivities.reduce((sum, a) => sum + a.distance_km, 0);
  const marathoner = totalKm >= 42;

  const results: boolean[] = [earlyBird, consistency, speedStar, longRun, improver, marathoner];
  const progresses: string[] = [
    earlyBird ? `${earlyBirdCount}회 달성` : '미달성',
    `${runCount}/10회`,
    speedStar ? '달성' : '미달성',
    longRun ? `${longRunCount}회 달성` : '미달성',
    improver ? '달성' : sorted.length < 2 ? '데이터 부족' : '미달성',
    `${Math.round(totalKm)}/${42}km`,
  ];

  return BADGE_DEFINITIONS.map((badge, i) => ({ badge, earned: results[i], progress: progresses[i] }));
}

// ═══════════════════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════════════════
export default function TrainingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [goal, setGoal] = useState<Goal | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalMode, setGoalModalMode] = useState<'create' | 'edit'>('create');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activitiesList, setActivitiesList] = useState<ActivityListItem[]>([]);

  const [selectedBadge, setSelectedBadge] = useState<{ badge: BadgeDefinition; earned: boolean; progress: string } | null>(null);

  const aiMessage = useCoachingMessage(activitiesList);
  const monthLabel = getCurrentMonthLabel();

  const fetchData = useCallback(async () => {
    try {
      const [goalData, achieveData, actData] = await Promise.all([
        getCurrentGoal(),
        getCurrentAchievements(),
        getActivities({ page: 1, page_size: 50 }),
      ]);
      setGoal(goalData);
      setAchievements(achieveData.achievements);
      setActivitiesList(actData.results);
    } catch {
      Toast.show({ type: 'error', text1: '데이터를 불러오지 못했어요.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  const hasGoal = goal !== null;
  const progressPercent = goal
    ? Math.round((goal.current_value / goal.target_value) * 100)
    : 0;

  const goalTypeLocal = goal ? API_TO_LOCAL[goal.goal_type] : 'distance';
  const goalUnit = UNIT_MAP[goalTypeLocal];
  const goalText = goal
    ? `${goal.target_value}${goalUnit.toUpperCase()} 달리기`
    : '';

  // 목표 설정/수정 콜백
  const handleGoalSubmit = async (type: GoalType, value: number) => {
    const seg = GOAL_SEGMENTS.find((s) => s.key === type);
    if (!seg) return;
    setModalVisible(false);
    try {
      if (goalModalMode === 'create') {
        const created = await createGoal({ goal_type: seg.apiKey, target_value: value });
        setGoal(created);
        Toast.show({ type: 'success', text1: '목표가 설정되었어요!' });
      } else {
        const updated = await updateGoal(goal!.id, { goal_type: seg.apiKey, target_value: value });
        setGoal(updated);
        Toast.show({ type: 'success', text1: '목표가 수정되었어요.' });
      }
    } catch {
      Toast.show({ type: 'error', text1: goalModalMode === 'create' ? '목표 설정에 실패했어요.' : '목표 수정에 실패했어요.' });
    }
  };

  const handleGoalDelete = async () => {
    if (!goal) return;
    Alert.alert('목표 삭제', '정말 이 목표를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(goal.id);
            setGoal(null);
            setModalVisible(false);
          } catch {
            Toast.show({ type: 'error', text1: '목표 삭제에 실패했어요.' });
          }
        },
      },
    ]);
  };

  // 트로피 케이스: 거리 기반 업적
  const trophyItems = (['5K', '10K', 'HALF', 'FULL'] as const).map((distType) => {
    const achieve = achievements.find((a) => a.distance_type === distType);
    return {
      id: distType,
      label: distType === 'HALF' ? 'HALF' : distType === 'FULL' ? 'FULL' : distType.toLowerCase(),
      medalType: (achieve?.medal_type ?? 'NONE') as MedalType,
      isNewRecord: achieve?.is_personal_record ?? false,
      time: achieve?.best_time_display ?? null,
      date: achieve
        ? new Date(achieve.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : null,
    };
  });

  // 다양한 업적 배지
  const badges = computeBadges(activitiesList);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={BrandOrange} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 상단 고정 헤더 */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>트레이닝</Text>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={BrandOrange}
          />
        }
      >
        {/* ── AI 코칭 카드 ── */}
        {aiMessage ? (
          <AIPacemakerCard
            message={aiMessage}
            style={{ marginHorizontal: 20, marginBottom: 16 }}
            theme={theme}
          />
        ) : null}

        {/* ── 목표 섹션 ── */}
        <View style={styles.goalSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {monthLabel} 목표
            </Text>
            {hasGoal && !goal!.is_achieved && (
              <TouchableOpacity
                onPress={() => {
                  setGoalModalMode('edit');
                  setModalVisible(true);
                }}
              >
                <Text style={[styles.editLink, { color: BrandOrange }]}>목표 수정</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasGoal ? (
            goal!.is_achieved ? (
              // 달성 상태
              <View
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: isDark ? theme.surface : '#F0FFF4',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.15)',
                  },
                ]}
              >
                <View style={styles.goalCardRow}>
                  <View style={styles.goalCardLeft}>
                    <View style={styles.goalAchievedRow}>
                      <View style={styles.achievedIconCircle}>
                        <CheckCircle size={18} color="#4CAF50" />
                      </View>
                      <Text style={styles.goalAchievedTitle}>목표를 달성했어요!</Text>
                    </View>
                    <Text style={[styles.goalValueText, { color: theme.textSecondary }]}>
                      {goal!.current_value}{goalUnit} / {goal!.target_value}{goalUnit}
                    </Text>
                  </View>
                  <View style={[styles.percentBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.percentText}>100%</Text>
                  </View>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: '100%', backgroundColor: '#4CAF50' },
                    ]}
                  />
                </View>
              </View>
            ) : (
              // 진행 중
              <View
                style={[
                  styles.goalCard,
                  { backgroundColor: isDark ? theme.surface : '#F5F5F5' },
                ]}
              >
                <View style={styles.goalCardRow}>
                  <View style={styles.goalCardLeft}>
                    <Text style={[styles.goalTitleText, { color: theme.text }]}>
                      {goalText}
                    </Text>
                    <View style={styles.goalValueRow}>
                      <Text style={[styles.goalCurrentValue, { color: BrandOrange }]}>{goal!.current_value}</Text>
                      <Text style={[styles.goalUnitText, { color: theme.textSecondary }]}>
                        {goalUnit}
                      </Text>
                      <Text style={[styles.goalTargetText, { color: theme.textTertiary }]}>
                        / {goal!.target_value}{goalUnit}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{progressPercent}%</Text>
                  </View>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#333333' : '#E5E5E5' }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.min(progressPercent, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            )
          ) : (
            <View
              style={[
                styles.goalCardEmpty,
                { backgroundColor: isDark ? theme.surface : '#F5F5F5' },
              ]}
            >
              <TouchableOpacity
                style={styles.setGoalButton}
                onPress={() => {
                  setGoalModalMode('create');
                  setModalVisible(true);
                }}
              >
                <Text style={styles.setGoalButtonText}>목표 설정하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 트로피 케이스 (거리 업적) ── */}
        <View style={styles.achievementSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {monthLabel} 업적
            </Text>
            <TouchableOpacity onPress={() => router.push('/training/history' as any)}>
              <Text style={[styles.editLink, { color: BrandOrange }]}>지난 업적</Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.achievementDesc,
              { color: theme.textSecondary },
            ]}
          >
            {'거리를 달성하면 메달이 활성화되며,\n해당 월의 최고 기록이 표시돼요.'}
          </Text>

          {/* 트로피 그리드 (2열) */}
          <View style={styles.trophyGrid}>
            {trophyItems.map((item) => (
              <TrophyCard key={item.id} item={item} theme={theme} isDark={isDark} />
            ))}
          </View>
        </View>

        {/* ── 다양한 업적 ── */}
        <View style={styles.badgeSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            이번 달 챌린지
          </Text>
          <View style={styles.badgeGrid}>
            {badges.map((item) => (
              <BadgeCard
                key={item.badge.id}
                badge={item.badge}
                earned={item.earned}
                progress={item.progress}
                theme={theme}
                isDark={isDark}
                onPress={() => setSelectedBadge(item)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── 목표 설정 모달 ── */}
      <GoalSettingModal
        visible={modalVisible}
        mode={goalModalMode}
        currentGoal={goal}
        onClose={() => setModalVisible(false)}
        onSubmit={handleGoalSubmit}
        onDelete={handleGoalDelete}
      />

      {/* ── 챌린지 상세 모달 ── */}
      <BadgeDetailModal
        data={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 트로피 카드 (거리 업적)
// ═══════════════════════════════════════════════════════════════
function TrophyCard({
  item,
  theme,
  isDark,
}: {
  item: {
    id: string;
    label: string;
    medalType: MedalType;
    isNewRecord: boolean;
    time: string | null;
    date: string | null;
  };
  theme: (typeof Colors)['light'];
  isDark: boolean;
}) {
  const isLocked = item.medalType === 'NONE';
  const isGold = item.medalType === 'GOLD';

  const iconColor = isGold ? '#FFD700' : isLocked ? '#9CA3AF' : '#C0C0C0';
  const circleBg = isGold
    ? isDark ? 'rgba(255,215,0,0.12)' : 'rgba(255,215,0,0.1)'
    : isLocked
    ? isDark ? 'rgba(107,114,128,0.12)' : 'rgba(107,114,128,0.06)'
    : isDark ? 'rgba(192,192,192,0.12)' : 'rgba(192,192,192,0.08)';
  const Icon = isLocked ? Lock : Trophy;
  const cardBorder = isGold
    ? isDark ? 'rgba(255,215,0,0.2)' : 'rgba(255,215,0,0.3)'
    : theme.border;

  return (
    <View
      style={[
        styles.trophyCard,
        {
          backgroundColor: theme.surface,
          borderColor: cardBorder,
          borderWidth: 1,
        },
      ]}
    >
      {item.isNewRecord && (
        <View style={[styles.newRecordBadgeAbsolute, { backgroundColor: isDark ? 'rgba(255,110,0,0.2)' : 'rgba(255,110,0,0.1)' }]}>
          <Text style={styles.newRecordBadgeText}>신기록</Text>
        </View>
      )}
      <View style={[styles.trophyIconCircle, { backgroundColor: circleBg }]}>
        <Icon size={28} color={iconColor} />
      </View>
      <Text style={[styles.trophyLabel, { color: isLocked ? theme.textTertiary : theme.text }]}>
        {item.label}
      </Text>
      {item.time ? (
        <Text style={[styles.trophyTime, { color: BrandOrange }]}>{item.time}</Text>
      ) : (
        <Text style={[styles.trophyTimeLocked, { color: theme.textTertiary }]}>기록 없음</Text>
      )}
      {item.date ? (
        <Text style={[styles.trophyDate, { color: theme.textTertiary }]}>{item.date}</Text>
      ) : null}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 배지 카드 (다양한 업적)
// ═══════════════════════════════════════════════════════════════
function BadgeCard({
  badge,
  earned,
  progress,
  theme,
  isDark,
  onPress,
}: {
  badge: BadgeDefinition;
  earned: boolean;
  progress: string;
  theme: (typeof Colors)['light'];
  isDark: boolean;
  onPress: () => void;
}) {
  const Icon = badge.icon;
  const opacity = earned ? 1 : 0.4;

  return (
    <TouchableOpacity style={[styles.badgeCard, { opacity }]} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.badgeIconCircle,
          {
            backgroundColor: earned ? badge.bgColor : isDark ? 'rgba(107,114,128,0.1)' : '#E5E7EB',
            borderColor: earned ? badge.color + '30' : theme.border,
            borderWidth: 1,
          },
        ]}
      >
        <Icon size={28} color={earned ? badge.color : '#9CA3AF'} />
        {earned && (
          <View style={styles.checkBadgeMini}>
            <CheckCircle size={12} color="#4CAF50" fill="#FFFFFF" />
          </View>
        )}
      </View>
      <Text style={[styles.badgeName, { color: theme.text }]} numberOfLines={1}>
        {badge.name}
      </Text>
      <Text style={[styles.badgeDesc, { color: earned ? badge.color : theme.textSecondary }]} numberOfLines={1}>
        {progress}
      </Text>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════
// 챌린지 상세 모달
// ═══════════════════════════════════════════════════════════════
function BadgeDetailModal({
  data,
  onClose,
}: {
  data: { badge: BadgeDefinition; earned: boolean; progress: string } | null;
  onClose: () => void;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  if (!data) return null;
  const { badge, earned, progress } = data;
  const Icon = badge.icon;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.bdOverlay} onPress={onClose}>
        <Pressable
          style={[styles.bdSheet, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 닫기 */}
          <TouchableOpacity onPress={onClose} style={styles.bdClose} hitSlop={12}>
            <X size={22} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* 뱃지 아이콘 (크게) */}
          <View
            style={[
              styles.bdIconCircle,
              {
                backgroundColor: earned ? badge.bgColor : isDark ? 'rgba(107,114,128,0.1)' : '#E5E7EB',
                borderColor: earned ? badge.color + '30' : theme.border,
                borderWidth: 2,
              },
            ]}
          >
            <Icon size={48} color={earned ? badge.color : '#9CA3AF'} />
            {earned && (
              <View style={styles.bdCheckBadge}>
                <CheckCircle size={20} color="#4CAF50" fill="#FFFFFF" />
              </View>
            )}
          </View>

          {/* 뱃지 이름 */}
          <Text style={[styles.bdName, { color: theme.text }]}>{badge.name}</Text>

          {/* 달성 상태 */}
          <View style={[styles.bdStatusBadge, { backgroundColor: earned ? 'rgba(76,175,80,0.12)' : isDark ? 'rgba(107,114,128,0.1)' : '#F3F4F6' }]}>
            <Text style={[styles.bdStatusText, { color: earned ? '#4CAF50' : theme.textTertiary }]}>
              {earned ? '달성 완료' : '미달성'} · {progress}
            </Text>
          </View>

          {/* 설명 */}
          <Text style={[styles.bdDescription, { color: theme.textSecondary }]}>
            {badge.description}
          </Text>

          {/* 구분선 */}
          <View style={[styles.bdDivider, { backgroundColor: theme.border }]} />

          {/* 달성 조건 */}
          <View style={styles.bdInfoRow}>
            <View style={[styles.bdInfoDot, { backgroundColor: badge.color }]} />
            <View style={styles.bdInfoContent}>
              <Text style={[styles.bdInfoLabel, { color: theme.textTertiary }]}>달성 조건</Text>
              <Text style={[styles.bdInfoValue, { color: theme.text }]}>{badge.condition}</Text>
            </View>
          </View>

          {/* 팁 */}
          <View style={styles.bdInfoRow}>
            <View style={[styles.bdInfoDot, { backgroundColor: BrandOrange }]} />
            <View style={styles.bdInfoContent}>
              <Text style={[styles.bdInfoLabel, { color: theme.textTertiary }]}>팁</Text>
              <Text style={[styles.bdInfoValue, { color: theme.text }]}>{badge.tip}</Text>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// 목표 설정 모달
// ═══════════════════════════════════════════════════════════════
function GoalSettingModal({
  visible,
  mode,
  currentGoal,
  onClose,
  onSubmit,
  onDelete,
}: {
  visible: boolean;
  mode: 'create' | 'edit';
  currentGoal: Goal | null;
  onClose: () => void;
  onSubmit: (type: GoalType, value: number) => void;
  onDelete: () => void;
}) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const bottomInset =
    insets.bottom ||
    (initialWindowMetrics?.insets?.bottom ?? (Platform.OS === 'android' ? 48 : 0));
  const [selectedType, setSelectedType] = useState<GoalType>('distance');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (visible && mode === 'edit' && currentGoal) {
      setSelectedType(API_TO_LOCAL[currentGoal.goal_type]);
      setInputValue(String(currentGoal.target_value));
    } else if (visible && mode === 'create') {
      setSelectedType('distance');
      setInputValue('');
    }
  }, [visible, mode, currentGoal]);

  const parsedValue = parseInt(inputValue, 10);
  const isValid = !!parsedValue && parsedValue > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(selectedType, parsedValue);
    setInputValue('');
    setSelectedType('distance');
  };

  const handleClose = () => {
    setInputValue('');
    setSelectedType('distance');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            {
              paddingBottom: 40 + bottomInset,
              backgroundColor: theme.background,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {mode === 'create' ? '이달의 목표 설정' : '목표 수정'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.segmentRow}>
            {GOAL_SEGMENTS.map((seg) => {
              const isActive = selectedType === seg.key;
              const SegIcon = seg.icon;
              return (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    styles.segmentButton,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    },
                    isActive && [
                      styles.segmentButtonActive,
                      {
                        backgroundColor: isDark ? '#FFFFFF' : '#1F2937',
                        borderColor: isDark ? '#FFFFFF' : '#1F2937',
                      },
                    ],
                  ]}
                  onPress={() => setSelectedType(seg.key)}
                >
                  <SegIcon
                    size={16}
                    color={
                      isActive
                        ? isDark ? '#111827' : '#FFFFFF'
                        : theme.textSecondary
                    }
                    style={styles.segmentIcon}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      { color: theme.textSecondary },
                      isActive && [
                        styles.segmentTextActive,
                        { color: isDark ? '#111827' : '#FFFFFF' },
                      ],
                    ]}
                  >
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.inputLabel, { color: theme.text }]}>
            {LABEL_MAP[selectedType]}
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                borderColor: theme.border,
                backgroundColor: isDark ? theme.surface : '#F5F5F5',
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={PLACEHOLDER_MAP[selectedType]}
              placeholderTextColor={theme.textTertiary}
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Text style={[styles.inputUnit, { color: theme.textSecondary }]}>
              {UNIT_MAP[selectedType]}
            </Text>
          </View>

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                {
                  borderColor: theme.border,
                  backgroundColor: isDark ? theme.surface : '#F5F5F5',
                },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                취소
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton, !isValid && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!isValid}
            >
              <Text style={styles.submitButtonText}>
                {mode === 'create' ? '설정하기' : '수정하기'}
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'edit' && (
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// 스타일
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { zIndex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 40 },

  // ── 헤더 ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: F.inter700,
  },

  // ── 섹션 ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: F.inter600,
  },
  editLink: {
    fontSize: 13,
    fontFamily: F.inter500,
  },

  // ── 목표 섹션 ──
  goalSection: {
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
  },
  goalCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalCardLeft: { flex: 1, marginRight: 12 },
  goalAchievedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  achievedIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(76,175,80,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalAchievedTitle: {
    fontSize: 15,
    fontFamily: F.inter600,
    color: '#4CAF50',
  },
  goalTitleText: {
    fontSize: 16,
    fontFamily: F.inter600,
    marginBottom: 6,
  },
  goalValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  goalCurrentValue: {
    fontSize: 24,
    fontFamily: F.mont700,
  },
  goalUnitText: {
    fontSize: 14,
    fontFamily: F.inter500,
    marginLeft: 2,
  },
  goalTargetText: {
    fontSize: 14,
    fontFamily: F.inter500,
    marginLeft: 4,
  },
  goalValueText: {
    fontSize: 14,
    fontFamily: F.inter500,
  },
  percentBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: F.inter700,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandOrange,
    borderRadius: 3,
  },
  goalCardEmpty: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  setGoalButton: {
    backgroundColor: BrandOrange,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: F.inter700,
  },

  // ── 트로피 케이스 ──
  achievementSection: {
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  achievementDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  trophyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trophyCard: {
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
  newRecordBadgeAbsolute: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  newRecordBadgeText: {
    color: BrandOrange,
    fontSize: 10,
    fontFamily: F.inter700,
  },
  trophyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  trophyLabel: {
    fontSize: 16,
    fontFamily: F.inter700,
    marginBottom: 4,
  },
  trophyTime: {
    fontSize: 14,
    fontFamily: F.inter600,
    marginBottom: 2,
  },
  trophyTimeLocked: {
    fontSize: 12,
    fontFamily: F.inter500,
  },
  trophyDate: {
    fontSize: 10,
    fontFamily: F.inter500,
  },

  // ── 다양한 업적 배지 ──
  badgeSection: {
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '30%',
    flexBasis: '30%',
    alignItems: 'center',
    gap: 6,
  },
  badgeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkBadgeMini: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: F.inter600,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 10,
    fontFamily: F.inter400,
    textAlign: 'center',
  },

  // ── 챌린지 상세 모달 ──
  bdOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 32,
  },
  bdSheet: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    position: 'relative',
  },
  bdClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 1,
  },
  bdIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
    position: 'relative',
  },
  bdCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  bdName: {
    fontSize: 22,
    fontFamily: F.inter700,
    marginBottom: 8,
  },
  bdStatusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  bdStatusText: {
    fontSize: 13,
    fontFamily: F.inter600,
  },
  bdDescription: {
    fontSize: 14,
    fontFamily: F.inter400,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  bdDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  bdInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 16,
    gap: 12,
  },
  bdInfoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  bdInfoContent: {
    flex: 1,
    gap: 2,
  },
  bdInfoLabel: {
    fontSize: 11,
    fontFamily: F.inter500,
  },
  bdInfoValue: {
    fontSize: 14,
    fontFamily: F.inter500,
    lineHeight: 20,
  },

  // ── 모달 ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: F.inter700,
  },
  closeButton: { padding: 4 },

  // ── 세그먼트 ──
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  segmentButtonActive: {},
  segmentIcon: { marginRight: 4 },
  segmentText: {
    fontSize: 14,
    fontFamily: F.inter600,
  },
  segmentTextActive: {},

  // ── 입력 ──
  inputLabel: {
    fontSize: 14,
    fontFamily: F.inter500,
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  inputUnit: {
    fontSize: 16,
    fontFamily: F.inter500,
    marginLeft: 8,
  },

  // ── 모달 버튼 ──
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: F.inter600,
  },
  submitButton: {
    backgroundColor: BrandOrange,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: F.inter700,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: F.inter600,
  },
});
