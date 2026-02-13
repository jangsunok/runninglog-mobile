import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandOrange, BrandOrangeLight, C, F } from '@/constants/theme';

// ─────────────────────────────────────────────
// 뷰 모드 타입
// ─────────────────────────────────────────────
type ViewMode = 'weekly' | 'monthly' | 'yearly';

/** 연간 뷰 미니 캘린더 배경 (theme surface보다 밝음) */
const COLOR_SURFACE_SUBTLE = '#f9fafb';

// ─────────────────────────────────────────────
// 목업 데이터: 달린 날짜 (2025년 1월)
// ─────────────────────────────────────────────
const MOCK_RUN_DATES: Record<string, number[]> = {
  '2025-1': [1, 2, 3, 5, 6, 7, 8, 9, 10, 17, 18, 19, 20, 21, 22, 23, 27, 28, 29, 30],
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

/** 해당 월 1일의 요일 (0=일요일) — 월요일 시작 캘린더 */
function getFirstDayOfMonthMon(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay(); // 0=일요일
  return day === 0 ? 6 : day - 1; // 0=월요일
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

/** 주어진 날짜가 포함된 주의 월요일 구하기 */
function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** 해당 날짜가 그 달의 몇 주차인지 (월요일 시작) */
function getWeekOfMonth(date: Date): number {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstMonday = getWeekMonday(firstOfMonth);
  if (firstMonday.getMonth() < firstOfMonth.getMonth() || firstMonday.getFullYear() < firstOfMonth.getFullYear()) {
    firstMonday.setDate(firstMonday.getDate() + 7);
  }
  const monday = getWeekMonday(date);
  const weekNum = Math.floor((monday.getTime() - firstMonday.getTime()) / (7 * 86400000)) + 1;
  return Math.max(1, weekNum);
}

// 월요일 시작 (pen 디자인 기준)
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// ═════════════════════════════════════════════
// 메인 컴포넌트
// ═════════════════════════════════════════════
export default function CalendarScreen() {
  const router = useRouter();

  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [weekMonday, setWeekMonday] = useState(() => {
    // 2025년 1월 3주차 월요일 (pen 디자인 기준)
    return getWeekMonday(new Date(2025, 0, 13));
  });

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
    setWeekMonday((m) => {
      const d = new Date(m);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekMonday((m) => {
      const d = new Date(m);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  // 연간 네비게이션
  const goToPrevYear = useCallback(() => setCurrentYear((y) => y - 1), []);
  const goToNextYear = useCallback(() => setCurrentYear((y) => y + 1), []);

  // 주간 뷰 데이터
  const weekDays = useMemo(() => {
    const days: { day: number; month: number; year: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekMonday);
      d.setDate(d.getDate() + i);
      days.push({ day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() });
    }
    return days;
  }, [weekMonday]);

  const weekLabel = useMemo(() => {
    const wom = getWeekOfMonth(weekMonday);
    return `${weekMonday.getFullYear()}년 ${weekMonday.getMonth() + 1}월 ${wom}주차`;
  }, [weekMonday]);

  // 월간 캘린더 그리드 데이터 (월요일 시작)
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

  // ─────────────────────────────────────────
  // 세그먼트 컨트롤 (pen: pill 스타일)
  // ─────────────────────────────────────────
  const renderSegmentControl = () => (
    <View style={styles.segmentContainer}>
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
              isActive && styles.segmentButtonActive,
            ]}
            onPress={() => setViewMode(key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.segmentText,
                isActive ? styles.segmentTextActive : styles.segmentTextInactive,
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
  // 네비게이션 (모드별 분기)
  // ─────────────────────────────────────────
  const renderNavigation = () => {
    let label = '';
    let onPrev: () => void;
    let onNext: () => void;

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

    return (
      <View style={styles.navigationRow}>
        <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={C.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.navLabel}>{label}</Text>
        <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={24} color={C.textSecondary} />
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
          <Text style={styles.weekdayText}>{label}</Text>
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
    const hasRun = isCurrentMonth && isRunDay(currentYear, currentMonth, day);
    const todayFlag = isCurrentMonth && isToday(currentYear, currentMonth, day);

    return (
      <View key={`${rowIndex}-${colIndex}`} style={styles.dayCell}>
        <View
          style={[
            styles.dayBadge,
            hasRun && styles.dayBadgeRun,
            !hasRun && isCurrentMonth && !todayFlag && styles.dayBadgeEmpty,
            todayFlag && !hasRun && styles.dayBadgeToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.dayTextOutside,
              isCurrentMonth && styles.dayTextCurrent,
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
          const hasRun = isRunDay(wd.year, wd.month, wd.day);
          const todayFlag = isToday(wd.year, wd.month, wd.day);
          return (
            <View key={i} style={styles.dayCell}>
              <View
                style={[
                  styles.dayBadge,
                  hasRun && styles.dayBadgeRun,
                  !hasRun && !todayFlag && styles.dayBadgeEmpty,
                  todayFlag && !hasRun && styles.dayBadgeToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    styles.dayTextCurrent,
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
              <View key={colIdx} style={yrS.monthCard}>
                <Text style={yrS.monthTitle}>{MONTH_NAMES[grid.month - 1]}</Text>
                <View style={yrS.miniGrid}>
                  {grid.weeks.map((week, wi) => (
                    <View key={wi} style={yrS.miniWeekRow}>
                      {week.map((day, di) => {
                        if (day === null) {
                          return <View key={di} style={yrS.miniDayEmpty} />;
                        }
                        const hasRun = isRunDay(currentYear, grid.month, day);
                        return (
                          <View
                            key={di}
                            style={[
                              yrS.miniDay,
                              { backgroundColor: hasRun ? BrandOrange : COLOR_SURFACE_SUBTLE },
                            ]}
                          >
                            <Text
                              style={[
                                yrS.miniDayText,
                                hasRun && yrS.miniDayTextRun,
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
        <Text style={styles.summaryLabel}>전체 기록</Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => router.push('/analyze')}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={C.textSecondary} />
          <Text style={styles.analyzeBtnText}>분석보기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bigDistanceRow}>
        <Text style={styles.bigDistanceLabel}>누적 거리</Text>
        <Text style={styles.bigDistanceNumber}>5.23</Text>
        <Text style={styles.bigDistanceUnit}>km</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statsInnerRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>횟수</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5:12:13</Text>
            <Text style={styles.statLabel}>누적 시간</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5'24"</Text>
            <Text style={styles.statLabel}>평균 페이스</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // ─────────────────────────────────────────
  // 상세 기록 리스트
  // ─────────────────────────────────────────
  const renderDetailRecords = () => (
    <View style={styles.detailSection}>
      <Text style={styles.detailTitle}>상세 기록</Text>
      {MOCK_RECORDS.map((record, index) => (
        <View key={index}>
          <View style={styles.recordItem}>
            <Text style={styles.recordMain}>
              {record.distance} km · {record.duration} · {record.pace}/km
            </Text>
            <Text style={styles.recordDate}>{record.date}</Text>
          </View>
          {index < MOCK_RECORDS.length - 1 && (
            <View style={styles.recordDivider} />
          )}
        </View>
      ))}
    </View>
  );

  // ═════════════════════════════════════════
  // 렌더
  // ═════════════════════════════════════════
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>기록</Text>
        </View>

        {/* 2. 캘린더 카드 */}
        <View style={styles.calendarCard}>
          {renderSegmentControl()}
          {renderNavigation()}
          {viewMode === 'weekly' && renderWeeklyView()}
          {viewMode === 'monthly' && renderMonthlyView()}
          {viewMode === 'yearly' && renderYearlyView()}
        </View>

        {/* 주간: 메트릭 섹션 */}
        {viewMode === 'weekly' && renderWeeklyMetrics()}

        {/* 월간/연간: 전체 기록 요약 */}
        {viewMode !== 'weekly' && renderSummarySection()}

        {/* 상세 기록 (월간만) */}
        {viewMode === 'monthly' && renderDetailRecords()}

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
    paddingTop: 60,
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
