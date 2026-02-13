import { View, Image, StyleSheet } from 'react-native';
import { BrandOrange } from '@/constants/theme';

/** 봇 아바타 — 주황색 원 + 흰색 봇 아이콘 */
export function BotAvatar({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={require('@/assets/images/botIcon.png')}
        style={[styles.icon, { width: size / 2, height: size / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: BrandOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    tintColor: '#FFFFFF',
  },
});
