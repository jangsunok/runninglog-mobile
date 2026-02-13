import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  SafeAreaView,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { BrandOrange, AccentGreen, Colors } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Colors (pen design tokens)
// ---------------------------------------------------------------------------

const C = {
  text: '#0D0D0D',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E5E5E5',
  orange: BrandOrange,    // #FF6F00
  green: AccentGreen,     // #5CB88F
  barMuted: '#E5E5E5',
};

// ---------------------------------------------------------------------------
// Mock data (from pen design)
// ---------------------------------------------------------------------------

const PERIOD_LABELS = ['1주', '2주', '3주', '4주', '5주', '6주'];

const DISTANCE_DATA = [32, 28, 45, 38, 52, 41];     // km
const RUN_COUNT_DATA = [5, 4, 7, 6, 8, 5];          // 회
const TIME_DATA = [3.2, 2.8, 4.5, 3.8, 5.2, 4.1];  // hours
const CALORIE_DATA = [2100, 1800, 3200, 2600, 3500, 2800]; // kcal
const PACE_DATA = [5.5, 5.4, 5.3, 5.2, 5.1, 5.0];  // min/km

const AI_COMMENTS = {
  distance: '지난달보다 15km 더 달렸어요! 지구력이 부쩍 좋아졌네요.',
  runCount: '이번 달 총 22회! 거의 매일 달렸네요.',
  time: '이번 달 총 12시간을 달렸습니다. 꾸준함이 최고의 재능이에요.',
  calories: '총 15,000kcal 소모! 치킨 10마리 분량의 에너지를 태웠습니다.',
  pace: '평균 페이스가 10초 빨라졌어요. 점점 속도에 탄력이 붙고 있어요!',
};

const OVERALL_SUMMARY =
  '이번 달은 거리, 횟수, 시간 모두 골고루 성장한 균형 잡힌 한 달이었어요. ' +
  '특히 페이스가 꾸준히 개선되고 있어 지구력과 속도 모두 발전하고 있습니다. ' +
  '다음 달에는 주 1회 인터벌 훈련을 섞어보면 한 단계 더 도약할 수 있을 거예요!';

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function formatPace(val: number): string {
  const mins = Math.floor(val);
  const secs = Math.round((val - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

// ---------------------------------------------------------------------------
// BarChart component (pure View-based)
// ---------------------------------------------------------------------------

interface BarChartProps {
  data: number[];
  labels: string[];
  highlightIndex?: number;
  chartHeight?: number;
  barWidth?: number;
  formatValue?: (v: number) => string;
  barColor?: string;
  highlightColor?: string;
}

function BarChart({
  data,
  labels,
  highlightIndex = data.length - 1,
  chartHeight = 160,
  barWidth = 28,
  formatValue,
  barColor = C.barMuted,
  highlightColor = C.orange,
}: BarChartProps) {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={barChartStyles.container}>
      {/* Bars */}
      <View style={[barChartStyles.barsRow, { height: chartHeight }]}>
        {data.map((value, index) => {
          const barHeight = (value / maxValue) * (chartHeight - 24);
          const isHighlighted = index === highlightIndex;
          const color = isHighlighted ? highlightColor : barColor;
          const displayValue = formatValue ? formatValue(value) : String(value);

          return (
            <View key={index} style={barChartStyles.barColumn}>
              <Text
                style={[
                  barChartStyles.barValue,
                  isHighlighted && { color: C.orange, fontWeight: '700' },
                ]}
              >
                {displayValue}
              </Text>
              <View
                style={[
                  barChartStyles.bar,
                  {
                    height: Math.max(barHeight, 4),
                    width: barWidth,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={barChartStyles.labelsRow}>
        {labels.map((label, index) => (
          <Text key={index} style={barChartStyles.label}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section Card
// ---------------------------------------------------------------------------

interface SectionCardProps {
  title: string;
  aiComment: string;
  children: React.ReactNode;
}

function SectionCard({ title, aiComment, children }: SectionCardProps) {
  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.title}>{title}</Text>
      <Text style={cardStyles.aiComment}>{aiComment}</Text>
      {children}
    </View>
  );
}

// ===========================================================================
// Main Screen
// ===========================================================================

export default function AnalyzeScreen() {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backArrow}>{'<'}</Text>
            </Pressable>
            <Text style={styles.headerTitle}>기록 분석</Text>
          </View>
          <Text style={styles.headerMonth}>2025년 1월</Text>
        </View>

        {/* ---- Section 1: 누적 거리 ---- */}
        <SectionCard title="누적 거리" aiComment={AI_COMMENTS.distance}>
          <BarChart
            data={DISTANCE_DATA}
            labels={PERIOD_LABELS}
            formatValue={(v) => `${v}km`}
          />
        </SectionCard>

        {/* ---- Section 2: 달리기 횟수 ---- */}
        <SectionCard title="달리기 횟수" aiComment={AI_COMMENTS.runCount}>
          <BarChart
            data={RUN_COUNT_DATA}
            labels={PERIOD_LABELS}
            highlightColor={C.green}
            formatValue={(v) => `${v}회`}
          />
        </SectionCard>

        {/* ---- Section 3: 누적 시간 ---- */}
        <SectionCard title="누적 시간" aiComment={AI_COMMENTS.time}>
          <BarChart
            data={TIME_DATA}
            labels={PERIOD_LABELS}
            formatValue={(v) => `${v}h`}
          />
        </SectionCard>

        {/* ---- Section 4: 소비 칼로리 ---- */}
        <SectionCard title="소비 칼로리" aiComment={AI_COMMENTS.calories}>
          <BarChart
            data={CALORIE_DATA}
            labels={PERIOD_LABELS}
            formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
          />
        </SectionCard>

        {/* ---- Section 5: 페이스 ---- */}
        <SectionCard title="페이스" aiComment={AI_COMMENTS.pace}>
          <BarChart
            data={PACE_DATA}
            labels={PERIOD_LABELS}
            formatValue={(v) => formatPace(v)}
          />
        </SectionCard>

        {/* ---- 종합 분석 ---- */}
        <View style={overallStyles.card}>
          <Text style={overallStyles.title}>종합 분석</Text>
          <Text style={overallStyles.label}>AI 페이스메이커</Text>
          <Text style={overallStyles.body}>{OVERALL_SUMMARY}</Text>

          {/* Feedback */}
          <View style={overallStyles.feedbackRow}>
            <Text style={overallStyles.feedbackLabel}>
              이 분석이 도움이 되었나요?
            </Text>
            <View style={overallStyles.feedbackButtons}>
              <Pressable
                onPress={() => setFeedback(feedback === 'up' ? null : 'up')}
                style={[
                  overallStyles.feedbackBtn,
                  feedback === 'up' && overallStyles.feedbackBtnActive,
                ]}
              >
                <Text
                  style={[
                    overallStyles.feedbackBtnText,
                    feedback === 'up' && overallStyles.feedbackBtnTextActive,
                  ]}
                >
                  👍
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFeedback(feedback === 'down' ? null : 'down')}
                style={[
                  overallStyles.feedbackBtn,
                  feedback === 'down' && overallStyles.feedbackBtnActive,
                ]}
              >
                <Text
                  style={[
                    overallStyles.feedbackBtnText,
                    feedback === 'down' && overallStyles.feedbackBtnTextActive,
                  ]}
                >
                  👎
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===========================================================================
// Styles
// ===========================================================================

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: '600',
    color: C.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: C.text,
  },
  headerMonth: {
    fontSize: 14,
    color: C.textSecondary,
  },
});

// Section card styles
const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: C.background,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 6,
  },
  aiComment: {
    fontSize: 13,
    color: C.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 16,
  },
});

// Bar chart styles
const barChartStyles = StyleSheet.create({
  container: {
    marginTop: 4,
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
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '500',
    color: C.textTertiary,
    marginBottom: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: C.textTertiary,
    flex: 1,
    textAlign: 'center',
  },
});

// Overall analysis card styles
const overallStyles = StyleSheet.create({
  card: {
    backgroundColor: C.background,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.text,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: C.textSecondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: C.text,
    lineHeight: 22,
    marginBottom: 20,
  },
  feedbackRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 16,
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.surface,
  },
  feedbackBtnActive: {
    borderColor: C.orange,
    backgroundColor: 'rgba(255, 111, 0, 0.08)',
  },
  feedbackBtnText: {
    fontSize: 20,
  },
  feedbackBtnTextActive: {
    fontSize: 22,
  },
});
