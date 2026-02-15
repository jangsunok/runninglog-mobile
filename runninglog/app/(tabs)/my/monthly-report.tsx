import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Medal, Share2, Trophy } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';

import { F } from '@/constants/theme';

// ─── 색상 ───
const DARK_BG = '#1A1A2E';
const CARD_BG = '#252540';
const METRIC_BG = '#2A2A45';
const ACCENT = '#FF6F00';
const ACCENT_DIM = 'rgba(255, 111, 0, 0.12)';
const TEXT_W = '#FFFFFF';
const TEXT_S = '#A0A0B8';
const TEXT_M = '#6C6C80';
const GREEN = '#4ADE80';
const RED = '#F87171';

const BADGE_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const TOTAL_STEPS = 5;
const CTA_DELAY = [600, 900, 1300, 1800];
const { width: SCREEN_W } = Dimensions.get('window');

// ─── 에셋 ───
const GIFT_BOX_IMAGE = require('@/assets/images/gift-box-medal.png');
const GOLD_MEDAL_IMAGE = require('@/assets/images/gold-medal.png');

// ─── 공통 훅 ───
function useDelayedLoop(delayMs: number) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  return active;
}

// ─── 목업 데이터 ───
const MOCK = {
  year: 2025,
  month: 2,
  monthLabel: '2월',
  metrics: [
    { label: '총 달린 거리', value: '123.4', unit: 'km', change: '↑ 15%', up: true },
    { label: '평균 페이스', value: "5'10\"", unit: '/km', change: '↓ 20초', up: true },
    { label: '총 러닝 횟수', value: '18', unit: '회', change: '↑ 20%', up: true },
    { label: '최장 거리', value: '21.1', unit: 'km', change: '↑ 3.2km', up: true },
  ],
  goalRate: 120,
  badges: [
    { name: '10km 완주 달성', desc: '단일 러닝 10km 이상 완주' },
    { name: '주 4회 러너', desc: '한 주에 4회 이상 러닝 완료' },
    { name: '새벽 러너', desc: '오전 6시 이전 러닝 3회 달성' },
  ],
  bestDay: {
    date: '2월 15일',
    desc: '역대 10km 최고 기록 달성!',
    time: '48:30',
    pace: "(4'51\"/km)",
  },
};

// ──────────────────────────────────────────────
// 공통 버튼 컴포넌트
// ──────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost';

function FunnelButton({
  label,
  variant = 'primary',
  icon,
  onPress,
  style,
}: {
  label: string;
  variant?: BtnVariant;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: object;
}) {
  return (
    <Pressable
      style={[
        styles.btn,
        variant === 'primary' && styles.btnPrimary,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        style,
      ]}
      onPress={onPress}
    >
      {icon}
      <Text
        style={[
          styles.btnLabel,
          variant === 'primary' && styles.btnLabelPrimary,
          variant === 'secondary' && styles.btnLabelSecondary,
          variant === 'ghost' && styles.btnLabelGhost,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ──────────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────────
export default function MonthlyReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const next = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.topBar}>
        <View style={{ width: 24 }} />
        <Pressable onPress={close} hitSlop={12}>
          <X size={22} color={TEXT_S} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <AnimatePresence exitBeforeEnter>
          {step === 0 && <StepIntro key="intro" />}
          {step === 1 && <StepMetrics key="metrics" />}
          {step === 2 && <StepBadges key="badges" />}
          {step === 3 && <StepBestDay key="bestday" />}
          {step === 4 && <StepFinish key="finish" />}
        </AnimatePresence>
      </View>

      <View style={styles.bottomArea}>
        {step < TOTAL_STEPS - 1 ? (
          <MotiView
            key={`cta-${step}`}
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350, delay: CTA_DELAY[step] }}
          >
            <FunnelButton
              label={step === 0 ? '이번 달 결과 확인하기' : '다음'}
              onPress={next}
            />
          </MotiView>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}
      </View>
    </View>
  );
}

// ──────────────────────────────────────────────
// Step 0: 인트로 — 느린 시네마틱 등장
// ──────────────────────────────────────────────
function StepIntro() {
  const float = useDelayedLoop(900);

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.stepCenter}
    >
      {/* 라벨 */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 100 }}
      >
        <Text style={styles.introLabel}>MONTHLY REPORT</Text>
      </MotiView>

      {/* 날짜 */}
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 250 }}
      >
        <Text style={styles.introDate}>
          {MOCK.year}년 {MOCK.monthLabel} 마이 러닝
        </Text>
      </MotiView>

      {/* 타이틀 */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 450, delay: 400, easing: Easing.out(Easing.cubic) }}
      >
        <Text style={styles.introTitle}>선물 도착!</Text>
      </MotiView>

      {/* 서브 */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 400, delay: 550 }}
      >
        <Text style={styles.introSub}>이달 결과를 확인하세요</Text>
      </MotiView>

      {/* 선물상자 — 부드러운 등장 + 미세 부유 */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{
          opacity: 1,
          translateY: float ? -4 : 0,
        }}
        transition={{
          type: 'timing',
          duration: 500,
          delay: 300,
          easing: Easing.out(Easing.cubic),
          translateY: float
            ? { type: 'timing', duration: 1800, easing: Easing.inOut(Easing.sin), loop: true }
            : { type: 'timing', duration: 500, delay: 300, easing: Easing.out(Easing.cubic) },
        }}
        style={styles.giftArea}
      >
        <Image
          source={GIFT_BOX_IMAGE}
          style={styles.giftImage}
          contentFit="contain"
        />
      </MotiView>
    </MotiView>
  );
}

// ──────────────────────────────────────────────
// Step 1: 기록 요약 — 빠르고 스냅감 있게
// ──────────────────────────────────────────────
function StepMetrics() {
  const dirs = [-20, 20, -20, 20];

  return (
    <MotiView
      from={{ opacity: 0, translateX: 40 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 300, easing: Easing.out(Easing.cubic) }}
      style={styles.stepFill}
    >
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: 80 }}
      >
        <Text style={styles.sectionTitle}>눈부신 성과를 거뒀어요 🔥</Text>
      </MotiView>

      <View style={styles.metricsGrid}>
        {MOCK.metrics.map((m, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: dirs[i] }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: 'timing',
              duration: 350,
              delay: 150 + i * 80,
              easing: Easing.out(Easing.cubic),
            }}
          >
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {m.value}
                <Text style={styles.metricUnit}> {m.unit}</Text>
              </Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              {m.change !== '' && (
                <Text style={[styles.metricChange, { color: m.up ? GREEN : RED }]}>
                  전월대비 {m.change}
                </Text>
              )}
            </View>
          </MotiView>
        ))}
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 350, delay: 550, easing: Easing.out(Easing.cubic) }}
      >
        <View style={styles.goalPill}>
          <Text style={styles.goalText}>
            목표 달성률{' '}
            <Text style={styles.goalHighlight}>{MOCK.goalRate}%</Text>
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
}

// ──────────────────────────────────────────────
// Step 2: 획득 배지 — 위에서 떨어지는 메달 + 느긋한 리스트
// ──────────────────────────────────────────────
function StepBadges() {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 250 }}
      style={styles.stepFill}
    >
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 50 }}
      >
        <Text style={styles.sectionTitle}>{MOCK.monthLabel}의 빛나는 순간 ⭐</Text>
      </MotiView>

      {/* 메달 — 위에서 떨어지며 바운스 */}
      <View style={styles.badgeMedals}>
        {MOCK.badges.map((_, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateY: -60, rotate: `${-15 + i * 15}deg` }}
            animate={{ opacity: 1, translateY: 0, rotate: '0deg' }}
            transition={{
              type: 'spring',
              damping: 11,
              stiffness: 120,
              mass: 0.8,
              delay: 200 + i * 200,
            }}
          >
            <View style={[styles.badgeMedalCircle, { borderColor: BADGE_COLORS[i] }]}>
              <Medal size={32} color={BADGE_COLORS[i]} />
            </View>
          </MotiView>
        ))}
      </View>

      {/* 배지 리스트 — 좌측에서 부드럽게 */}
      <View style={styles.badgeList}>
        {MOCK.badges.map((badge, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: 'timing',
              duration: 450,
              delay: 700 + i * 150,
              easing: Easing.out(Easing.exp),
            }}
          >
            <View style={styles.badgeRow}>
              <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[i] }]} />
              <View style={styles.badgeInfo}>
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
              </View>
            </View>
          </MotiView>
        ))}
      </View>
    </MotiView>
  );
}

// ──────────────────────────────────────────────
// Step 3: 최고의 하루 — 드라마틱 타임 리빌
// ──────────────────────────────────────────────
function StepBestDay() {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={styles.stepCenter}
    >
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 600, delay: 100 }}
      >
        <Text style={styles.sectionTitle}>자신 빛나는 순간 ✨</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 300, easing: Easing.out(Easing.cubic) }}
        style={{ width: '100%' }}
      >
        <View style={styles.bestDayCard}>
          {/* 날짜 */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 500 }}
          >
            <Text style={styles.bestDate}>{MOCK.bestDay.date}</Text>
          </MotiView>

          {/* 성취 */}
          <MotiView
            from={{ opacity: 0, translateX: 20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 650 }}
          >
            <Text style={styles.bestDesc}>{MOCK.bestDay.desc}</Text>
          </MotiView>

          {/* 시간 */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 900,
              easing: Easing.out(Easing.cubic),
            }}
          >
            <Text style={styles.bestTime}>{MOCK.bestDay.time}</Text>
          </MotiView>

          {/* 페이스 */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 1300 }}
          >
            <Text style={styles.bestPace}>완주 기록 {MOCK.bestDay.pace}</Text>
          </MotiView>
        </View>
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 600, delay: 1500 }}
      >
        <Text style={styles.bestMotivation}>
          이런 멋진 기록, 다음 달에도 기대돼요!
        </Text>
      </MotiView>
    </MotiView>
  );
}

// ──────────────────────────────────────────────
// Step 4: 완주 축하 — 공유 카드
// ──────────────────────────────────────────────
function StepFinish() {
  const router = useRouter();

  const handleShare = useCallback(async () => {
    const m = MOCK;
    const badges = m.badges.map((b) => `🏅 ${b.name}`).join('\n');
    try {
      await Share.share({
        message: [
          `📊 ${m.year}년 ${m.monthLabel} 러닝 리포트`,
          '',
          `🏃 총 거리  ${m.metrics[0].value}km`,
          `⏱ 베스트  ${m.bestDay.time}`,
          `📅 러닝 횟수  ${m.metrics[2].value}회`,
          '',
          badges,
          '',
          '#RunningLog #월간결산 #러닝기록',
        ].join('\n'),
      });
    } catch {
      // 공유 취소
    }
  }, []);

  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={styles.stepCenter}
    >
      {/* 축하 타이틀 */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 100, easing: Easing.out(Easing.cubic) }}
      >
        <Text style={styles.finishTitle}>
          {MOCK.monthLabel}, 정말 멋졌어요!
        </Text>
      </MotiView>

      {/* 공유 카드 (캡처 대상) */}
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 450, delay: 350, easing: Easing.out(Easing.cubic) }}
        style={{ width: '100%' }}
      >
        <View style={styles.shareCard}>
            {/* 상단 라벨 */}
            <Text style={styles.shareCardLabel}>MONTHLY REPORT</Text>

            {/* 메달 + 월 */}
            <View style={styles.shareCardHero}>
              <Image
                source={GOLD_MEDAL_IMAGE}
                style={styles.shareCardMedal}
                contentFit="contain"
              />
              <Text style={styles.shareCardMonth}>
                {MOCK.year}.{String(MOCK.month).padStart(2, '0')}
              </Text>
            </View>

            {/* 핵심 지표 */}
            <View style={styles.shareCardStats}>
              <View style={styles.shareCardStatItem}>
                <Text style={styles.shareCardStatValue}>{MOCK.metrics[0].value}</Text>
                <Text style={styles.shareCardStatUnit}>km</Text>
              </View>
              <View style={styles.shareCardDivider} />
              <View style={styles.shareCardStatItem}>
                <Text style={styles.shareCardStatValue}>{MOCK.metrics[2].value}</Text>
                <Text style={styles.shareCardStatUnit}>runs</Text>
              </View>
              <View style={styles.shareCardDivider} />
              <View style={styles.shareCardStatItem}>
                <Text style={styles.shareCardStatValue}>{MOCK.bestDay.time}</Text>
                <Text style={styles.shareCardStatUnit}>best</Text>
              </View>
            </View>

            {/* 배지 요약 */}
            <View style={styles.shareCardBadges}>
              {MOCK.badges.map((b, i) => (
                <View key={i} style={styles.shareCardBadgeChip}>
                  <Trophy size={11} color={BADGE_COLORS[i]} />
                  <Text style={styles.shareCardBadgeText}>{b.name}</Text>
                </View>
              ))}
            </View>

            {/* 브랜딩 */}
            <Text style={styles.shareCardBrand}>RunningLog</Text>
          </View>
      </MotiView>

      {/* 안내 */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 350, delay: 650 }}
      >
        <Text style={styles.shareSubtext}>나의 기록을 이미지로 공유해보세요</Text>
      </MotiView>

      {/* 공유 버튼 */}
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 350, delay: 800, easing: Easing.out(Easing.cubic) }}
        style={{ width: '100%' }}
      >
        <FunnelButton
          label="이미지로 공유하기"
          icon={<Share2 size={16} color={TEXT_W} />}
          onPress={handleShare}
        />
      </MotiView>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 300, delay: 1000 }}
      >
        <FunnelButton
          label="닫기"
          variant="ghost"
          onPress={() => router.back()}
        />
      </MotiView>
    </MotiView>
  );
}

// ──────────────────────────────────────────────
// 스타일
// ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  btnPlaceholder: {
    height: 66,
  },
  stepCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stepFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 24,
  },

  // 버튼
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 16,
    marginBottom: 10,
  },
  btnPrimary: { backgroundColor: ACCENT },
  btnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  btnGhost: { backgroundColor: 'transparent', height: 44 },
  btnLabel: { fontSize: 16 },
  btnLabelPrimary: { fontFamily: F.inter700, color: TEXT_W },
  btnLabelSecondary: { fontFamily: F.inter600, color: TEXT_S },
  btnLabelGhost: { fontFamily: F.inter500, color: TEXT_M, fontSize: 14 },

  sectionTitle: {
    fontFamily: F.inter700,
    fontSize: 22,
    color: TEXT_W,
    marginBottom: 24,
  },

  // 인트로
  introLabel: {
    fontFamily: F.mont700,
    fontSize: 12,
    color: TEXT_M,
    letterSpacing: 3,
    marginBottom: 4,
    textAlign: 'center',
  },
  introDate: {
    fontFamily: F.inter500,
    fontSize: 14,
    color: TEXT_S,
    marginBottom: 32,
    textAlign: 'center',
  },
  introTitle: {
    fontFamily: F.inter700,
    fontSize: 36,
    color: ACCENT,
    marginBottom: 8,
    textAlign: 'center',
  },
  introSub: {
    fontFamily: F.inter500,
    fontSize: 16,
    color: TEXT_S,
    marginBottom: 16,
    textAlign: 'center',
  },
  giftArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  giftImage: {
    width: 220,
    height: 220,
  },

  // 기록 요약
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: METRIC_BG,
    borderRadius: 14,
    padding: 18,
    width: (SCREEN_W - 48 - 12) / 2,
  },
  metricValue: {
    fontFamily: F.mont800,
    fontSize: 28,
    color: TEXT_W,
    marginBottom: 4,
  },
  metricUnit: {
    fontFamily: F.mont700,
    fontSize: 14,
    color: TEXT_S,
  },
  metricLabel: {
    fontFamily: F.inter500,
    fontSize: 12,
    color: TEXT_S,
    marginBottom: 6,
  },
  metricChange: { fontFamily: F.inter600, fontSize: 11 },
  goalPill: {
    alignSelf: 'center',
    marginTop: 24,
    backgroundColor: ACCENT_DIM,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 111, 0, 0.2)',
  },
  goalText: { fontFamily: F.inter600, fontSize: 14, color: TEXT_S },
  goalHighlight: { fontFamily: F.mont700, color: ACCENT },

  // 배지
  badgeMedals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 32,
  },
  badgeMedalCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    backgroundColor: METRIC_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeList: { gap: 20 },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  badgeDot: { width: 10, height: 10, borderRadius: 5 },
  badgeInfo: { flex: 1 },
  badgeName: {
    fontFamily: F.inter600,
    fontSize: 16,
    color: TEXT_W,
    marginBottom: 2,
  },
  badgeDesc: { fontFamily: F.inter500, fontSize: 13, color: TEXT_S },

  // 최고의 하루
  bestDayCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  bestDate: {
    fontFamily: F.inter600,
    fontSize: 16,
    color: TEXT_S,
    marginBottom: 6,
  },
  bestDesc: {
    fontFamily: F.inter600,
    fontSize: 15,
    color: ACCENT,
    marginBottom: 20,
  },
  bestTime: {
    fontFamily: F.mont800,
    fontSize: 56,
    color: TEXT_W,
    marginBottom: 4,
  },
  bestPace: { fontFamily: F.inter500, fontSize: 14, color: TEXT_S },
  bestMotivation: {
    fontFamily: F.inter500,
    fontSize: 14,
    color: TEXT_M,
    textAlign: 'center',
  },

  // 완주 축하
  finishTitle: {
    fontFamily: F.inter700,
    fontSize: 26,
    color: TEXT_W,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 24,
  },
  shareCard: {
    width: '100%',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  shareCardLabel: {
    fontFamily: F.mont700,
    fontSize: 10,
    color: TEXT_M,
    letterSpacing: 3,
    marginBottom: 16,
  },
  shareCardHero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shareCardMedal: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  shareCardMonth: {
    fontFamily: F.mont800,
    fontSize: 20,
    color: TEXT_W,
  },
  shareCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  shareCardStatItem: {
    alignItems: 'center',
  },
  shareCardStatValue: {
    fontFamily: F.mont800,
    fontSize: 24,
    color: TEXT_W,
  },
  shareCardStatUnit: {
    fontFamily: F.inter500,
    fontSize: 11,
    color: TEXT_S,
    marginTop: 2,
  },
  shareCardDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  shareCardBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  shareCardBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: METRIC_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  shareCardBadgeText: {
    fontFamily: F.inter500,
    fontSize: 11,
    color: TEXT_S,
  },
  shareCardBrand: {
    fontFamily: F.mont700,
    fontSize: 11,
    color: TEXT_M,
    letterSpacing: 1,
  },
  shareSubtext: {
    fontFamily: F.inter500,
    fontSize: 13,
    color: TEXT_M,
    marginBottom: 20,
  },
});
