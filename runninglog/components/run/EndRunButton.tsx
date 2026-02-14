/**
 * 종료 버튼 — 3초 이상 길게 눌러야 동작
 * - 원형 프로그레스 바 + 중앙 숫자(3 → 2 → 1) 표시
 * - 3초 경과 시 onComplete 호출
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BrandOrange } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 48;
const STROKE = 4;
const R = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

interface EndRunButtonProps {
  onComplete: () => void;
  disabled?: boolean;
  style?: object;
}

export function EndRunButton({
  onComplete,
  disabled = false,
  style,
}: EndRunButtonProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const progress = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCountdown(null);
    progress.value = withTiming(0, { duration: 150 });
  }, [progress]);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    setCountdown(3);
    progress.value = 0;

    const start = Date.now();
    const durationMs = 3000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / durationMs, 1);
      progress.value = p;

      const secsLeft = Math.ceil((durationMs - elapsed) / 1000);
      setCountdown(secsLeft > 0 ? secsLeft : null);

      if (elapsed >= durationMs) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        progress.value = 0;
        onComplete();
      }
    }, 80);
  }, [disabled, onComplete, progress]);

  const handlePressOut = useCallback(() => {
    reset();
  }, [reset]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = CIRCUMFERENCE * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const isCounting = countdown !== null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && !isCounting && { opacity: 0.8 },
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {isCounting ? (
        <View style={styles.circleWrap}>
          <Svg width={SIZE} height={SIZE} style={styles.svg}>
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={STROKE}
              fill="transparent"
            />
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={R}
              stroke="#FFFFFF"
              strokeWidth={STROKE}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        </View>
      ) : (
        <MaterialIcons name="stop" size={24} color="#FFFFFF" />
      )}
      <Text style={styles.label}>종료</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
    backgroundColor: BrandOrange,
  },
  circleWrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  countdownBadge: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
