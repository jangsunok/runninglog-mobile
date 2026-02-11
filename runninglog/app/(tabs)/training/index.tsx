import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Colors, BrandOrange } from '@/constants/theme';

// ─── 목업 데이터 ───────────────────────────────────────────────
const MOCK_ACHIEVEMENTS = [
  {
    id: '5km',
    label: '5km',
    emoji: '\uD83E\uDD47',
    unlocked: true,
    isNewRecord: true,
    time: '15\uBD84 32\uCD08',
    date: '2026\uB144 1\uC6D4 31\uC77C 13:52',
  },
  {
    id: '10km',
    label: '10km',
    emoji: '\uD83E\uDD47',
    unlocked: true,
    isNewRecord: false,
    time: '15\uBD84 32\uCD08',
    date: '2026\uB144 1\uC6D4 31\uC77C 13:52',
  },
  {
    id: 'half',
    label: 'HALF',
    emoji: '\uD83E\uDD48',
    unlocked: false,
    isNewRecord: false,
    time: null,
    date: null,
  },
  {
    id: 'full',
    label: 'FULL',
    emoji: null,
    unlocked: false,
    isNewRecord: false,
    time: null,
    date: null,
  },
];

// ─── 목표 유형 세그먼트 ────────────────────────────────────────
type GoalType = 'distance' | 'time' | 'count';

const GOAL_SEGMENTS: { key: GoalType; icon: string; label: string }[] = [
  { key: 'distance', icon: '\uD83C\uDFC3', label: '\uAC70\uB9AC' },
  { key: 'time', icon: '\u23F1', label: '\uC2DC\uAC04' },
  { key: 'count', icon: '#', label: '\uD69F\uC218' },
];

const UNIT_MAP: Record<GoalType, string> = {
  distance: 'km',
  time: '\uC2DC\uAC04',
  count: '\uD68C',
};

const PLACEHOLDER_MAP: Record<GoalType, string> = {
  distance: '\uBAA9\uD45C \uAC70\uB9AC\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694',
  time: '\uBAA9\uD45C \uC2DC\uAC04\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694',
  count: '\uBAA9\uD45C \uD69F\uC218\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694',
};

const LABEL_MAP: Record<GoalType, string> = {
  distance: '\uBAA9\uD45C \uAC70\uB9AC',
  time: '\uBAA9\uD45C \uC2DC\uAC04',
  count: '\uBAA9\uD45C \uD69F\uC218',
};

// ─── 현재 월 표시 헬퍼 ─────────────────────────────────────────
function getCurrentMonthLabel(): string {
  const month = new Date().getMonth() + 1;
  return `${month}\uC6D4\uC758`;
}

// ═══════════════════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════════════════
export default function TrainingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // 목표 상태
  const [hasGoal, setHasGoal] = useState(true);
  const [goalText, setGoalText] = useState('500KM \uB2EC\uB9AC\uAE30');
  const [goalCurrent, setGoalCurrent] = useState(324);
  const [goalTarget, setGoalTarget] = useState(500);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);

  const monthLabel = getCurrentMonthLabel();
  const progressPercent = goalTarget > 0 ? Math.round((goalCurrent / goalTarget) * 100) : 0;

  // 목표 설정 완료 콜백
  const handleGoalSet = (type: GoalType, value: number) => {
    const unit = UNIT_MAP[type];
    setGoalText(`${value}${unit.toUpperCase()} \uB2EC\uB9AC\uAE30`);
    setGoalTarget(value);
    setGoalCurrent(0);
    setHasGoal(true);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 타이틀 */}
        <Text style={[styles.title, { color: colors.text }]}>{'\uD2B8\uB808\uC774\uB2DD'}</Text>

        {/* ── 목표 섹션 ── */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {monthLabel} {'\uBAA9\uD45C'}
        </Text>

        {hasGoal ? (
          /* 목표가 있는 상태 */
          <TouchableOpacity
            style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => setHasGoal(false)}
          >
            <Text style={[styles.goalTitle, { color: colors.text }]}>{goalText}</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                <Text style={{ color: BrandOrange, fontWeight: '700', fontSize: 18 }}>
                  {goalCurrent}
                </Text>
                <Text style={{ color: colors.icon }}> km / {goalTarget}km</Text>
              </Text>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>{progressPercent}%</Text>
              </View>
            </View>
            {/* 프로그레스 바 */}
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(progressPercent, 100)}%` },
                ]}
              />
            </View>
          </TouchableOpacity>
        ) : (
          /* 목표가 없는 상태 */
          <View
            style={[styles.goalCardEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.emptyGoalContent}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emptyGoalTitle, { color: colors.text }]}>
                  {'\uC544\uC9C1 \uC774\uB2EC\uC758 \uBAA9\uD45C\uAC00 \uC5C6\uC5B4\uC694'}
                </Text>
                <Text style={[styles.emptyGoalSub, { color: colors.icon }]}>
                  {'\uBAA9\uD45C\uB97C \uC124\uC815\uD574 \uBCF4\uC138\uC694'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.setGoalButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.setGoalButtonText}>{'\uBAA9\uD45C \uC124\uC815\uD558\uAE30'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── 업적 섹션 ── */}
        <View style={styles.achievementHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            {monthLabel} {'\uC5C5\uC801'}
          </Text>
          <TouchableOpacity
            style={[styles.pastButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.pastButtonText, { color: colors.text }]}>
              {'\uD83C\uDFC5'} {'\uC9C0\uB09C \uC5C5\uC801'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.achievementDesc, { color: colors.icon }]}>
          {'\uAC70\uB9AC\uB97C \uB2EC\uC131\uD558\uBA74 \uBA54\uB2EC\uC774 \uD65C\uC131\uD654\uB418\uBA70,\n\uD574\uB2F9 \uC6D4\uC758 \uCD5C\uACE0 \uAE30\uB85D\uC774 \uD45C\uC2DC\uB3FC\uC694.'}
        </Text>

        {/* 메달 그리드 */}
        <View style={styles.medalGrid}>
          {MOCK_ACHIEVEMENTS.map((medal) => (
            <MedalCard key={medal.id} medal={medal} colors={colors} />
          ))}
        </View>
      </ScrollView>

      {/* ── 목표 설정 모달 ── */}
      <GoalSettingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleGoalSet}
        colors={colors}
        colorScheme={colorScheme}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 메달 카드 컴포넌트
// ═══════════════════════════════════════════════════════════════
function MedalCard({
  medal,
  colors,
}: {
  medal: (typeof MOCK_ACHIEVEMENTS)[number];
  colors: (typeof Colors)['light'];
}) {
  const isLocked = !medal.unlocked;
  const isDisabled = !medal.unlocked && !medal.emoji;

  return (
    <View style={[styles.medalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* 메달 원형 아이콘 */}
      <View
        style={[
          styles.medalCircle,
          isDisabled && styles.medalCircleDisabled,
          isLocked && !isDisabled && styles.medalCircleLocked,
        ]}
      >
        {medal.emoji ? (
          <Text style={styles.medalEmoji}>{medal.emoji}</Text>
        ) : (
          <Text style={styles.medalEmojiDisabled}>{'\uD83D\uDD12'}</Text>
        )}
        {isLocked && medal.emoji && (
          <View style={styles.lockOverlay}>
            <Text style={{ fontSize: 18 }}>{'\uD83D\uDD12'}</Text>
          </View>
        )}
      </View>

      {/* 라벨 + 신기록 뱃지 */}
      <View style={styles.medalLabelRow}>
        <Text style={[styles.medalLabel, { color: colors.text }]}>{medal.label}</Text>
        {medal.isNewRecord && (
          <View style={styles.newRecordBadge}>
            <Text style={styles.newRecordText}>{'\uC2E0\uAE30\uB85D'}</Text>
          </View>
        )}
      </View>

      {/* 기록 */}
      <Text style={[styles.medalTime, { color: medal.time ? colors.text : colors.icon }]}>
        {medal.time ?? '\uAE30\uB85D \uC5C6\uC74C'}
      </Text>

      {/* 날짜 */}
      {medal.date && (
        <Text style={[styles.medalDate, { color: colors.icon }]}>{medal.date}</Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 목표 설정 모달
// ═══════════════════════════════════════════════════════════════
function GoalSettingModal({
  visible,
  onClose,
  onSubmit,
  colors,
  colorScheme,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: GoalType, value: number) => void;
  colors: (typeof Colors)['light'];
  colorScheme: 'light' | 'dark';
}) {
  const [selectedType, setSelectedType] = useState<GoalType>('distance');
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    const num = parseInt(inputValue, 10);
    if (!num || num <= 0) return;
    onSubmit(selectedType, num);
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
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {'\uC774\uB2EC\uC758 \uBAA9\uD45C \uC124\uC815'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.icon }]}>{'\u2715'}</Text>
            </TouchableOpacity>
          </View>

          {/* 세그먼트 컨트롤 */}
          <View style={styles.segmentRow}>
            {GOAL_SEGMENTS.map((seg) => {
              const isActive = selectedType === seg.key;
              return (
                <TouchableOpacity
                  key={seg.key}
                  style={[
                    styles.segmentButton,
                    { borderColor: colors.border },
                    isActive && styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedType(seg.key)}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      { color: isActive ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {seg.icon} {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 입력 필드 */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>
            {LABEL_MAP[selectedType]}
          </Text>
          <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={`${PLACEHOLDER_MAP[selectedType]} ${UNIT_MAP[selectedType]}`}
              placeholderTextColor={colors.icon}
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
              textAlign="right"
            />
            {inputValue.length > 0 && (
              <Text style={[styles.inputUnit, { color: colors.text }]}>
                {UNIT_MAP[selectedType]}
              </Text>
            )}
          </View>

          {/* 하단 버튼 */}
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { backgroundColor: colorScheme === 'dark' ? colors.surface : '#F0F0F0' }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>{'\uCDE8\uC18C'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{'\uC124\uC815\uD558\uAE30'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// 스타일
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  // ── 타이틀 ──
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },

  // ── 섹션 제목 ──
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  // ── 목표 카드 (있을 때) ──
  goalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  percentBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandOrange,
    borderRadius: 4,
  },

  // ── 목표 카드 (없을 때) ──
  goalCardEmpty: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
  },
  emptyGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyGoalTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyGoalSub: {
    fontSize: 13,
  },
  setGoalButton: {
    backgroundColor: BrandOrange,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── 업적 섹션 ──
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pastButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  achievementDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },

  // ── 메달 그리드 ──
  medalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // ── 메달 카드 ──
  medalCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: '45%',
  },
  medalCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  medalCircleDisabled: {
    backgroundColor: '#E0E0E0',
  },
  medalCircleLocked: {
    backgroundColor: '#F0F0F0',
  },
  medalEmoji: {
    fontSize: 40,
  },
  medalEmojiDisabled: {
    fontSize: 28,
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  medalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  medalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  newRecordBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newRecordText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  medalTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  medalDate: {
    fontSize: 11,
  },

  // ── 모달 ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
  },

  // ── 세그먼트 ──
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#1E1E1E',
    borderColor: '#1E1E1E',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── 입력 필드 ──
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '600',
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
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
  cancelButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: BrandOrange,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
