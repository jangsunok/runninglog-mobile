import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BotAvatar } from './bot-avatar';

type ThemeColors = (typeof Colors)['light'];

interface Props {
  /** 본문 메시지 (여러 줄 가능) */
  message: string;
  /** 별도 타이틀 (분석 화면용, 없으면 메시지만 표시) */
  title?: string;
  /** 외부 스타일 (margin 등) */
  style?: StyleProp<ViewStyle>;
  /** 테마 색상 (미전달 시 시스템 다크/라이트 자동 적용) */
  theme?: ThemeColors;
}

/** AI 페이스메이커 카드 — 홈/분석 공통 */
export function AIPacemakerCard({ message, title, style, theme: themeProp }: Props) {
  const colorScheme = useColorScheme();
  const theme = themeProp ?? Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }, style]}>
      {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
      <Text style={[styles.body, { color: theme.text }]}>{message}</Text>
      <View style={styles.footer}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>당신의 페이스메이커 로기</Text>
        <BotAvatar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 14,
    fontFamily: F.inter600,
    lineHeight: 21,
  },
  body: {
    fontSize: 14,
    fontFamily: F.inter400,
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
  },
});
