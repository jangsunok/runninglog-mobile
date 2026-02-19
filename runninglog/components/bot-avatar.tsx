import { View, Image, StyleSheet } from 'react-native';
import { BrandOrange, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** 봇 아바타 — 라이트: 주황색 원, 다크: 다크 아웃라인 */
export function BotAvatar({ size = 32 }: { size?: number }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: isDark ? 'transparent' : BrandOrange,
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? theme.border : 'transparent',
        },
      ]}
    >
      <Image
        source={require('@/assets/images/botIcon.png')}
        style={[
          styles.icon,
          {
            width: size / 2,
            height: size / 2,
            tintColor: '#FFFFFF',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
  },
});
