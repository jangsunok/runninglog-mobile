import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BrandOrange } from '@/constants/theme';

// ─────────────────────────────────────────────
// 뷰 모드 타입
// ─────────────────────────────────────────────
type ViewMode = 'weekly' | 'monthly' | 'yearly';

// ─────────────────────────────────────────────
// 목업 데이터: 달린 날짜 (2025년 1월)
// ─────────────────────────────────────────────
const MOCK_RUN_DATES: Record<string, number[]> = {
  '2025-1': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 17, 18, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30],
};

// 목업 상세 기록
const MOCK_RECORDS = [
  { distance: 5.2, duration: '28:30', pace: "5'29\"", date: '1월 30일 01:51' },
  { distance: 5.2, duration: '28:30', pace: "5'29\"", date: '1월 30일 01:51' },
  { distance: 5.2, duration: '28:30', pace: "5'29\"", date: '1월 30일 01:51' },
  { distance: 4.8, duration: '25:12', pace: "5'15\"", date: '1월 29일 07:30' },
  { distance: 6.1, duration: '33:45', pace: "5'32\"", date: '1월 28일 18:20' },
];

// ─────────────────────────────────────────────
// 유틸: 날짜 계산 도우미
// ─────────────────────────────────────────────
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** 해당 월 1일의 요일 (0=일 → 월요일 시작으로 변환) */
function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay();
  return day === 0 ? 6 : day - 1; // 월=0, 화=1, ..., 일=6
}

/** 해당 주의 월~일 날짜 배열 반환 */
function getWeekDates(
  year: number,
  month: number,
  weekNumber: number
): { day: number; isCurrentMonth: boolean }[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = (weekNumber - 1) * 7 - firstDay + 1;
  const result: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = startDay + i;
    if (d >= 1 && d <= daysInMonth) {
      result.push({ day: d, isCurrentMonth: true });
    } else if (d < 1) {
      // 이전 달
      const prevDays = getDaysInMonth(year, month - 1 <= 0 ? 12 : month - 1);
      result.push({ day: prevDays + d, isCurrentMonth: false });
    } else {
      // 다음 달
      result.push({ day: d - daysInMonth, isCurrentMonth: false });
    }
  }
  return result;
}

/** 달린 날인지 확인 */
function isRunDay(year: number, month: number, day: number): boolean {
  const key = `${year}-${month}`;
  return MOCK_RUN_DATES[key]?.includes(day) ?? false;
}

/** 오늘 날짜 판별 */
function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day;
}

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// ═════════════════════════════════════════════
// 메인 컴포넌트
// ═════════════════════════════════════════════
export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(3);

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

  // 주 네비게이션
  const totalWeeks = useMemo(() => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    return Math.ceil((daysInMonth + firstDay) / 7);
  }, [currentYear, currentMonth]);

  const goToPrevWeek = useCallback(() => {
    if (currentWeek === 1) {
      // 이전 달 마지막 주로
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const firstDay = getFirstDayOfMonth(prevYear, prevMonth);
      const daysInMonth = getDaysInMonth(prevYear, prevMonth);
      const weeks = Math.ceil((daysInMonth + firstDay) / 7);
      setCurrentYear(prevYear);
      setCurrentMonth(prevMonth);
      setCurrentWeek(weeks);
    } else {
      setCurrentWeek((w) => w - 1);
    }
  }, [currentWeek, currentMonth, currentYear]);

  const goToNextWeek = useCallback(() => {
    if (currentWeek >= totalWeeks) {
      // 다음 달 1주차로
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      setCurrentYear(nextYear);
      setCurrentMonth(nextMonth);
      setCurrentWeek(1);
    } else {
      setCurrentWeek((w) => w + 1);
    }
  }, [currentWeek, totalWeeks, currentMonth, currentYear]);

  // 연 네비게이션
  const goToPrevYear = useCallback(() => setCurrentYear((y) => y - 1), []);
  const goToNextYear = useCallback(() => setCurrentYear((y) => y + 1), []);

  // 월간 캘린더 그리드 데이터
  const monthGrid = useMemo(() => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const prevDays = getDaysInMonth(
      currentMonth === 1 ? currentYear - 1 : currentYear,
      currentMonth === 1 ? 12 : currentMonth - 1
    );
    const rows: { day: number; isCurrentMonth: boolean }[][] = [];
    let currentRow: { day: number; isCurrentMonth: boolean }[] = [];

    // 이전 달 날짜 (빈 셀)
    for (let i = 0; i < firstDay; i++) {
      currentRow.push({ day: prevDays - firstDay + 1 + i, isCurrentMonth: false });
    }

    // 현재 달 날짜
    for (let d = 1; d <= daysInMonth; d++) {
      currentRow.push({ day: d, isCurrentMonth: true });
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // 마지막 줄 채우기
    if (currentRow.length > 0) {
      let nextDay = 1;
      while (currentRow.length < 7) {
        currentRow.push({ day: nextDay++, isCurrentMonth: false });
      }
      rows.push(currentRow);
    }

    return rows;
  }, [currentYear, currentMonth]);

  // ─────────────────────────────────────────
  // 세그먼트 컨트롤
  // ─────────────────────────────────────────
  const renderSegmentControl = () => (
    <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F2' }]}>
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
              isActive && {
                backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              },
            ]}
            onPress={() => setViewMode(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                { color: isActive ? BrandOrange : isDark ? '#A0A0A0' : '#666666' },
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
  // 네비게이션 헤더
  // ─────────────────────────────────────────
  const renderNavigation = () => {
    let label = '';
    let onPrev: () => void;
    let onNext: () => void;

    if (viewMode === 'monthly') {
      label = `${currentYear}년 ${currentMonth}월`;
      onPrev = goToPrevMonth;
      onNext = goToNextMonth;
    } else if (viewMode === 'weekly') {
      label = `${currentYear}년 ${currentMonth}월 ${currentWeek}주차`;
      onPrev = goToPrevWeek;
      onNext = goToNextWeek;
    } else {
      label = `${currentYear}년`;
      onPrev = goToPrevYear;
      onNext = goToNextYear;
    }

    return (
      <View style={styles.navigationRow}>
        <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.navArrow, { color: theme.text }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.navLabel, { color: theme.text }]}>{label}</Text>
        <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.navArrow, { color: theme.text }]}>{'>'}</Text>
        </TouchableOpacity>
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
          <Text style={[styles.weekdayText, { color: isDark ? '#808080' : '#999999' }]}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );

  // ─────────────────────────────────────────
  // 날짜 셀 (월간)
  // ─────────────────────────────────────────
  const renderDayCell = (
    day: number,
    isCurrentMonth: boolean,
    rowIndex: number,
    colIndex: number
  ) => {
    const hasRun = isCurrentMonth && isRunDay(currentYear, currentMonth, day);
    const todayFlag = isCurrentMonth && isToday(currentYear, currentMonth, day);

    return (
      <View key={`${rowIndex}-${colIndex}`} style={styles.dayCell}>
        <View
          style={[
            styles.dayBadge,
            hasRun && styles.dayBadgeRun,
            todayFlag && !hasRun && styles.dayBadgeToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && { color: isDark ? '#404040' : '#CCCCCC' },
              isCurrentMonth && { color: theme.text },
              hasRun && { color: '#FFFFFF' },
              todayFlag && !hasRun && { color: BrandOrange, fontWeight: '700' },
            ]}
          >
            {day}
          </Text>
        </View>
      </View>
    );
  };

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
  // 주간 뷰
  // ─────────────────────────────────────────
  const renderWeeklyView = () => {
    const weekDates = getWeekDates(currentYear, currentMonth, currentWeek);
    return (
      <View>
        {renderWeekdayHeader()}
        <View style={styles.weekRow}>
          {weekDates.map((cell, index) => {
            const hasRun = cell.isCurrentMonth && isRunDay(currentYear, currentMonth, cell.day);
            const todayFlag = cell.isCurrentMonth && isToday(currentYear, currentMonth, cell.day);
            return (
              <View key={index} style={styles.dayCell}>
                <View
                  style={[
                    styles.dayBadge,
                    styles.dayBadgeLarge,
                    hasRun && styles.dayBadgeRun,
                    todayFlag && !hasRun && styles.dayBadgeToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      styles.dayTextLarge,
                      !cell.isCurrentMonth && { color: isDark ? '#404040' : '#CCCCCC' },
                      cell.isCurrentMonth && { color: theme.text },
                      hasRun && { color: '#FFFFFF' },
                      todayFlag && !hasRun && { color: BrandOrange, fontWeight: '700' },
                    ]}
                  >
                    {cell.day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────
  // 연간 뷰 - 미니 캘린더
  // ─────────────────────────────────────────
  const renderMiniMonth = (month: number) => {
    const firstDay = getFirstDayOfMonth(currentYear, month);
    const daysInMonth = getDaysInMonth(currentYear, month);
    const cells: (number | null)[] = [];

    // 빈 셀
    for (let i = 0; i < firstDay; i++) cells.push(null);
    // 날짜
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }
    // 마지막 행 7칸 채우기
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      while (lastRow.length < 7) lastRow.push(null);
    }

    return (
      <View
        key={month}
        style={[
          styles.miniMonthCard,
          { backgroundColor: isDark ? theme.surface : '#FFFFFF', borderColor: theme.border },
        ]}
      >
        <Text style={[styles.miniMonthTitle, { color: theme.text }]}>{month}월</Text>
        {/* 요일 미니 헤더 */}
        <View style={styles.miniWeekdayRow}>
          {WEEKDAY_LABELS.map((l) => (
            <Text key={l} style={[styles.miniWeekdayText, { color: isDark ? '#666' : '#999' }]}>
              {l}
            </Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.miniWeekRow}>
            {row.map((day, ci) => {
              if (day === null) {
                return <View key={ci} style={styles.miniDayCell} />;
              }
              const hasRun = isRunDay(currentYear, month, day);
              return (
                <View key={ci} style={styles.miniDayCell}>
                  <View style={[styles.miniDayDot, hasRun && styles.miniDayDotRun]}>
                    <Text
                      style={[
                        styles.miniDayText,
                        { color: hasRun ? '#FFFFFF' : isDark ? '#888' : '#666' },
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderYearlyView = () => (
    <View style={styles.yearGrid}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => renderMiniMonth(month))}
    </View>
  );

  // ─────────────────────────────────────────
  // 전체 기록 섹션 (월간 뷰 전용)
  // ─────────────────────────────────────────
  const renderSummarySection = () => (
    <View style={styles.summarySection}>
      {/* 전체 기록 타이틀 + 분석보기 버튼 */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>전체 기록</Text>
        <TouchableOpacity
          style={[styles.analyzeButton, { borderColor: theme.border }]}
          onPress={() => router.push('/analyze')}
          activeOpacity={0.7}
        >
          <Text style={[styles.analyzeButtonText, { color: theme.text }]}>📊 분석보기</Text>
        </TouchableOpacity>
      </View>

      {/* 누적 거리 */}
      <View style={styles.totalDistanceRow}>
        <Text style={[styles.totalDistanceLabel, { color: isDark ? '#A0A0A0' : '#666666' }]}>
          누적 거리
        </Text>
        <Text style={styles.totalDistanceValue}>
          <Text style={styles.totalDistanceNumber}>5.23</Text>
          <Text style={[styles.totalDistanceUnit, { color: theme.text }]}> km</Text>
        </Text>
      </View>

      {/* 요약 카드 3칸 */}
      <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>8</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#808080' : '#999999' }]}>횟수</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>5:12:13</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#808080' : '#999999' }]}>
            누적 시간
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>5'24"</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#808080' : '#999999' }]}>
            평균 페이스
          </Text>
        </View>
      </View>
    </View>
  );

  // ─────────────────────────────────────────
  // 상세 기록 리스트
  // ─────────────────────────────────────────
  const renderDetailRecords = () => (
    <View style={styles.detailSection}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>상세 기록</Text>
      {MOCK_RECORDS.map((record, index) => (
        <View key={index}>
          <View style={styles.recordItem}>
            <Text style={[styles.recordMain, { color: theme.text }]}>
              {record.distance} km · {record.duration} · {record.pace}/km
            </Text>
            <Text style={[styles.recordDate, { color: isDark ? '#808080' : '#999999' }]}>
              {record.date}
            </Text>
          </View>
          {index < MOCK_RECORDS.length - 1 && (
            <View style={[styles.recordDivider, { backgroundColor: theme.border }]} />
          )}
        </View>
      ))}
    </View>
  );

  // ═════════════════════════════════════════
  // 렌더
  // ═════════════════════════════════════════
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 타이틀 */}
        <Text style={[styles.title, { color: theme.text }]}>기록</Text>

        {/* 세그먼트 컨트롤 */}
        {renderSegmentControl()}

        {/* 네비게이션 */}
        {renderNavigation()}

        {/* 뷰 모드별 캘린더 */}
        {viewMode === 'monthly' && renderMonthlyView()}
        {viewMode === 'weekly' && renderWeeklyView()}
        {viewMode === 'yearly' && renderYearlyView()}

        {/* 월간 뷰일 때만 요약/상세 표시 */}
        {viewMode === 'monthly' && (
          <>
            {renderSummarySection()}
            {renderDetailRecords()}
          </>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ═════════════════════════════════════════════
// 스타일
// ═════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // 타이틀
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 20,
  },

  // 세그먼트 컨트롤
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // 네비게이션
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  navArrow: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  navLabel: {
    fontSize: 18,
    fontWeight: '700',
  },

  // 요일 헤더
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // 날짜 행
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },

  // 날짜 셀
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeLarge: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  dayBadgeRun: {
    backgroundColor: BrandOrange,
  },
  dayBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dayTextLarge: {
    fontSize: 18,
    fontWeight: '600',
  },

  // 요약 섹션
  summarySection: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  analyzeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  analyzeButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // 누적 거리
  totalDistanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  totalDistanceLabel: {
    fontSize: 14,
  },
  totalDistanceValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalDistanceNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: BrandOrange,
  },
  totalDistanceUnit: {
    fontSize: 20,
    fontWeight: '600',
  },

  // 통계 카드
  statsCard: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 32,
  },

  // 상세 기록
  detailSection: {
    marginTop: 28,
  },
  recordItem: {
    paddingVertical: 14,
  },
  recordMain: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
  },
  recordDivider: {
    height: 1,
  },

  // 연간 뷰
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  miniMonthCard: {
    width: '48%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  miniMonthTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  miniWeekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  miniWeekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: '500',
  },
  miniWeekRow: {
    flexDirection: 'row',
  },
  miniDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 1,
  },
  miniDayDot: {
    width: 16,
    height: 16,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayDotRun: {
    backgroundColor: BrandOrange,
  },
  miniDayText: {
    fontSize: 8,
    fontWeight: '500',
  },

  // 하단 여백
  bottomSpacer: {
    height: 40,
  },
});
