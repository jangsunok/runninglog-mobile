import Toast from 'react-native-toast-message';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandOrange, BrandOrangeLight, Colors, C, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getActivities } from '@/lib/api/activities';
import {
  getStatisticsDaily,
  getStatisticsMonthly,
  getStatisticsWeekly,
  getStatisticsYearly,
} from '@/lib/api/statistics';
import type { ActivityListItem, StatisticsPeriodItem } from '@/types/activity';

// ─────────────────────────────────────────────
// 뷰 모드 타입
// ─────────────────────────────────────────────
type ViewMode = 'weekly' | 'monthly' | 'yearly';

/** 연간 뷰 미니 캘린더 배경 (theme surface보다 밝음) */
const COLOR_SURFACE_SUBTLE = '#f9fafb';

// ─────────────────────────────────────────────
// 유틸: 날짜 계산 도우미
// ─────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 해당 월 1일의 요일 (0=일요일) — 일요일 시작 캘린더 */
function getFirstDayOfMonthMon(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay(); // 0=일요일
  return day; // 0=일요일 (그대로 반환)
}

/** 달린 날인지 확인 — runDates 맵 기반 */
function isRunDayCheck(
  runDatesMap: Record<string, number[]>,
  year: number,
  month: number,
  day: number
): boolean {
  const key = `${year}-${month}`;
  return runDatesMap[key]?.includes(day) ?? false;
}

/** 오늘 날짜 판별 */
function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day;
}

/** 주어진 날짜가 포함된 주의 일요일 구하기 */
function getWeekSunday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  const diff = -day; // 일요일까지의 차이 (일요일이면 0, 월요일이면 -1, ..., 토요일이면 -6)
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 해당 날짜가 그 달의 몇 주차인지 (일요일 시작) */
function getWeekOfMonth(date: Date): number {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstSunday = getWeekSunday(firstOfMonth);
  if (firstSunday.getMonth() < firstOfMonth.getMonth() || firstSunday.getFullYear() < firstOfMonth.getFullYear()) {
    firstSunday.setDate(firstSunday.getDate() + 7);
  }
  const sunday = getWeekSunday(date);
  const weekNum = Math.floor((sunday.getTime() - firstSunday.getTime()) / (7 * 86400000)) + 1;
  return Math.max(1, weekNum);
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

// 일요일 시작 (월간), 월요일 시작 (주간)
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_LABELS_MON = ['월', '화', '수', '목', '금', '토', '일'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

/** 기록 이동 가능 범위: 2025-01-01 ~ 오늘(미래 불가) */
const MIN_YEAR = 2025;
const MIN_DATE = new Date(MIN_YEAR, 0, 1);

/** YYYY-MM-DD */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** 현재 뷰 모드·기간에 해당하는 from/to (YYYY-MM-DD) */
function getPeriodRange(
  viewMode: ViewMode,
  weekSunday: Date,
  currentYear: number,
  currentMonth: number
): { from: string; to: string } {
  if (viewMode === 'weekly') {
    // 주간 통계는 백엔드 기준으로 "월요일 시작 ~ 일요일 종료" 주간을 사용한다.
    // UI에서는 weekSunday(일요일)를 기준으로 표시하지만,
    // 실제 from/to는 weekSunday 다음 날인 월요일부터 7일 범위로 맞춘다.
    const monday = new Date(weekSunday);
    monday.setDate(monday.getDate() + 1);
    const from = new Date(monday);
    const to = new Date(monday);
    to.setDate(to.getDate() + 6);
    return { from: toISODate(from), to: toISODate(to) };
  }
  if (viewMode === 'monthly') {
    const from = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDay = getDaysInMonth(currentYear, currentMonth);
    const to = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { from, to };
  }
  return { from: `${currentYear}-01-01`, to: `${currentYear}-12-31` };
}

/** 주별 통계에서 해당 주(일요일 기준)와 일치하는 항목 찾기. 백엔드는 월요일 시작 주. */
function findWeeklyPeriod(
  list: StatisticsPeriodItem[],
  weekSunday: Date
): StatisticsPeriodItem | null {
  const mon = new Date(weekSunday);
  mon.setDate(mon.getDate() + 1);
  const monStr = toISODate(mon);
  return list.find((p) => p.period_start === monStr) ?? null;
}

/** 월별 통계에서 해당 월과 일치하는 항목 찾기 */
function findMonthlyPeriod(
  list: StatisticsPeriodItem[],
  year: number,
  month: number
): StatisticsPeriodItem | null {
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  return list.find((p) => p.period_start === first) ?? null;
}

/** 연별 통계에서 해당 연도와 일치하는 항목 찾기 */
function findYearlyPeriod(
  list: StatisticsPeriodItem[],
  year: number
): StatisticsPeriodItem | null {
  const first = `${year}-01-01`;
  return list.find((p) => p.period_start === first) ?? null;
}

/** 일별 통계로 runDates 맵 생성 (key: "year-month", value: 날짜 배열) */
function runDatesFromDaily(daily: StatisticsPeriodItem[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};
  for (const p of daily) {
    const d = p.period_start;
    const [y, m, day] = d.split('-').map(Number);
    const key = `${y}-${m}`;
    if (!map[key]) map[key] = [];
    if (!map[key].includes(day)) map[key].push(day);
  }
  return map;
}

// ═════════════════════════════════════════════
// 메인 컴포넌트
// ═════════════════════════════════════════════
export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [weekSunday, setWeekSunday] = useState(() => getWeekSunday(now));

  // API 데이터: 기간별 전체기록 요약·상세기록·캘린더 점
  const [periodSummary, setPeriodSummary] = useState<StatisticsPeriodItem | null>(null);
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [runDates, setRunDates] = useState<Record<string, number[]>>({});
  const [monthlyStatsArr, setMonthlyStatsArr] = useState<StatisticsPeriodItem[]>([]);
  const [periodLoading, setPeriodLoading] = useState(true);

  const isViewingCurrentMonth =
    currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;

  // 주간/월간/연간 달력 이동 시 해당 기간 전체기록·상세기록·캘린더 점 다시 불러오기
  const { from: periodFrom, to: periodTo } = useMemo(
    () => getPeriodRange(viewMode, weekSunday, currentYear, currentMonth),
    [viewMode, weekSunday, currentYear, currentMonth]
  );

  useEffect(() => {
    let cancelled = false;
    setPeriodLoading(true);
    (async () => {
      try {
        const [periodStats, dailyStats, actData, monthlyData] = await Promise.all([
          viewMode === 'weekly'
            ? getStatisticsWeekly(currentYear)
            : viewMode === 'monthly'
              ? getStatisticsMonthly(currentYear)
              : getStatisticsYearly(),
          getStatisticsDaily(periodFrom, periodTo),
          getActivities({ from: periodFrom, to: periodTo, page: 1, page_size: 100 }),
          viewMode === 'yearly' ? getStatisticsMonthly(currentYear) : Promise.resolve([] as StatisticsPeriodItem[]),
        ]);
        if (cancelled) return;
        const matched =
          viewMode === 'weekly'
            ? findWeeklyPeriod(periodStats, weekSunday)
            : viewMode === 'monthly'
              ? findMonthlyPeriod(periodStats, currentYear, currentMonth)
              : findYearlyPeriod(periodStats, currentYear);
        setPeriodSummary(matched ?? null);
        setRunDates(runDatesFromDaily(dailyStats));
        setMonthlyStatsArr(monthlyData);
        setActivities(actData.results);
      } catch {
        if (!cancelled) Toast.show({ type: 'error', text1: '기록을 불러오지 못했어요.' });
      } finally {
        if (!cancelled) setPeriodLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [viewMode, weekSunday, currentYear, currentMonth, periodFrom, periodTo]);

  // 월 네비게이션
  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  // 주간 네비게이션
  const goToPrevWeek = useCallback(() => {
    setWeekSunday((s) => {
      const d = new Date(s);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekSunday((s) => {
      const d = new Date(s);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  // 연간 네비게이션
  const goToPrevYear = useCallback(() => setCurrentYear((y) => y - 1), []);
  const goToNextYear = useCallback(() => setCurrentYear((y) => y + 1), []);

  // 이동 가능 범위: 2025년 ~ 오늘 (미래·2025 이전 불가), 모드별 이전/다음 가능 여부
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const minWeekSunday = useMemo(() => getWeekSunday(MIN_DATE), []);

  const navBounds = useMemo(() => {
    const prevWeekSunday = new Date(weekSunday);
    prevWeekSunday.setDate(prevWeekSunday.getDate() - 7);
    const nextWeekSunday = new Date(weekSunday);
    nextWeekSunday.setDate(nextWeekSunday.getDate() + 7);
    const thisWeekSunday = getWeekSunday(now);

    return {
      weekly: {
        canGoPrev: prevWeekSunday.getTime() >= minWeekSunday.getTime(),
        canGoNext: nextWeekSunday.getTime() <= thisWeekSunday.getTime(),
      },
      monthly: {
        canGoPrev: currentYear > MIN_YEAR || (currentYear === MIN_YEAR && currentMonth > 1),
        canGoNext: currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth),
      },
      yearly: {
        canGoPrev: currentYear > MIN_YEAR,
        canGoNext: currentYear < todayYear,
      },
    };
  }, [weekSunday, currentYear, currentMonth, todayYear, todayMonth, minWeekSunday, now]);

  // 주간 뷰 데이터 (월-일 순)
  const weekDays = useMemo(() => {
    const days: { day: number; month: number; year: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(weekSunday);
      d.setDate(d.getDate() + i);
      days.push({ day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() });
    }
    return days;
  }, [weekSunday]);

  const weekLabel = useMemo(() => {
    const wom = getWeekOfMonth(weekSunday);
    return `${weekSunday.getFullYear()}년 ${weekSunday.getMonth() + 1}월 ${wom}주차`;
  }, [weekSunday]);

  // 월간 캘린더 그리드 데이터 (일요일 시작)
  const monthGrid = useMemo(() => {
    const firstDay = getFirstDayOfMonthMon(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const prevDays = getDaysInMonth(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 12 : currentMonth - 1
    );
    const rows: { day: number; isCurrentMonth: boolean }[][] = [];
    let currentRow: { day: number; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      currentRow.push({ day: prevDays - firstDay + 1 + i, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      currentRow.push({ day: d, isCurrentMonth: true });
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    if (currentRow.length > 0) {
      let nextDay = 1;
      while (currentRow.length < 7) {
        currentRow.push({ day: nextDay++, isCurrentMonth: false });
      }
      rows.push(currentRow);
    }

    while (rows.length < 6) {
      const lastRow = rows[rows.length - 1];
      const lastDayInLastRow = lastRow[lastRow.length - 1];
      const startDay = lastDayInLastRow.isCurrentMonth ? 1 : lastDayInLastRow.day + 1;
      const newRow: { day: number; isCurrentMonth: boolean }[] = [];
      for (let i = 0; i < 7; i++) {
        newRow.push({ day: startDay + i, isCurrentMonth: false });
      }
      rows.push(newRow);
    }

    return rows;
  }, [currentYear, currentMonth]);

  // 연간 뷰: 12개월 미니 그리드 데이터
  const yearGrids = useMemo(() => {
    return Array.from({ length: 12 }, (_, mi) => {
      const month = mi + 1;
      const firstDay = getFirstDayOfMonthMon(currentYear, month);
      const daysInMonth = getDaysInMonth(currentYear, month);
      const weeks: (number | null)[][] = [];
      let row: (number | null)[] = Array(firstDay).fill(null);

      for (let d = 1; d <= daysInMonth; d++) {
        row.push(d);
        if (row.length === 7) {
          weeks.push(row);
          row = [];
        }
      }
      if (row.length > 0) {
        while (row.length < 7) row.push(null);
        weeks.push(row);
      }
      while (weeks.length < 6) {
        weeks.push(Array(7).fill(null));
      }

      return { month, weeks };
    });
  }, [currentYear]);

  // 테마별 동적 스타일 (다크/라이트 대비·가독성)
  const themeStyles = useMemo(
    () => ({
      container: { backgroundColor: theme.background },
      headerTitle: { color: theme.text },
      calendarCard: { backgroundColor: theme.background },
      segmentContainer: { backgroundColor: theme.surface },
      segmentButtonActive: {
        backgroundColor: isDark ? BrandOrange : '#FFFFFF',
      },
      segmentTextActive: {
        color: isDark ? '#FFFFFF' : BrandOrange,
        fontFamily: F.inter600,
      },
      segmentTextInactive: { color: theme.textTertiary },
      navLabel: { color: theme.text },
      weekdayText: { color: theme.textTertiary },
      dayBadgeEmpty: { backgroundColor: theme.lightGray },
      dayTextCurrent: { color: theme.text },
      dayTextOutside: { color: theme.textTertiary },
      summaryLabel: { color: theme.text },
      summaryAnalyzeButton: {
        backgroundColor: isDark ? theme.surface : '#F9FAFB',
        borderColor: theme.border,
      },
      summaryAnalyzeBtnText: { color: theme.textSecondary },
      bigDistanceLabel: { color: theme.textSecondary },
      bigDistanceUnit: { color: theme.text },
      statsCard: { backgroundColor: theme.lightGray },
      statValue: { color: theme.text },
      statLabel: { color: theme.textSecondary },
      detailTitle: { color: theme.text },
      recordMain: { color: theme.text },
      recordDate: { color: theme.textSecondary },
      recordDivider: { backgroundColor: theme.border },
      // 목표·업적 섹션 (라이트/다크)
      goalSectionTitle: { color: theme.text },
      goalCardEmptyBg: { backgroundColor: theme.surface },
      goalEmptyLine1: { color: theme.text },
      goalEmptyLine2: { color: theme.textSecondary },
      achievementSectionTitle: { color: theme.text },
      achievementDesc: { color: theme.textSecondary },
      pastButtonBg: {
        backgroundColor: isDark ? theme.surface : '#F9FAFB',
        borderColor: theme.border,
      },
      pastButtonText: { color: theme.textSecondary },
    }),
    [theme, isDark]
  );

  // ─────────────────────────────────────────
  // 세그먼트 컨트롤 (pen: pill 스타일)
  // ─────────────────────────────────────────
  const renderSegmentControl = () => (
    <View style={[styles.segmentContainer, themeStyles.segmentContainer]}>
      {([
        { key: 'weekly' as ViewMode, label: '주간' },
        { key: 'monthly' as ViewMode, label: '월간' },
        { key: 'yearly' as ViewMode, label: '연간' },
      ]).map(({ key, label }) => {
        const isActive = viewMode === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.segmentButton,
              isActive && [styles.segmentButtonActive, themeStyles.segmentButtonActive],
            ]}
            onPress={() => setViewMode(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                isActive ? themeStyles.segmentTextActive : themeStyles.segmentTextInactive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─────────────────────────────────────────
  // 네비게이션 (모드별 분기, 2025~오늘 범위 외 이동 불가 시 화살표 비노출)
  // ─────────────────────────────────────────
  const renderNavigation = () => {
    let label = '';
    let onPrev: () => void;
    let onNext: () => void;
    const bounds = navBounds[viewMode];

    if (viewMode === 'weekly') {
      label = weekLabel;
      onPrev = goToPrevWeek;
      onNext = goToNextWeek;
    } else if (viewMode === 'yearly') {
      label = `${currentYear}년`;
      onPrev = goToPrevYear;
      onNext = goToNextYear;
    } else {
      label = `${currentYear}년 ${currentMonth}월`;
      onPrev = goToPrevMonth;
      onNext = goToNextMonth;
    }

    const navButtonSize = 40;
    return (
      <View style={styles.navigationRow}>
        {bounds.canGoPrev ? (
          <TouchableOpacity
            onPress={onPrev}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ width: navButtonSize, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-back" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: navButtonSize }} />
        )}
        <Text style={[styles.navLabel, themeStyles.navLabel]}>{label}</Text>
        {bounds.canGoNext ? (
          <TouchableOpacity
            onPress={onNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ width: navButtonSize, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: navButtonSize }} />
        )}
      </View>
    );
  };

  // ─────────────────────────────────────────
  // 요일 헤더
  // ─────────────────────────────────────────
  const renderWeekdayHeader = () => (
    <View style={styles.weekdayRow}>
      {WEEKDAY_LABELS.map((label) => (
        <View key={label} style={styles.weekdayCell}>
          <Text style={[styles.weekdayText, themeStyles.weekdayText]}>{label}</Text>
        </View>
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 날짜 셀 (pen: rounded square cornerRadius 12)
  // ─────────────────────────────────────────
  const renderDayCell = (
    day: number,
    isCurrentMonth: boolean,
    rowIndex: number,
    colIndex: number
  ) => {
    const hasRun = isCurrentMonth && isRunDayCheck(runDates,currentYear, currentMonth, day);
    const todayFlag = isCurrentMonth && isToday(currentYear, currentMonth, day);

    return (
      <View key={`${rowIndex}-${colIndex}`} style={styles.dayCell}>
        <View
          style={[
            styles.dayBadge,
            hasRun && styles.dayBadgeRun,
            !hasRun && isCurrentMonth && !todayFlag && [styles.dayBadgeEmpty, themeStyles.dayBadgeEmpty],
            todayFlag && !hasRun && styles.dayBadgeToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && themeStyles.dayTextOutside,
              isCurrentMonth && themeStyles.dayTextCurrent,
              hasRun && styles.dayTextRun,
              todayFlag && !hasRun && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────
  // 주간 뷰 (월-일 스트립, 원형 뱃지)
  // ─────────────────────────────────────────
  const renderWeeklyView = () => (
    <View style={styles.weekStrip}>
      {weekDays.map((wd, i) => {
        const hasRun = isRunDayCheck(runDates, wd.year, wd.month, wd.day);
        const todayFlag = isToday(wd.year, wd.month, wd.day);
        const isSun = i === 6;
        const isSat = i === 5;
        return (
          <View key={i} style={styles.weekStripCell}>
            <Text style={[
              styles.weekStripLabel,
              { color: isSun ? '#EF4444' : isSat ? `${BrandOrange}B3` : theme.textTertiary },
            ]}>
              {WEEKDAY_LABELS_MON[i]}
            </Text>
            <View style={[
              styles.weekStripBadge,
              hasRun && styles.weekStripBadgeRun,
              todayFlag && !hasRun && styles.weekStripBadgeToday,
            ]}>
              <Text style={[
                styles.weekStripDayText,
                { color: hasRun ? '#FFFFFF' : todayFlag ? BrandOrange : theme.text },
                (hasRun || todayFlag) && { fontFamily: F.inter700 },
              ]}>
                {wd.day}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  // ─────────────────────────────────────────
  // 월간 뷰 (surface 카드 + 원형 뱃지)
  // ─────────────────────────────────────────
  const renderMonthlyView = () => (
    <View style={[styles.monthCalCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
      {/* 요일 헤더 */}
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={[styles.weekdayText, { color: i === 0 ? 'rgba(239,68,68,0.8)' : theme.textTertiary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      {/* 날짜 그리드 */}
      {monthGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map((cell, colIndex) => {
            const hasRun = cell.isCurrentMonth && isRunDayCheck(runDates, currentYear, currentMonth, cell.day);
            const todayFlag = cell.isCurrentMonth && isToday(currentYear, currentMonth, cell.day);
            return (
              <View key={`${rowIndex}-${colIndex}`} style={styles.monthDayCell}>
                {hasRun ? (
                  <View style={styles.monthDayBadgeRun}>
                    <Text style={styles.monthDayTextRun}>{cell.day}</Text>
                  </View>
                ) : todayFlag ? (
                  <View style={styles.monthDayBadgeToday}>
                    <Text style={styles.monthDayTextToday}>{cell.day}</Text>
                  </View>
                ) : (
                  <Text style={[styles.monthDayText, { color: cell.isCurrentMonth ? theme.textSecondary : theme.textTertiary }]}>
                    {cell.day}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 연간 뷰: 월별 막대 차트
  // ─────────────────────────────────────────
  const yearlyBarData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const stat = findMonthlyPeriod(monthlyStatsArr, currentYear, month);
      return { month, distance: stat?.total_distance_km ?? 0 };
    });
  }, [monthlyStatsArr, currentYear]);

  const renderYearlyView = () => {
    const maxDist = Math.max(...yearlyBarData.map((b) => b.distance), 1);
    return (
      <View style={[yrS.chartCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
        <Text style={[yrS.chartTitle, { color: theme.textTertiary }]}>월별 활동량</Text>
        <View style={yrS.chartBarContainer}>
          {yearlyBarData.map((bar) => {
            const isMax = bar.distance === maxDist && bar.distance > 0;
            const barHeight = Math.max((bar.distance / maxDist) * 140, bar.distance > 0 ? 6 : 2);
            return (
              <View key={bar.month} style={yrS.chartBarCol}>
                <View
                  style={[
                    yrS.chartBar,
                    {
                      height: barHeight,
                      backgroundColor: isMax ? BrandOrange : `${BrandOrange}60`,
                    },
                    isMax && {
                      shadowColor: BrandOrange,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                    },
                  ]}
                />
                <Text style={[
                  yrS.chartBarLabel,
                  { color: isMax ? BrandOrange : theme.textTertiary },
                  isMax && { fontFamily: F.inter700 },
                ]}>
                  {bar.month}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────
  // 전체 기록 섹션 (통합 카드)
  // ─────────────────────────────────────────
  const summaryLabel = viewMode === 'weekly' ? '이번 주 총 거리' : viewMode === 'monthly' ? '이번 달 총 거리' : `${currentYear}년 총 거리`;

  const renderSummarySection = () => (
    <View style={styles.summarySection}>
      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
        {/* 상단: 라벨 + 거리 */}
        <Text style={[styles.summaryCardLabel, { color: theme.textTertiary }]}>{summaryLabel}</Text>
        <View style={styles.summaryDistRow}>
          <Text style={styles.summaryDistNumber}>
            {periodSummary ? periodSummary.total_distance_km.toFixed(1) : '0'}
          </Text>
          <Text style={[styles.summaryDistUnit, { color: theme.text }]}>km</Text>
        </View>

        {/* 구분선 */}
        <View style={[styles.summaryDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]} />

        {/* 하단: 3열 통계 */}
        <View style={styles.summaryStatsRow}>
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatLabel, { color: theme.textTertiary }]}>러닝 횟수</Text>
            <Text style={[styles.summaryStatValue, { color: theme.text }]}>
              {periodSummary?.total_activities ?? 0}회
            </Text>
          </View>
          <View style={[styles.summaryStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]} />
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatLabel, { color: theme.textTertiary }]}>총 시간</Text>
            <Text style={[styles.summaryStatValue, { color: theme.text }]}>
              {formatDurationHHMMSS(periodSummary?.total_duration)}
            </Text>
          </View>
          <View style={[styles.summaryStatDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]} />
          <View style={styles.summaryStatItem}>
            <Text style={[styles.summaryStatLabel, { color: theme.textTertiary }]}>평균 페이스</Text>
            <Text style={[styles.summaryStatValue, { color: theme.text }]}>
              {periodSummary?.average_pace_display?.trim() || "0'00\""}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // 상세 기록: 기간 API(from/to)로 이미 필터된 활동 목록 사용
  const detailActivities = activities;

  const detailTitle = viewMode === 'yearly' ? `${currentYear}년 기록` : '상세 기록';
  const detailEmptyMessage = viewMode === 'yearly' ? `${currentYear}년 기록이 없습니다` : '이 달의 기록이 없습니다';

  const renderDetailRecords = () => (
    <View style={styles.detailSection}>
      <View style={styles.detailHeader}>
        <Text style={[styles.detailTitle, themeStyles.detailTitle]}>{detailTitle}</Text>
        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: isDark ? theme.surface : '#F9FAFB', borderColor: theme.border }]}
          onPress={() => router.push('/analyze')}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.analyzeBtnText, { color: theme.textSecondary }]}>분석보기</Text>
        </TouchableOpacity>
      </View>
      {detailActivities.length === 0 && (
        <Text style={[styles.recordDate, themeStyles.recordDate, { paddingVertical: 16, textAlign: 'center' }]}>
          {detailEmptyMessage}
        </Text>
      )}
      {detailActivities.map((record, index) => {
        const d = new Date(record.started_at);
        const dateStr = `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        return (
          <TouchableOpacity
            key={record.activity_id}
            onPress={() => router.push(`/(tabs)/run/${record.activity_id}`)}
          >
            <View style={styles.recordItem}>
              <Text style={[styles.recordMain, themeStyles.recordMain]}>
                {record.distance_km.toFixed(2)} km · {formatDurationHHMMSS(record.duration_display)} ·{' '}
                {record.average_pace_display?.trim() || "00'00\""}
              </Text>
              <Text style={[styles.recordDate, themeStyles.recordDate]}>{dateStr}</Text>
            </View>
            {index < detailActivities.length - 1 && (
              <View style={[styles.recordDivider, themeStyles.recordDivider]} />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ═════════════════════════════════════════
  // 렌더
  // ═════════════════════════════════════════
  return (
    <View style={[styles.container, themeStyles.container]}>
      {/* 상단 고정 헤더 */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, themeStyles.headerTitle]}>기록</Text>
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 전체 기록 요약 (최상단) */}
        {renderSummarySection()}

        {/* 캘린더 */}
        <View style={[styles.calendarCard, themeStyles.calendarCard]}>
          {renderSegmentControl()}
          {renderNavigation()}
          {viewMode === 'weekly' && renderWeeklyView()}
          {viewMode === 'monthly' && renderMonthlyView()}
          {viewMode === 'yearly' && renderYearlyView()}
        </View>

        {/* 상세 기록 */}
        {renderDetailRecords()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ═════════════════════════════════════════════
// 주간 메트릭 스타일 (pen: metricsSection)
// ═════════════════════════════════════════════
const wkS = StyleSheet.create({
  metricsSection: {
    alignItems: 'center',
    gap: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: C.background,
  },
  mainMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distanceValue: {
    fontSize: 72,
    fontFamily: F.mont800,
    color: BrandOrange,
  },
  distanceUnit: {
    fontSize: 24,
    fontFamily: F.inter500,
    color: C.text,
  },
  timeValue: {
    fontSize: 48,
    fontFamily: F.mont700,
    color: C.text,
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  secondaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  secondaryValue: {
    fontSize: 28,
    fontFamily: F.mont700,
    color: C.text,
  },
  secondaryLabel: {
    fontSize: 14,
    fontFamily: F.inter500,
    color: C.text,
  },
});

// ═════════════════════════════════════════════
// 연간 뷰 스타일 (월별 바 차트)
// ═════════════════════════════════════════════
const yrS = StyleSheet.create({
  chartCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: F.inter700,
    marginBottom: 16,
  },
  chartBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    gap: 4,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  chartBar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  chartBarLabel: {
    fontSize: 10,
    fontFamily: F.inter500,
  },
});

// ═════════════════════════════════════════════
// 스타일 (pen design aligned)
// ═════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  headerWrapper: {
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ─── 1. 헤더 ───
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
    color: C.text,
  },

  // ─── 2. 캘린더 카드 ───
  calendarCard: {
    backgroundColor: C.background,
    borderRadius: 20,
    gap: 16,
    padding: 20,
  },

  // ─── 세그먼트 컨트롤 (pen: pill style) ───
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: C.lightGray,
    borderRadius: 24,
    height: 48,
    padding: 4,
    width: 320,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentText: {
    fontSize: 15,
  },
  segmentTextActive: {
    color: BrandOrangeLight,
    fontFamily: F.inter600,
  },
  segmentTextInactive: {
    color: C.textTertiary,
    fontFamily: F.inter500,
  },

  // ─── 네비게이션 ───
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
  },
  navLabel: {
    fontSize: 18,
    fontFamily: F.inter700,
    color: '#1F2937',
  },

  // ─── 요일 헤더 ───
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
    color: C.textTertiary,
  },

  // ─── 날짜 행 ───
  weekRow: {
    flexDirection: 'row',
  },

  // ─── 주간 스트립 (월-일, 원형) ───
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekStripCell: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  weekStripLabel: {
    fontSize: 10,
    fontFamily: F.inter700,
    textTransform: 'uppercase',
  },
  weekStripBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekStripBadgeRun: {
    backgroundColor: BrandOrange,
    shadowColor: BrandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  weekStripBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  weekStripDayText: {
    fontSize: 14,
    fontFamily: F.inter500,
  },

  // ─── 월간 캘린더 카드 ───
  monthCalCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  monthDayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  monthDayBadgeRun: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayTextRun: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: F.inter700,
  },
  monthDayBadgeToday: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BrandOrange,
    backgroundColor: `${BrandOrange}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayTextToday: {
    color: BrandOrange,
    fontSize: 14,
    fontFamily: F.inter700,
  },
  monthDayText: {
    fontSize: 14,
    fontFamily: F.inter400,
  },

  // ─── 기존 날짜 셀 (호환) ───
  dayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  dayBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeRun: {
    backgroundColor: BrandOrange,
  },
  dayBadgeEmpty: {
    backgroundColor: C.lightGray,
  },
  dayBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  dayText: {
    fontSize: 15,
    fontFamily: F.inter500,
  },
  dayTextCurrent: {
    color: C.text,
  },
  dayTextOutside: {
    color: C.textTertiary,
  },
  dayTextRun: {
    color: '#FFFFFF',
    fontFamily: F.inter700,
  },
  dayTextToday: {
    color: BrandOrange,
    fontFamily: F.inter700,
  },

  // ─── X월의 목표 ───
  goalSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  goalSectionTitle: {
    fontSize: 18,
    fontFamily: F.inter600,
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: F.inter600,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandOrange,
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressValue: {
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
  goalCardEmpty: {
    borderRadius: 12,
    padding: 16,
  },
  goalEmptyLine1: {
    fontSize: 16,
    fontFamily: F.inter600,
    marginBottom: 4,
  },
  goalEmptyLine2: {
    fontSize: 14,
    fontFamily: F.inter500,
  },
  goalEmptyDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },
  setGoalButton: {
    backgroundColor: BrandOrange,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: F.inter700,
  },

  // ─── X월의 업적 ───
  achievementSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementSectionTitle: {
    fontSize: 18,
    fontFamily: F.inter600,
  },
  pastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
  },
  pastButtonText: {
    fontSize: 14,
    fontFamily: F.inter500,
  },
  achievementDesc: {
    fontSize: 14,
    lineHeight: 21,
  },

  // ─── 전체 기록 카드 ───
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
  },
  summaryCardLabel: {
    fontSize: 14,
    fontFamily: F.inter500,
    marginBottom: 4,
  },
  summaryDistRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  summaryDistNumber: {
    fontSize: 48,
    fontFamily: F.mont800,
    color: BrandOrange,
    letterSpacing: -2,
  },
  summaryDistUnit: {
    fontSize: 20,
    fontFamily: F.inter700,
  },
  summaryDivider: {
    height: 1,
    marginVertical: 20,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 10,
    fontFamily: F.inter500,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  summaryStatValue: {
    fontSize: 17,
    fontFamily: F.inter700,
  },
  summaryStatDivider: {
    width: 1,
    height: 36,
  },

  // ─── 4. 상세 기록 ───
  detailSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: F.inter600,
    color: C.text,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
  },
  analyzeBtnText: {
    fontSize: 14,
    fontFamily: F.inter500,
  },
  recordItem: {
    paddingVertical: 14,
  },
  recordMain: {
    fontSize: 16,
    fontFamily: F.inter600,
    color: C.text,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
    color: C.textSecondary,
  },
  recordDivider: {
    height: 1,
    backgroundColor: C.border,
  },

  // ─── 하단 여백 ───
  bottomSpacer: {
    height: 40,
  },
});
