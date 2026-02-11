import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  SafeAreaView,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors, BrandOrange } from '@/constants/theme';

// ---------------------------------------------------------------------------
// 목업 데이터
// ---------------------------------------------------------------------------

const MONTHS = ['8월', '9월', '10월', '11월', '12월', '1월'];
const MONTH_OPTIONS = ['2025년 1월', '2024년 12월', '2024년 11월'];

/** 섹션 1: 누적 거리 (km) */
const DISTANCE_DATA = [87, 0, 133, 110, 150, 123];

/** 섹션 2: 달리기 횟수 (회) */
const RUN_COUNT_DATA = [3, 0, 7, 4, 10, 8];

/** 섹션 3: 누적 시간 (임의 단위, 가로 바 차트용) */
const TIME_DATA = [3, 0, 7, 4, 10, 8];

/** 섹션 4: 소비 칼로리 */
const CALORIE_DATA = [87, 0, 133, 110, 150, 123];

/** 섹션 5: 페이스 – 최고/최저 (분 단위 소수) */
const PACE_DATA = [
  { min: 6.0, max: 7.0 },   // 8월
  { min: 5.8, max: 6.8 },   // 9월
  { min: 5.5, max: 6.5 },   // 10월
  { min: 5.7, max: 6.4 },   // 11월
  { min: 5.7, max: 6.37 },  // 12월 – 5'42" ~ 6'22"
  { min: 5.7, max: 6.37 },  // 1월 – 5'42" ~ 6'22"
];

/** 섹션 6: 심박수 분포 (Zone 1~5 비율, %) */
const HR_ZONE_DATA = [
  { label: '1월', zones: [11, 40, 40, 4, 6] },
  { label: '12월', zones: [11, 40, 40, 4, 6] },
  { label: '11월', zones: [11, 40, 40, 4, 6] },
  { label: '10월', zones: [11, 40, 40, 4, 6] },
  { label: '9월', zones: [11, 40, 40, 4, 6] },
];

const ZONE_COLORS = ['#E0E0E0', '#66BB6A', '#FDD835', '#FF8A65', '#EF5350'];
const ZONE_LABELS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];

// ---------------------------------------------------------------------------
// 유틸
// ---------------------------------------------------------------------------

/** 숫자(분, 소수) → "5'42\"" 형태 문자열 */
function formatPace(val: number): string {
  const mins = Math.floor(val);
  const secs = Math.round((val - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

// ---------------------------------------------------------------------------
// 세로 바 차트 컴포넌트
// ---------------------------------------------------------------------------

interface VerticalBarChartProps {
  data: number[];
  labels: string[];
  currentIndex: number;       // 이번 달 인덱스 (오렌지 표시)
  chartHeight?: number;
  barColor?: string;
  activeColor?: string;
  isDark: boolean;
}

function VerticalBarChart({
  data,
  labels,
  currentIndex,
  chartHeight = 200,
  barColor,
  activeColor = BrandOrange,
  isDark,
}: VerticalBarChartProps) {
  const maxValue = Math.max(...data, 1);
  const defaultBarColor = isDark ? '#555' : '#D5D5D5';
  const resolvedBarColor = barColor ?? defaultBarColor;

  return (
    <View style={[
      chartStyles.chartContainer,
      { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface },
    ]}>
      <View style={[chartStyles.barsRow, { height: chartHeight }]}>
        {data.map((value, index) => {
          const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 30) : 0;
          const isActive = index === currentIndex;
          const color = isActive ? activeColor : resolvedBarColor;
          return (
            <View key={index} style={chartStyles.barColumn}>
              {/* 수치 라벨 */}
              <ThemedText
                style={[
                  chartStyles.barValue,
                  isActive && { color: BrandOrange, fontWeight: '700' },
                ]}
              >
                {value}
              </ThemedText>
              {/* 막대 */}
              <View
                style={[
                  chartStyles.bar,
                  {
                    height: Math.max(barHeight, 2),
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      {/* 월 라벨 */}
      <View style={chartStyles.labelsRow}>
        {labels.map((label, index) => (
          <ThemedText key={index} style={chartStyles.monthLabel}>
            {label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 가로 바 차트 컴포넌트 (누적 시간용)
// ---------------------------------------------------------------------------

interface HorizontalBarChartProps {
  data: number[];
  labels: string[];
  currentIndex: number;
  isDark: boolean;
}

function HorizontalBarChart({
  data,
  labels,
  currentIndex,
  isDark,
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...data, 1);
  const defaultBarColor = isDark ? '#555' : '#D5D5D5';

  // 위→아래: 최근→과거 (1월, 12월, 11월, …)
  const reversed = [...data].reverse();
  const reversedLabels = [...labels].reverse();
  const reversedCurrentIndex = data.length - 1 - currentIndex;

  return (
    <View style={[
      chartStyles.chartContainer,
      { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface, paddingVertical: 16 },
    ]}>
      {reversed.map((value, index) => {
        const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const isActive = index === reversedCurrentIndex;
        const color = isActive ? BrandOrange : defaultBarColor;
        return (
          <View key={index} style={hBarStyles.row}>
            <ThemedText style={hBarStyles.label}>{reversedLabels[index]}</ThemedText>
            <View style={hBarStyles.barTrack}>
              <View
                style={[
                  hBarStyles.barFill,
                  {
                    width: `${Math.max(barWidth, 1)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <ThemedText
              style={[
                hBarStyles.value,
                isActive && { color: BrandOrange, fontWeight: '700' },
              ]}
            >
              {value}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 페이스 복합 차트 (바 + 라인)
// ---------------------------------------------------------------------------

interface PaceChartProps {
  data: typeof PACE_DATA;
  labels: string[];
  currentIndex: number;
  isDark: boolean;
}

function PaceChart({ data, labels, currentIndex, isDark }: PaceChartProps) {
  const chartHeight = 180;
  // 전체 범위를 구해서 비율 계산
  const allMin = Math.min(...data.map(d => d.min));
  const allMax = Math.max(...data.map(d => d.max));
  const range = allMax - allMin || 1;

  const defaultBarColor = isDark ? '#555' : '#D5D5D5';

  // 포지션 계산: 낮은 페이스(빠른) = 상단, 높은 페이스(느린) = 하단
  const toY = (val: number) => ((val - allMin) / range) * (chartHeight - 40);

  return (
    <View style={[
      chartStyles.chartContainer,
      { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface },
    ]}>
      <View style={[chartStyles.barsRow, { height: chartHeight, alignItems: 'flex-end' }]}>
        {data.map((d, index) => {
          const topY = toY(d.min);
          const bottomY = toY(d.max);
          const barH = Math.max(bottomY - topY, 6);
          const marginBottom = (chartHeight - 40) - bottomY;
          const isActive = index === currentIndex;
          const color = isActive ? BrandOrange : defaultBarColor;

          return (
            <View key={index} style={[chartStyles.barColumn, { justifyContent: 'flex-end' }]}>
              {/* 상단 페이스 값 (최고, 빠른) */}
              {isActive && (
                <ThemedText style={[paceStyles.paceLabel, { color: BrandOrange }]}>
                  {formatPace(d.min)}
                </ThemedText>
              )}
              <View
                style={[
                  chartStyles.bar,
                  {
                    height: barH,
                    backgroundColor: color,
                    marginBottom,
                    borderRadius: 4,
                  },
                ]}
              />
              {/* 하단 페이스 값 (최저, 느린) */}
              {isActive && (
                <ThemedText style={[paceStyles.paceLabel, { color: BrandOrange }]}>
                  {formatPace(d.max)}
                </ThemedText>
              )}
            </View>
          );
        })}
      </View>
      {/* 라인 커넥터 (간단한 도트 + 라인) */}
      <View style={paceStyles.lineOverlay} pointerEvents="none">
        {data.map((d, index) => {
          const avgPace = (d.min + d.max) / 2;
          const y = toY(avgPace);
          const leftPercent = ((index + 0.5) / data.length) * 100;
          return (
            <View
              key={index}
              style={[
                paceStyles.dot,
                {
                  left: `${leftPercent}%`,
                  bottom: (chartHeight - 40) - y + 10,
                  backgroundColor: isDark ? '#999' : '#999',
                },
              ]}
            />
          );
        })}
      </View>
      {/* 월 라벨 */}
      <View style={chartStyles.labelsRow}>
        {labels.map((label, index) => (
          <ThemedText key={index} style={chartStyles.monthLabel}>
            {label}
          </ThemedText>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 심박수 분포 100% 스택 가로 바 차트
// ---------------------------------------------------------------------------

interface HeartRateZoneChartProps {
  data: typeof HR_ZONE_DATA;
  isDark: boolean;
}

function HeartRateZoneChart({ data, isDark }: HeartRateZoneChartProps) {
  return (
    <View style={[
      chartStyles.chartContainer,
      { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface, paddingVertical: 12 },
    ]}>
      {data.map((row, rowIndex) => (
        <View key={rowIndex} style={zoneStyles.row}>
          <ThemedText style={zoneStyles.label}>{row.label}</ThemedText>
          <View style={zoneStyles.barTrack}>
            {row.zones.map((pct, zi) => (
              <View
                key={zi}
                style={[
                  zoneStyles.segment,
                  {
                    flex: pct,
                    backgroundColor: ZONE_COLORS[zi],
                  },
                ]}
              >
                {pct >= 8 && (
                  <ThemedText
                    lightColor="#333"
                    darkColor="#333"
                    style={zoneStyles.segmentText}
                  >
                    {pct}%
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
      {/* Zone 범례 */}
      <View style={zoneStyles.legendContainer}>
        {ZONE_LABELS.map((label, i) => (
          <View key={i} style={zoneStyles.legendItem}>
            <View style={[zoneStyles.legendDot, { backgroundColor: ZONE_COLORS[i] }]} />
            <ThemedText style={zoneStyles.legendText}>{label}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 섹션 카드 래퍼
// ---------------------------------------------------------------------------

interface SectionCardProps {
  title: string;
  badge?: { label: string; isUp: boolean } | null;
  collapsible?: boolean;
  children: React.ReactNode;
  isDark: boolean;
}

function SectionCard({
  title,
  badge,
  collapsible = false,
  children,
  isDark,
}: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <View style={sectionStyles.wrapper}>
      {/* 타이틀 행 */}
      <View style={sectionStyles.titleRow}>
        <ThemedText type="subtitle" style={sectionStyles.sectionTitle}>
          {title}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {badge && (
            <ThemedText
              style={[
                sectionStyles.badge,
                { color: badge.isUp ? '#2E7D32' : '#D32F2F' },
              ]}
            >
              {badge.isUp ? '↗' : '↘'} {badge.label}
            </ThemedText>
          )}
          {collapsible && (
            <Pressable onPress={() => setCollapsed(!collapsed)} hitSlop={12}>
              <ThemedText style={sectionStyles.collapseIcon}>
                {collapsed ? '+' : '-'}
              </ThemedText>
            </Pressable>
          )}
        </View>
      </View>
      {/* 내용 */}
      {!collapsed && children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// AI 코멘트 컴포넌트
// ---------------------------------------------------------------------------

function AIComment({ text }: { text: string }) {
  return (
    <ThemedText style={commentStyles.text}>{text}</ThemedText>
  );
}

// ===========================================================================
// 메인 화면
// ===========================================================================

export default function AnalyzeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [selectedMonth, setSelectedMonth] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);

  /** 월 선택 토글 (목업) */
  const cycleMonth = () => {
    setSelectedMonth((prev) => (prev + 1) % MONTH_OPTIONS.length);
  };

  const currentIndex = MONTHS.length - 1; // 마지막(1월)이 이번 달

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- 헤더 ---- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <ThemedText style={styles.backButton}>{'←'}</ThemedText>
            </Pressable>
            <ThemedText type="title" style={styles.pageTitle}>기록 분석</ThemedText>
          </View>
          <Pressable onPress={cycleMonth} hitSlop={8}>
            <ThemedText style={[styles.monthSelector, { color: theme.text }]}>
              {MONTH_OPTIONS[selectedMonth]} {'∨'}
            </ThemedText>
          </Pressable>
        </View>

        {/* ---- 섹션 1: 누적 거리 ---- */}
        <SectionCard
          title="누적 거리"
          badge={{ label: '15%', isUp: false }}
          isDark={isDark}
        >
          <AIComment
            text="1월의 총 달리기 거리는 123km에요! 이번 달은 회복에 집중하셨네요."
          />
          <VerticalBarChart
            data={DISTANCE_DATA}
            labels={MONTHS}
            currentIndex={currentIndex}
            isDark={isDark}
          />
        </SectionCard>

        {/* ---- 섹션 2: 달리기 횟수 ---- */}
        <SectionCard
          title="달리기 횟수"
          collapsible
          isDark={isDark}
        >
          <AIComment
            text={'1월의 총 달리기 횟수는 8회에요!\n횟수는 유지되었지만, 한 번 뛸 때 더 멀리 달리셨어요.'}
          />
          <VerticalBarChart
            data={RUN_COUNT_DATA}
            labels={MONTHS}
            currentIndex={currentIndex}
            isDark={isDark}
          />
        </SectionCard>

        {/* ---- 섹션 3: 누적 시간 ---- */}
        <SectionCard
          title="누적 시간"
          badge={{ label: '15%', isUp: true }}
          isDark={isDark}
        >
          <AIComment
            text={'1월의 총 누적 시간은 1시간 32분 53초에요!\n지구력이 부쩍 좋아졌네요.'}
          />
          <HorizontalBarChart
            data={TIME_DATA}
            labels={MONTHS}
            currentIndex={currentIndex}
            isDark={isDark}
          />
        </SectionCard>

        {/* ---- 섹션 4: 소비 칼로리 ---- */}
        <SectionCard
          title="소비 칼로리"
          isDark={isDark}
        >
          <AIComment
            text={'1월의 총 소비 칼로리 1000kcal에요!\n치킨 두마리에 해당하는 칼로리에요~'}
          />
          <VerticalBarChart
            data={CALORIE_DATA}
            labels={MONTHS}
            currentIndex={currentIndex}
            isDark={isDark}
          />
        </SectionCard>

        {/* ---- 섹션 5: 페이스 ---- */}
        <SectionCard
          title="페이스"
          badge={{ label: '15%', isUp: true }}
          isDark={isDark}
        >
          <AIComment
            text={'1월의 평균 페이스는 5\'42"에요.\n점점 속도에 탄력이 붙고 있어요'}
          />
          <PaceChart
            data={PACE_DATA}
            labels={MONTHS}
            currentIndex={currentIndex}
            isDark={isDark}
          />
        </SectionCard>

        {/* ---- 섹션 6: 심박수 분포 ---- */}
        <SectionCard
          title="심박수 분포"
          isDark={isDark}
        >
          <AIComment
            text={'1월의 훈련 강도를 Zone 별로 분석했어요.\nZone 2-3 중심의 안정적인 유산소 훈련에 집중하셨네요.'}
          />
          <HeartRateZoneChart data={HR_ZONE_DATA} isDark={isDark} />
        </SectionCard>

        {/* ---- 섹션 7: 종합 분석 ---- */}
        <View style={sectionStyles.wrapper}>
          <ThemedText type="subtitle" style={sectionStyles.sectionTitle}>
            종합 분석
          </ThemedText>

          {/* AI 페이스메이커 카드 */}
          <View
            style={[
              summaryStyles.card,
              { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface },
            ]}
          >
            <ThemedText style={summaryStyles.cardTitle}>
              이번 달은 '속도'보다 '지구력'에 집중하셨네요!
            </ThemedText>
            <ThemedText style={summaryStyles.cardBody}>
              {'누적 거리는 20% 늘었지만, 평균 페이스는 유지되었습니다. 특히 심박수 ZONE 5 비중이 낮아진 것으로 보아, 몸에 무리 주지 않고 기초 체력을 탄탄히 다지는 아주 영리한 한 달을 보내셨습니다.\n지구력이 충분히 올라왔으니, 다음 달에는 주 1회 정도 인터벌 훈련을 섞어 페이스 향상에 도전해 보는 건 어떨까요?'}
            </ThemedText>
            <View style={summaryStyles.pacemakerRow}>
              <ThemedText style={summaryStyles.pacemakerLabel}>당신의 페이스메이커</ThemedText>
              <View style={summaryStyles.robotIcon}>
                <ThemedText style={{ fontSize: 22 }}>{'🤖'}</ThemedText>
              </View>
            </View>
          </View>

          {/* 피드백 */}
          <View style={summaryStyles.feedbackContainer}>
            <ThemedText style={summaryStyles.feedbackPrompt}>
              더 좋은 기록 분석을 위해 피드백을 남겨주세요!
            </ThemedText>
            <View style={summaryStyles.feedbackButtons}>
              <Pressable
                onPress={() => setFeedback(feedback === 'good' ? null : 'good')}
                style={[
                  summaryStyles.feedbackBtn,
                  {
                    borderColor: feedback === 'good' ? BrandOrange : (isDark ? Colors.dark.border : Colors.light.border),
                    backgroundColor: feedback === 'good'
                      ? (isDark ? 'rgba(255,111,0,0.15)' : 'rgba(255,111,0,0.08)')
                      : 'transparent',
                  },
                ]}
              >
                <ThemedText style={summaryStyles.feedbackBtnText}>
                  {'👍 최고예요'}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setFeedback(feedback === 'bad' ? null : 'bad')}
                style={[
                  summaryStyles.feedbackBtn,
                  {
                    borderColor: feedback === 'bad' ? BrandOrange : (isDark ? Colors.dark.border : Colors.light.border),
                    backgroundColor: feedback === 'bad'
                      ? (isDark ? 'rgba(255,111,0,0.15)' : 'rgba(255,111,0,0.08)')
                      : 'transparent',
                  },
                ]}
              >
                <ThemedText style={summaryStyles.feedbackBtnText}>
                  {'👎 별로예요'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================================================
// 스타일
// ===========================================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  monthSelector: {
    fontSize: 16,
    fontWeight: '600',
  },
});

/** 섹션 카드 공통 */
const sectionStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  badge: {
    fontSize: 15,
    fontWeight: '700',
  },
  collapseIcon: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
});

/** AI 코멘트 */
const commentStyles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.85,
  },
});

/** 세로 바 차트 */
const chartStyles = StyleSheet.create({
  chartContainer: {
    borderRadius: 16,
    padding: 16,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 40,
    borderRadius: 4,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  monthLabel: {
    fontSize: 13,
    opacity: 0.6,
    flex: 1,
    textAlign: 'center',
  },
});

/** 가로 바 차트 */
const hBarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  label: {
    width: 40,
    fontSize: 13,
    opacity: 0.6,
  },
  barTrack: {
    flex: 1,
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
});

/** 페이스 차트 */
const paceStyles = StyleSheet.create({
  paceLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 2,
  },
  lineOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 40,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
  },
});

/** 심박수 Zone 차트 */
const zoneStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  label: {
    width: 42,
    fontSize: 13,
    opacity: 0.6,
  },
  barTrack: {
    flex: 1,
    height: 32,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    marginLeft: 8,
  },
  segment: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.7,
  },
});

/** 종합 분석 */
const summaryStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.85,
    marginBottom: 16,
  },
  pacemakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  pacemakerLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  robotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  feedbackPrompt: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackBtn: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  feedbackBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
