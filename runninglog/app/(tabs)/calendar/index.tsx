import Toast from 'react-native-toast-message';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Bell } from 'lucide-react-native';
import { BrandOrange, BrandOrangeLight, Colors, C, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getActivities } from '@/lib/api/activities';
import { getStatisticsSummary } from '@/lib/api/statistics';
import type { ActivityListItem, StatisticsSummary } from '@/types/activity';

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

// 일요일 시작
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

/** 기록 이동 가능 범위: 2025-01-01 ~ 오늘(미래 불가) */
const MIN_YEAR = 2025;
const MIN_DATE = new Date(MIN_YEAR, 0, 1);

// ═════════════════════════════════════════════
// 메인 컴포넌트
// ═════════════════════════════════════════════
export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);
  const [weekSunday, setWeekSunday] = useState(() => getWeekSunday(now));

  // API 데이터
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [runDates, setRunDates] = useState<Record<string, number[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const [actData, sumData] = await Promise.all([
          getActivities({ page: 1, page_size: 100 }),
          getStatisticsSummary(),
        ]);
        setActivities(actData.results);
        setSummary(sumData);

        // 활동 날짜를 연-월별로 그룹핑
        const dateMap: Record<string, number[]> = {};
        for (const act of actData.results) {
          const d = new Date(act.started_at);
          const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
          const day = d.getDate();
          if (!dateMap[key]) dateMap[key] = [];
          if (!dateMap[key].includes(day)) dateMap[key].push(day);
        }
        setRunDates(dateMap);
      } catch {
        Toast.show({ type: 'error', text1: '기록을 불러오지 못했어요.' });
      }
    })();
  }, []);

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

  // 주간 뷰 데이터
  const weekDays = useMemo(() => {
    const days: { day: number; month: number; year: number }[] = [];
    for (let i = 0; i < 7; i++) {
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
      statValue: { color: BrandOrange },
      statLabel: { color: theme.textSecondary },
      detailTitle: { color: theme.text },
      recordMain: { color: theme.text },
      recordDate: { color: theme.textSecondary },
      recordDivider: { backgroundColor: theme.border },
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
  // 주간 뷰
  // ─────────────────────────────────────────
  const renderWeeklyView = () => (
    <View>
      {renderWeekdayHeader()}
      <View style={styles.weekRow}>
        {weekDays.map((wd, i) => {
          const hasRun = isRunDayCheck(runDates,wd.year, wd.month, wd.day);
          const todayFlag = isToday(wd.year, wd.month, wd.day);
          return (
            <View key={i} style={styles.dayCell}>
              <View
                style={[
                  styles.dayBadge,
                  hasRun && styles.dayBadgeRun,
                  !hasRun && !todayFlag && [styles.dayBadgeEmpty, themeStyles.dayBadgeEmpty],
                  todayFlag && !hasRun && styles.dayBadgeToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    themeStyles.dayTextCurrent,
                    hasRun && styles.dayTextRun,
                    todayFlag && !hasRun && styles.dayTextToday,
                  ]}
                >
                  {wd.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  // ─────────────────────────────────────────
  // 주간 상세 메트릭 (pen: metricsSection)
  // ─────────────────────────────────────────
  const renderWeeklyMetrics = () => (
    <View style={wkS.metricsSection}>
      <View style={wkS.mainMetrics}>
        <Text style={wkS.distanceValue}>5.23</Text>
        <Text style={wkS.distanceUnit}>km</Text>
      </View>
      <Text style={wkS.timeValue}>00:28:45</Text>
      <View style={wkS.secondaryRow}>
        <View style={wkS.secondaryItem}>
          <Text style={wkS.secondaryValue}>5'29"</Text>
          <Text style={wkS.secondaryLabel}>현재 페이스</Text>
        </View>
        <View style={wkS.secondaryItem}>
          <Text style={wkS.secondaryValue}>
            <Text style={{ color: '#EF4444' }}>♥ </Text>156
          </Text>
          <Text style={wkS.secondaryLabel}>심박수 bpm</Text>
        </View>
      </View>
    </View>
  );

  // ─────────────────────────────────────────
  // 월간 뷰
  // ─────────────────────────────────────────
  const renderMonthlyView = () => (
    <View>
      {renderWeekdayHeader()}
      {monthGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map((cell, colIndex) =>
            renderDayCell(cell.day, cell.isCurrentMonth, rowIndex, colIndex)
          )}
        </View>
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 연간 뷰: 미니 캘린더 그리드
  // ─────────────────────────────────────────
  const renderYearlyView = () => (
    <View style={yrS.container}>
      {[0, 1, 2, 3, 4, 5].map((rowIdx) => (
        <View key={rowIdx} style={yrS.monthRow}>
          {[0, 1].map((colIdx) => {
            const grid = yearGrids[rowIdx * 2 + colIdx];
            return (
              <View key={colIdx} style={[yrS.monthCard, { borderColor: theme.border }]}>
                <Text style={[yrS.monthTitle, { color: theme.text }]}>{MONTH_NAMES[grid.month - 1]}</Text>
                <View style={yrS.miniGrid}>
                  {grid.weeks.map((week, wi) => (
                    <View key={wi} style={yrS.miniWeekRow}>
                      {week.map((day, di) => {
                        if (day === null) {
                          return <View key={di} style={yrS.miniDayEmpty} />;
                        }
                        const hasRun = isRunDayCheck(runDates,currentYear, grid.month, day);
                        return (
                          <View
                            key={di}
                            style={[
                              yrS.miniDay,
                              { backgroundColor: hasRun ? BrandOrange : theme.surface },
                            ]}
                          >
                            <Text
                              style={[
                                yrS.miniDayText,
                                { color: hasRun ? '#FFFFFF' : theme.text },
                              ]}
                            >
                              {day}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 전체 기록 섹션 (pen 디자인: 통합 카드)
  // ─────────────────────────────────────────
  const renderSummarySection = () => (
    <View style={styles.summarySection}>
      <View style={styles.summaryHeader}>
        <Text style={[styles.summaryLabel, themeStyles.summaryLabel]}>전체 기록</Text>
        <TouchableOpacity
          style={[styles.analyzeButton, themeStyles.summaryAnalyzeButton]}
          onPress={() => router.push('/analyze')}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.analyzeBtnText, themeStyles.summaryAnalyzeBtnText]}>분석보기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bigDistanceRow}>
        <Text style={[styles.bigDistanceLabel, themeStyles.bigDistanceLabel]}>누적 거리</Text>
        <Text style={styles.bigDistanceNumber}>
          {summary ? summary.total_distance_km.toFixed(2) : '0'}
        </Text>
        <Text style={[styles.bigDistanceUnit, themeStyles.bigDistanceUnit]}>km</Text>
      </View>

      <View style={[styles.statsCard, themeStyles.statsCard]}>
        <View style={styles.statsInnerRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themeStyles.statValue]}>{summary?.total_activities ?? 0}</Text>
            <Text style={[styles.statLabel, themeStyles.statLabel]}>횟수</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themeStyles.statValue]}>{summary?.total_duration_display ?? '0:00:00'}</Text>
            <Text style={[styles.statLabel, themeStyles.statLabel]}>누적 시간</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, themeStyles.statValue]}>{summary?.average_pace_display ?? "-"}</Text>
            <Text style={[styles.statLabel, themeStyles.statLabel]}>평균 페이스</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─────────────────────────────────────────
  // 상세 기록 리스트
  // ─────────────────────────────────────────
  // 연간 뷰: 해당 연도 전체, 월간/주간 뷰: 현재 연·월만 (달력과 동일한 year 기준)
  const detailActivities = useMemo(() => {
    if (viewMode === 'yearly') {
      return activities.filter((a) => {
        const d = new Date(a.started_at);
        return d.getFullYear() === currentYear;
      });
    }
    return activities.filter((a) => {
      const d = new Date(a.started_at);
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
    });
  }, [activities, viewMode, currentYear, currentMonth]);

  const detailTitle = viewMode === 'yearly' ? `${currentYear}년 기록` : '상세 기록';
  const detailEmptyMessage = viewMode === 'yearly' ? `${currentYear}년 기록이 없습니다` : '이 달의 기록이 없습니다';

  const renderDetailRecords = () => (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, themeStyles.detailTitle]}>{detailTitle}</Text>
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
                {record.distance_km} km · {record.duration_display} · {record.average_pace_display}/km
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 헤더: 제목 + 알림 */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, themeStyles.headerTitle]}>기록</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/my/notifications')}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            hitSlop={12}
          >
            <Bell size={24} color={theme.icon} strokeWidth={2} />
          </Pressable>
        </View>

        {/* 2. 캘린더 카드 */}
        <View style={[styles.calendarCard, themeStyles.calendarCard]}>
          {renderSegmentControl()}
          {renderNavigation()}
          {viewMode === 'weekly' && renderWeeklyView()}
          {viewMode === 'monthly' && renderMonthlyView()}
          {viewMode === 'yearly' && renderYearlyView()}
        </View>

        {/* 전체 기록 요약 */}
        {renderSummarySection()}

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
// 연간 뷰 스타일 (pen: miniCalendar)
// ═════════════════════════════════════════════
const yrS = StyleSheet.create({
  container: {
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  monthCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLOR_SURFACE_SUBTLE,
    padding: 8,
    gap: 4,
  },
  monthTitle: {
    fontSize: 12,
    fontFamily: F.inter600,
    color: C.text,
  },
  miniGrid: {
    gap: 2,
  },
  miniWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 14,
  },
  miniDay: {
    width: 18,
    height: 12,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayEmpty: {
    width: 18,
    height: 12,
  },
  miniDayText: {
    fontSize: 8,
    color: C.text,
  },
  miniDayTextRun: {
    color: '#FFFFFF',
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

  // ─── 날짜 셀 (pen: rounded square) ───
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

  // ─── 3. 전체 기록 요약 ───
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 18,
    fontFamily: F.inter600,
    color: C.text,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
  },
  analyzeBtnText: {
    fontSize: 14,
    fontFamily: F.inter500,
    color: '#374151',
  },

  // ─── 누적 거리 ───
  bigDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  bigDistanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
  },
  bigDistanceNumber: {
    fontSize: 30,
    fontFamily: F.mont800,
    color: BrandOrange,
  },
  bigDistanceUnit: {
    fontSize: 24,
    fontWeight: '500',
    color: C.text,
  },

  // ─── 통계 통합 카드 ───
  statsCard: {
    backgroundColor: C.lightGray,
    borderRadius: 16,
    padding: 16,
  },
  statsInnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 24,
    fontFamily: F.mont700,
    color: C.text,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textSecondary,
  },

  // ─── 4. 상세 기록 ───
  detailSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: F.inter600,
    color: C.text,
    marginBottom: 8,
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
