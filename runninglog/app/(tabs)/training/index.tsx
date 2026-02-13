import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BrandOrange, AccentGreen } from '@/constants/theme';

// ─── 목업 데이터 ───────────────────────────────────────────────
const MOCK_ACHIEVEMENTS = [
  {
    id: '5km',
    label: '5km',
    medalText: '5KM',
    unlocked: true,
    isNewRecord: true,
    time: '15분 32초',
    date: '2025년 1월 31일 13:52',
  },
  {
    id: '10km',
    label: '10km',
    medalText: '10KM',
    unlocked: true,
    isNewRecord: false,
    time: '15분 32초',
    date: '2025년 1월 31일 19:32',
  },
  {
    id: 'half',
    label: 'HALF',
    medalText: 'HALF',
    unlocked: false,
    isNewRecord: false,
    time: null,
    date: null,
  },
  {
    id: 'full',
    label: 'FULL',
    medalText: 'FULL',
    unlocked: false,
    isNewRecord: false,
    time: null,
    date: null,
  },
];

// ─── 목표 유형 세그먼트 ────────────────────────────────────────
type GoalType = 'distance' | 'time' | 'count';

const GOAL_SEGMENTS: { key: GoalType; icon: keyof typeof MaterialIcons.glyphMap; label: string }[] = [
  { key: 'distance', icon: 'route', label: '거리' },
  { key: 'time', icon: 'schedule', label: '시간' },
  { key: 'count', icon: 'tag', label: '횟수' },
];

const UNIT_MAP: Record<GoalType, string> = {
  distance: 'km',
  time: '시간',
  count: '회',
};

const PLACEHOLDER_MAP: Record<GoalType, string> = {
  distance: '목표 거리를 입력해주세요',
  time: '목표 시간을 입력해주세요',
  count: '목표 횟수를 입력해주세요',
};

const LABEL_MAP: Record<GoalType, string> = {
  distance: '목표 거리',
  time: '목표 시간',
  count: '목표 횟수',
};

// ─── 현재 월 표시 헬퍼 ─────────────────────────────────────────
function getCurrentMonthLabel(): string {
  const month = new Date().getMonth() + 1;
  return `${month}월의`;
}

// ═══════════════════════════════════════════════════════════════
// 메인 화면
// ═══════════════════════════════════════════════════════════════
export default function TrainingScreen() {
  // 목표 상태
  const [hasGoal, setHasGoal] = useState(true);
  const [goalText, setGoalText] = useState('500KM 달리기');
  const [goalCurrent, setGoalCurrent] = useState(324);
  const [goalTarget, setGoalTarget] = useState(500);

  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);

  const monthLabel = getCurrentMonthLabel();
  const progressPercent = goalTarget > 0 ? Math.round((goalCurrent / goalTarget) * 100) : 0;

  // 목표 설정 완료 콜백
  const handleGoalSet = (type: GoalType, value: number) => {
    const unit = UNIT_MAP[type];
    setGoalText(`${value}${unit.toUpperCase()} 달리기`);
    setGoalTarget(value);
    setGoalCurrent(0);
    setHasGoal(true);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 헤더 ── */}
        <View style={styles.header}>
          <Text style={styles.title}>트레이닝</Text>
        </View>

        {/* ── 목표 섹션 ── */}
        <View style={styles.goalSection}>
          <Text style={styles.sectionTitle}>{monthLabel} 목표</Text>

          {hasGoal ? (
            <TouchableOpacity
              style={styles.goalCard}
              activeOpacity={0.7}
              onPress={() => setHasGoal(false)}
            >
              <Text style={styles.goalTitle}>{goalText}</Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(progressPercent, 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {goalCurrent} km / {goalTarget}km
                </Text>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>{progressPercent}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.goalCardEmpty}>
              <TouchableOpacity
                style={styles.setGoalButton}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.setGoalButtonText}>목표 설정하기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 업적 섹션 ── */}
        <View style={styles.achievementSection}>
          <View style={styles.achievementHeader}>
            <Text style={styles.sectionTitle}>{monthLabel} 업적</Text>
            <TouchableOpacity style={styles.pastButton}>
              <MaterialIcons name="emoji-events" size={16} color="#0D0D0D" />
              <Text style={styles.pastButtonText}>지난 업적</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.achievementDesc}>
            거리를 달성하면 메달이 활성화되며, 해당 월의 최고 기록이 표시됩니다.
          </Text>

          {/* 메달 그리드 */}
          <View style={styles.medalGrid}>
            {MOCK_ACHIEVEMENTS.map((medal) => (
              <MedalCard key={medal.id} medal={medal} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── 목표 설정 모달 ── */}
      <GoalSettingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleGoalSet}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// 메달 카드 컴포넌트
// ═══════════════════════════════════════════════════════════════
function MedalCard({
  medal,
}: {
  medal: (typeof MOCK_ACHIEVEMENTS)[number];
}) {
  const isLocked = !medal.unlocked;

  return (
    <View style={styles.medalCard}>
      {/* 메달 원형 */}
      {isLocked ? (
        <View style={styles.medalCircleLocked}>
          <View style={styles.lockOverlay}>
            <MaterialIcons name="lock" size={32} color="#9CA3AF" />
          </View>
        </View>
      ) : (
        <View style={styles.medalCircleGold}>
          <Text style={styles.medalCircleText}>{medal.medalText}</Text>
        </View>
      )}

      {/* 라벨 + 신기록 뱃지 */}
      <View style={styles.medalLabelRow}>
        <Text style={styles.medalLabel}>{medal.label}</Text>
        {medal.isNewRecord && (
          <View style={styles.newRecordBadge}>
            <Text style={styles.newRecordText}>신기록</Text>
          </View>
        )}
      </View>

      {/* 기록 */}
      <Text style={[styles.medalTime, isLocked && styles.medalTimeLocked]}>
        {medal.time ?? '기록 없음'}
      </Text>

      {/* 날짜 */}
      {medal.date ? (
        <Text style={styles.medalDate}>{medal.date}</Text>
      ) : null}
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
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: GoalType, value: number) => void;
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
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>이달의 목표 설정</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
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
                    isActive && styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedType(seg.key)}
                >
                  <MaterialIcons
                    name={seg.icon}
                    size={16}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                    style={styles.segmentIcon}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      isActive && styles.segmentTextActive,
                    ]}
                  >
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 입력 필드 */}
          <Text style={styles.inputLabel}>{LABEL_MAP[selectedType]}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={PLACEHOLDER_MAP[selectedType]}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Text style={styles.inputUnit}>{UNIT_MAP[selectedType]}</Text>
          </View>

          {/* 하단 버튼 */}
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>설정하기</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── 헤더 ──
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0D0D0D',
  },

  // ── 섹션 제목 ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0D0D',
  },

  // ── 목표 섹션 ──
  goalSection: {
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  // ── 목표 카드 (있을 때) ──
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#0D0D0D',
  },
  percentBadge: {
    backgroundColor: BrandOrange,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  percentText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: BrandOrange,
    borderRadius: 4,
  },

  // ── 목표 카드 (없을 때) ──
  goalCardEmpty: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  setGoalButton: {
    backgroundColor: BrandOrange,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  setGoalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── 업적 섹션 ──
  achievementSection: {
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pastButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D0D0D',
  },
  achievementDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
  },

  // ── 메달 그리드 ──
  medalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  // ── 메달 카드 ──
  medalCard: {
    width: '47%',
    flexGrow: 1,
    flexBasis: '45%',
    alignItems: 'center',
    paddingVertical: 16,
  },

  // ── 메달 원형 (금색 - 달성) ──
  medalCircleGold: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F5A66A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    // gradient-like 효과를 위한 border
    borderWidth: 4,
    borderColor: BrandOrange,
  },
  medalCircleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  // ── 메달 원형 (잠김) ──
  medalCircleLocked: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  lockOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#0D0D0D',
  },
  newRecordBadge: {
    backgroundColor: AccentGreen,
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
    color: '#0D0D0D',
    marginBottom: 2,
  },
  medalTimeLocked: {
    color: '#6B7280',
  },
  medalDate: {
    fontSize: 11,
    color: '#6B7280',
  },

  // ── 모달 ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    color: '#0D0D0D',
  },
  closeButton: {
    padding: 4,
  },

  // ── 세그먼트 ──
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  segmentButtonActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  segmentIcon: {
    marginRight: 4,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },

  // ── 입력 필드 ──
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0D0D0D',
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0D0D0D',
  },
  inputUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 8,
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
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
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
