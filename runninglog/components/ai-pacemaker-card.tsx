import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { C, F } from '@/constants/theme';
import { BotAvatar } from './bot-avatar';

interface Props {
  /** 본문 메시지 (여러 줄 가능) */
  message: string;
  /** 별도 타이틀 (분석 화면용, 없으면 메시지만 표시) */
  title?: string;
  /** 외부 스타일 (margin 등) */
  style?: StyleProp<ViewStyle>;
}

/** AI 페이스메이커 카드 — 홈/분석 공통 */
export function AIPacemakerCard({ message, title, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Text style={styles.body}>{message}</Text>
      <View style={styles.footer}>
        <Text style={styles.label}>당신의 페이스메이커</Text>
        <BotAvatar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: F.inter600,
    color: C.darkGray,
    lineHeight: 21,
  },
  body: {
    fontSize: 14,
    fontFamily: F.inter400,
    color: C.darkGray,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: F.inter600,
    color: C.darkGray,
  },
});
