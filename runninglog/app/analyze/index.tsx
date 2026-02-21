import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandOrange, Colors, C, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AIPacemakerCard } from '@/components/ai-pacemaker-card';

type Theme = typeof Colors.light;

// ─── 목업 데이터 ──────────────────────────────────────────────
const MONTH_LABELS = ['8월', '9월', '10월', '11월', '12월', '1월'];
const CURRENT_MONTH_IDX = 5;

const DISTANCE_DATA = { values: [87, 0, 133, 110, 150, 123], unit: 'km' };
const RUN_COUNT_DATA = { values: [3, 0, 7, 4, 10, 8], unit: '회' };
const TIME_DATA = {
  labels: ['1월', '12월', '11월', '10월', '9월', '8월'],
  values: [8, 10, 4, 7, 0, 3],
  unit: 'h',
};
const CALORIE_DATA = { values: [87, 0, 133, 110, 150, 123], unit: 'kcal' };

const PACE_DATA = [
  { min: 5.7, max: 6.37 },
  { min: 5.3, max: 6.1 },
  { min: 4.8, max: 6.0 },
  { min: 5.2, max: 6.2 },
  { min: 5.0, max: 6.37 },
  { min: 5.7, max: 6.37 },
];

const ZONE_DATA = [
  { month: '8월', zones: [12, 43, 34, 5, 6] },
  { month: '9월', zones: [12, 43, 34, 5, 6] },
  { month: '10월', zones: [12, 43, 34, 5, 6] },
  { month: '11월', zones: [12, 43, 34, 5, 6] },
  { month: '12월', zones: [12, 43, 34, 5, 6] },
];

const ZONE_COLORS = ['#D4D4D4', '#7BC67E', '#FACC15', '#FB923C', '#EF4444'];
const ZONE_LABELS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
const ZONE_DESCS = ['회복', '유산소 (지방연소)', '템포', '역치', '최대 강도'];

const AI_COMMENTS: Record<string, string> = {
  distance: '1월의 총 달리기 거리는 123km에요!\n이번 달은 회복에 집중하셨네요.',
  runCount: '1월의 총 달리기 횟수는 8회에요!\n횟수는 유지되었지만, 한 번 뛸 때 더 멀리 달리셨어요.',
  time: '1월의 총 누적 시간은 1시간 32분 53초에요!\n지구력이 부쩍 좋아졌네요.',
  calories: '1월의 총 소비 칼로리 1000kcal에요!\n치킨 두마리에 해당하는 칼로리에요~',
  pace: '1월의 평균 페이스는 5\' 42" 에요.\n점점 속도에 탄력이 붙고 있어요',
  zone: '1월의 훈련 강도를 Zone 별로 분석했어요.\nZone 2-3 중심의 안정적인 유산소 훈련에 집중하셨네요.',
};

const OVERALL_TITLE = '이번 달은 \'속도\'보다 \'지구력\'에 집중하셨네요!';
const OVERALL_BODY =
  '누적 거리는 20% 늘었지만, 평균 페이스는 유지되었습니다. 특히 심박수 Zone 5 비중이 낮아진 것으로 보아, 몸에 무리 주지 않고 기초 체력을 탄탄히 다지는 아주 영리한 한 달을 보내셨습니다.\n지구력이 충분히 올라왔으니, 다음 달에는 주 1회 정도 인터벌 훈련을 섞어 페이스 향상에 도전해 보는 건 어떨까요?';

// ─── 유틸 ─────────────────────────────────────────────────────
function formatPace(val: number): string {
  const mins = Math.floor(val);
  const secs = Math.round((val - mins) * 60);
  return `${mins}'${secs.toString().padStart(2, '0')}"`;
}

// ═══════════════════════════════════════════════════════════════
// 세로 바 차트
// ═══════════════════════════════════════════════════════════════
function VerticalBarChart({
  data,
  labels,
  highlightIdx = data.length - 1,
  height = 140,
  formatVal,
  theme,
}: {
  data: number[];
  labels: string[];
  highlightIdx?: number;
  height?: number;
  formatVal?: (v: number) => string;
  theme: Theme;
}) {
  const maxVal = Math.max(...data, 1);
  return (
    <View style={[chartS.graphCard, { borderColor: theme.surface }]}>
      <View style={[chartS.barsRow, { height }]}>
        {data.map((v, i) => {
          const barH = (v / maxVal) * (height - 24);
          const hl = i === highlightIdx;
          return (
            <View key={i} style={chartS.barCol}>
              <Text style={[chartS.barVal, { color: theme.textTertiary }, hl && chartS.barValHl]}>
                {formatVal ? formatVal(v) : String(v)}
              </Text>
              {hl ? (
                <LinearGradient
                  colors={['#FFB74D', BrandOrange]}
                  style={[chartS.bar, { height: Math.max(barH, 4) }]}
                />
              ) : (
                <View style={[chartS.bar, { height: Math.max(barH, 4), backgroundColor: theme.border }]} />
              )}
            </View>
          );
        })}
      </View>
      <View style={chartS.labelsRow}>
        {labels.map((l, i) => (
          <Text key={i} style={[chartS.label, { color: theme.textTertiary }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 가로 바 차트 (누적 시간)
// ═══════════════════════════════════════════════════════════════
function HorizontalBarChart({
  data,
  labels,
  highlightIdx = 0,
  formatVal,
  theme,
}: {
  data: number[];
  labels: string[];
  highlightIdx?: number;
  formatVal?: (v: number) => string;
  theme: Theme;
}) {
  const maxVal = Math.max(...data, 1);
  return (
    <View style={[chartS.graphCard, { borderColor: theme.surface }]}>
      {data.map((v, i) => {
        const hl = i === highlightIdx;
        const barW = `${Math.max((v / maxVal) * 100, 2)}%`;
        return (
          <View key={i} style={hbarS.row}>
            <Text style={[hbarS.label, { color: theme.textTertiary }]}>{labels[i]}</Text>
            <View style={hbarS.track}>
              {hl ? (
                <LinearGradient
                  colors={['#FFB74D', BrandOrange]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[hbarS.bar, { width: barW as any }]}
                />
              ) : (
                <View style={[hbarS.bar, { width: barW as any, backgroundColor: theme.border }]} />
              )}
            </View>
            <Text style={[hbarS.val, { color: theme.textTertiary }, hl && { color: BrandOrange }]}>
              {formatVal ? formatVal(v) : String(v)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 페이스 레인지 바 차트
// ═══════════════════════════════════════════════════════════════
function PaceChart({
  data,
  labels,
  highlightIdx = data.length - 1,
  height = 140,
  theme,
}: {
  data: { min: number; max: number }[];
  labels: string[];
  highlightIdx?: number;
  height?: number;
  theme: Theme;
}) {
  const globalMin = Math.min(...data.map((d) => d.min));
  const globalMax = Math.max(...data.map((d) => d.max));
  const range = globalMax - globalMin || 1;

  return (
    <View style={[chartS.graphCard, { borderColor: theme.surface }]}>
      <View style={[chartS.barsRow, { height }]}>
        {data.map((d, i) => {
          const hl = i === highlightIdx;
          const top = ((d.min - globalMin) / range) * (height - 40);
          const barH = ((d.max - d.min) / range) * (height - 40);
          return (
            <View key={i} style={[chartS.barCol, { justifyContent: 'flex-end' }]}>
              <View style={{ height: height - 20, justifyContent: 'flex-start' }}>
                <View style={{ marginTop: top }}>
                  <Text style={[paceS.minLabel, { color: theme.border }, hl && { color: BrandOrange }]}>
                    {formatPace(d.min)}
                  </Text>
                  {hl ? (
                    <LinearGradient
                      colors={['#FFB74D', BrandOrange]}
                      style={[paceS.rangeBar, { height: Math.max(barH, 8) }]}
                    />
                  ) : (
                    <View style={[paceS.rangeBar, { height: Math.max(barH, 8), backgroundColor: theme.border }]} />
                  )}
                  <Text style={[paceS.maxLabel, { color: theme.border }, hl && { color: BrandOrange }]}>
                    {formatPace(d.max)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <View style={chartS.labelsRow}>
        {labels.map((l, i) => (
          <Text key={i} style={[chartS.label, { color: theme.textTertiary }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 심박수 존 차트
// ═══════════════════════════════════════════════════════════════
function ZoneChart({
  data,
  theme,
}: {
  data: { month: string; zones: number[] }[];
  theme: Theme;
}) {
  return (
    <View style={[chartS.graphCard, { borderColor: theme.surface }]}>
      {data.map((row, i) => {
        const total = row.zones.reduce((a, b) => a + b, 0) || 1;
        return (
          <View key={i} style={zoneS.row}>
            <Text style={[zoneS.monthLabel, { color: theme.textTertiary }]}>{row.month}</Text>
            <View style={zoneS.barTrack}>
              {row.zones.map((z, zi) => {
                const pct = Math.round((z / total) * 100);
                return (
                  <View
                    key={zi}
                    style={[
                      zoneS.zoneSegment,
                      {
                        flex: z / total,
                        backgroundColor: ZONE_COLORS[zi],
                      },
                      zi === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                      zi === row.zones.length - 1 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
                    ]}
                  >
                    {pct >= 8 && (
                      <Text style={[zoneS.segmentText, zi <= 2 && { color: '#555' }]}>{pct}%</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
      {/* 범례 */}
      <View style={zoneS.legend}>
        {ZONE_LABELS.map((label, i) => (
          <View key={i} style={zoneS.legendItem}>
            <View style={[zoneS.legendDot, { backgroundColor: ZONE_COLORS[i] }]} />
            <Text style={[zoneS.legendText, { color: theme.text }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════════════════
export default function AnalyzeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <MaterialIcons name="chevron-left" size={28} color={theme.text} />
            </Pressable>
            <Text style={[s.headerTitle, { color: theme.text }]}>기록 분석</Text>
          </View>
          <View style={s.monthSelector}>
            <Text style={[s.monthText, { color: theme.text }]}>2025년 1월</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.textSecondary} />
          </View>
        </View>

        {/* ── 메인 메트릭스 ── */}
        <View style={s.mainMetrics}>
          <Text style={[s.mainMetricsLabel, { color: theme.textSecondary }]}>누적 거리</Text>
          <View style={s.mainMetricsRow}>
            <Text style={s.mainMetricsValue}>
              {DISTANCE_DATA.values[CURRENT_MONTH_IDX]}
            </Text>
            <Text style={[s.mainMetricsUnit, { color: theme.text }]}>km</Text>
          </View>
        </View>

        <View style={[s.splitCard, { backgroundColor: theme.lightGray }]}>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: theme.text }]}>{RUN_COUNT_DATA.values[CURRENT_MONTH_IDX]}</Text>
            <Text style={[s.splitLabel, { color: theme.textSecondary }]}>횟수</Text>
          </View>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: theme.text }]}>5:12:13</Text>
            <Text style={[s.splitLabel, { color: theme.textSecondary }]}>누적 시간</Text>
          </View>
          <View style={s.splitItem}>
            <Text style={[s.splitValue, { color: theme.text }]}>5'24"</Text>
            <Text style={[s.splitLabel, { color: theme.textSecondary }]}>평균 페이스</Text>
          </View>
        </View>

        {/* ── 섹션들 ── */}
        <View style={s.sections}>

          {/* 1. 누적 거리 */}
          <Section title="누적 거리" comment={AI_COMMENTS.distance} theme={theme}>
            <VerticalBarChart
              data={DISTANCE_DATA.values}
              labels={MONTH_LABELS}
              highlightIdx={CURRENT_MONTH_IDX}
              theme={theme}
            />
          </Section>

          {/* 2. 달리기 횟수 */}
          <Section title="달리기 횟수" comment={AI_COMMENTS.runCount} theme={theme}>
            <VerticalBarChart
              data={RUN_COUNT_DATA.values}
              labels={MONTH_LABELS}
              highlightIdx={CURRENT_MONTH_IDX}
              theme={theme}
            />
          </Section>

          {/* 3. 누적 시간 */}
          <Section title="누적 시간" comment={AI_COMMENTS.time} theme={theme}>
            <HorizontalBarChart
              data={TIME_DATA.values}
              labels={TIME_DATA.labels}
              highlightIdx={0}
              formatVal={(v) => `${v}h`}
              theme={theme}
            />
          </Section>

          {/* 4. 소비 칼로리 */}
          <Section title="소비 칼로리" comment={AI_COMMENTS.calories} theme={theme}>
            <VerticalBarChart
              data={CALORIE_DATA.values}
              labels={MONTH_LABELS}
              highlightIdx={CURRENT_MONTH_IDX}
              theme={theme}
            />
          </Section>

          {/* 5. 페이스 */}
          <Section title="페이스" comment={AI_COMMENTS.pace} theme={theme}>
            <PaceChart
              data={PACE_DATA}
              labels={MONTH_LABELS}
              highlightIdx={CURRENT_MONTH_IDX}
              theme={theme}
            />
          </Section>

          {/* 6. 심박수 분포 */}
          <Section title="심박수 분포" comment={AI_COMMENTS.zone} theme={theme}>
            <ZoneChart data={ZONE_DATA} theme={theme} />
          </Section>

          {/* 7. 종합 분석 */}
          <View>
            <Text style={[s.sectionTitle, { color: theme.text }]}>종합 분석</Text>
            <AIPacemakerCard
              title={OVERALL_TITLE}
              message={OVERALL_BODY}
              style={{ marginTop: 8 }}
              theme={theme}
            />
          </View>

          {/* 8. 피드백 */}
          <View style={[s.feedbackCard, { borderColor: theme.surface }]}>
            <Text style={[s.feedbackText, { color: theme.text }]}>
              더 좋은 기록 분석을 위해 피드백을 남겨주세요!
            </Text>
            <View style={s.feedbackRow}>
              <Pressable
                style={[s.feedbackBtn, { borderColor: theme.border, backgroundColor: theme.lightGray }, feedback === 'up' && s.feedbackBtnActive]}
                onPress={() => setFeedback(feedback === 'up' ? null : 'up')}
              >
                <MaterialIcons
                  name="thumb-up"
                  size={16}
                  color={feedback === 'up' ? BrandOrange : theme.textSecondary}
                />
                <Text style={[s.feedbackBtnText, { color: theme.darkGray }, feedback === 'up' && { color: BrandOrange }]}>
                  최고예요
                </Text>
              </Pressable>
              <Pressable
                style={[s.feedbackBtn, { borderColor: theme.border, backgroundColor: theme.lightGray }, feedback === 'down' && s.feedbackBtnActive]}
                onPress={() => setFeedback(feedback === 'down' ? null : 'down')}
              >
                <MaterialIcons
                  name="thumb-down"
                  size={16}
                  color={feedback === 'down' ? BrandOrange : theme.textSecondary}
                />
                <Text style={[s.feedbackBtnText, { color: theme.darkGray }, feedback === 'down' && { color: BrandOrange }]}>
                  별로예요
                </Text>
              </Pressable>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// 섹션 래퍼
// ═══════════════════════════════════════════════════════════════
function Section({
  title,
  comment,
  children,
  theme,
}: {
  title: string;
  comment: string;
  children: React.ReactNode;
  theme: Theme;
}) {
  return (
    <View>
      <Text style={[s.sectionTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[s.sectionComment, { color: theme.text }]}>{comment}</Text>
      {children}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 스타일
// ═══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: 28, fontFamily: F.inter700 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText: { fontSize: 16, fontFamily: F.inter600 },

  // 메인 메트릭스
  mainMetrics: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    paddingBottom: 4,
  },
  mainMetricsLabel: { fontSize: 12, fontFamily: F.inter500 },
  mainMetricsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  mainMetricsValue: { fontSize: 30, fontFamily: F.mont800, color: BrandOrange },
  mainMetricsUnit: { fontSize: 24, fontFamily: F.inter500 },

  // 3열 요약 카드
  splitCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
  },
  splitItem: { alignItems: 'center', gap: 2 },
  splitValue: { fontSize: 24, fontFamily: F.mont700 },
  splitLabel: { fontSize: 12, fontFamily: F.inter500 },

  // 섹션 컨테이너
  sections: { gap: 24, paddingHorizontal: 20, paddingTop: 8 },

  // 섹션 제목 & 코멘트
  sectionTitle: { fontSize: 18, fontFamily: F.inter700, marginBottom: 4 },
  sectionComment: { fontSize: 14, fontFamily: F.inter400, lineHeight: 21, marginBottom: 12 },

  // 피드백
  feedbackCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  feedbackText: { fontSize: 12 },
  feedbackRow: { flexDirection: 'row', gap: 16 },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    height: 32,
  },
  feedbackBtnActive: { borderColor: BrandOrange, backgroundColor: 'rgba(255,111,0,0.06)' },
  feedbackBtnText: { fontSize: 14, fontFamily: F.inter500 },
});

// 차트 공통
const chartS = StyleSheet.create({
  graphCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 28, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barVal: { fontSize: 12, marginBottom: 4 },
  barValHl: { color: BrandOrange, fontFamily: F.mont700 },
  labelsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  label: { fontSize: 12, flex: 1, textAlign: 'center' },
});

// 가로 바
const hbarS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { width: 35, fontSize: 12, fontFamily: F.inter600 },
  track: {
    flex: 1,
    height: 24,
    backgroundColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: { height: 24, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  val: { width: 30, fontSize: 12, textAlign: 'right', marginLeft: 8 },
});

// 페이스 차트
const paceS = StyleSheet.create({
  minLabel: { fontSize: 10, fontFamily: F.inter500, textAlign: 'center' },
  maxLabel: { fontSize: 10, fontFamily: F.inter500, textAlign: 'center' },
  rangeBar: { width: 28, borderRadius: 4, alignSelf: 'center' },
});

// 심박수 존
const zoneS = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  monthLabel: { width: 30, fontSize: 12, fontFamily: F.inter600 },
  barTrack: { flex: 1, flexDirection: 'row', height: 28 },
  zoneSegment: { height: 28, justifyContent: 'center', alignItems: 'center' },
  segmentText: { fontSize: 10, fontFamily: F.inter600, color: '#FFFFFF' },
  legend: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, fontFamily: F.inter600, width: 48 },
  legendDesc: { fontSize: 12 },
});
