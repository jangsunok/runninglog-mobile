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
import { BrandOrange, BrandOrangeLight } from '@/constants/theme';

// ─────────────────────────────────────────────
// 뷰 모드 타입
// ─────────────────────────────────────────────
type ViewMode = 'weekly' | 'monthly' | 'yearly';

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
// 색상 상수 (pen design variables)
// ─────────────────────────────────────────────
const COLOR_TEXT = '#0D0D0D';
const COLOR_TEXT_SECONDARY = '#6B7280';
const COLOR_TEXT_TERTIARY = '#9CA3AF';
const COLOR_BACKGROUND = '#FFFFFF';
const COLOR_LIGHT_GRAY = '#F3F4F6';
const COLOR_BORDER = '#E5E5E5';

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

// 월요일 시작 (pen 디자인 기준)
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// ═════════════════════════════════════════════
// 메인 컴포넌트
// ═════════════════════════════════════════════
export default function CalendarScreen() {
  const router = useRouter();

  // 상태
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentMonth, setCurrentMonth] = useState(1);

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

    // 6줄 고정
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
  // 월 네비게이션
  // ─────────────────────────────────────────
  const renderNavigation = () => (
    <View style={styles.navigationRow}>
      <TouchableOpacity onPress={goToPrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-back" size={24} color={COLOR_TEXT_SECONDARY} />
      </TouchableOpacity>
      <Text style={styles.navLabel}>{`${currentYear}년 ${currentMonth}월`}</Text>
      <TouchableOpacity onPress={goToNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-forward" size={24} color={COLOR_TEXT_SECONDARY} />
      </TouchableOpacity>
    </View>
  );

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
  // 전체 기록 섹션 (pen 디자인: 통합 카드)
  // ─────────────────────────────────────────
  const renderSummarySection = () => (
    <View style={styles.summarySection}>
      {/* 전체 기록 타이틀 + 분석보기 버튼 */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryLabel}>전체 기록</Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => router.push('/analyze')}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={16} color={COLOR_TEXT_SECONDARY} />
          <Text style={styles.analyzeBtnText}>분석보기</Text>
        </TouchableOpacity>
      </View>

      {/* 누적 거리 */}
      <View style={styles.bigDistanceRow}>
        <Text style={styles.bigDistanceLabel}>누적 거리</Text>
        <Text style={styles.bigDistanceNumber}>5.23</Text>
        <Text style={styles.bigDistanceUnit}>km</Text>
      </View>

      {/* 통계 통합 카드 */}
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

        {/* 2. 월간 스트릭 캘린더 카드 */}
        <View style={styles.calendarCard}>
          {renderSegmentControl()}
          {renderNavigation()}
          {renderMonthlyView()}
        </View>

        {/* 3. 전체 기록 요약 */}
        {renderSummarySection()}

        {/* 4. 상세 기록 */}
        {renderDetailRecords()}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

// ═════════════════════════════════════════════
// 스타일 (pen design aligned)
// ═════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
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
    fontWeight: '700',
    color: COLOR_TEXT,
  },

  // ─── 2. 캘린더 카드 ───
  calendarCard: {
    backgroundColor: COLOR_BACKGROUND,
    borderRadius: 20,
    gap: 16,
    padding: 20,
  },

  // ─── 세그먼트 컨트롤 (pen: pill style) ───
  segmentContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: COLOR_LIGHT_GRAY,
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
    fontWeight: '600',
  },
  segmentTextInactive: {
    color: COLOR_TEXT_TERTIARY,
    fontWeight: '500',
  },

  // ─── 월 네비게이션 ───
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
  },
  navLabel: {
    fontSize: 18,
    fontWeight: '700',
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
    fontWeight: '400',
    color: COLOR_TEXT_TERTIARY,
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
    backgroundColor: COLOR_LIGHT_GRAY,
  },
  dayBadgeToday: {
    borderWidth: 2,
    borderColor: BrandOrange,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dayTextCurrent: {
    color: COLOR_TEXT,
  },
  dayTextOutside: {
    color: COLOR_TEXT_TERTIARY,
  },
  dayTextRun: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: BrandOrange,
    fontWeight: '700',
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
    fontWeight: '600',
    color: COLOR_TEXT,
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
    fontWeight: '500',
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
    color: COLOR_TEXT_SECONDARY,
  },
  bigDistanceNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: BrandOrange,
  },
  bigDistanceUnit: {
    fontSize: 24,
    fontWeight: '500',
    color: COLOR_TEXT,
  },

  // ─── 통계 통합 카드 ───
  statsCard: {
    backgroundColor: COLOR_LIGHT_GRAY,
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
    fontWeight: '700',
    color: COLOR_TEXT,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLOR_TEXT_SECONDARY,
  },

  // ─── 4. 상세 기록 ───
  detailSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLOR_TEXT,
    marginBottom: 8,
  },
  recordItem: {
    paddingVertical: 14,
  },
  recordMain: {
    fontSize: 16,
    fontWeight: '600',
    color: COLOR_TEXT,
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 13,
    color: COLOR_TEXT_SECONDARY,
  },
  recordDivider: {
    height: 1,
    backgroundColor: COLOR_BORDER,
  },

  // ─── 하단 여백 ───
  bottomSpacer: {
    height: 40,
  },
});
