/**
 * 앱 로딩 중 표시되는 스플래시 화면
 * - 로고, 멘트, 로딩 막대바
 */

import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Logo } from '@/constants/assets';

const SPLASH_MENTS = [
  // ── 자기 돌봄 ──
  '달리기는 나를 아끼는 가장 쉬운 방법이에요.',
  '오늘도 나를 위한 시간을 선물해주세요.',
  '달리는 동안만큼은 온전히 나에게 집중하는 시간이에요.',
  '운동화를 신는 것만으로도, 이미 나를 돌보고 있는 거예요.',

  // ── 꾸준함의 힘 ──
  '속도보다 꾸준함이 답이에요.',
  '매일의 가벼운 발걸음이 가장 큰 변화를 만들어요.',
  '오늘 한 걸음이 내일의 나를 만들어가고 있어요.',
  '작은 걸음이든, 긴 달리기든, 움직이는 모든 순간이 소중해요.',

  // ── 비교 금지 ──
  '당신의 페이스가 정답이에요.',
  '나만의 속도로 달리면 돼요. 그게 가장 멋진 페이스예요.',
  '어제의 나보다 오늘의 내가 조금 더 나아졌다면, 그걸로 충분해요.',

  // ── 따뜻한 격려 ──
  '오늘도 로기와 함께해요!',
  '달리고 싶을 때 언제든, 로기가 함께할게요.',
  '수고했어요. 달린 당신이 정말 멋져요.',
  '쉬는 것도 훈련이에요. 괜찮아요.',
];

function pickMent(): string {
  return SPLASH_MENTS[Math.floor(Math.random() * SPLASH_MENTS.length)];
}

const LOADING_BAR_WIDTH = 240;
const LOADING_BAR_HEIGHT = 6;

export function SplashLoadingScreen() {
  const progress = useSharedValue(0);
  const [ment] = useState(pickMent);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, [progress]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Image
        source={Logo.png}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="러닝로그 로고"
      />
      <Text style={styles.ment} numberOfLines={2}>
        {ment}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barAnimatedStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    paddingHorizontal: 32,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  ment: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FAFAFA',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  barTrack: {
    width: LOADING_BAR_WIDTH,
    height: LOADING_BAR_HEIGHT,
    borderRadius: LOADING_BAR_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: LOADING_BAR_HEIGHT / 2,
    backgroundColor: '#FAFAFA',
  },
});
