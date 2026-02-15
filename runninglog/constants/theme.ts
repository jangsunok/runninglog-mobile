/**
 * 러닝로그 앱 테마
 * - 타겟: 30대 남성
 * - 무드: Modern, Precise, Sporty
 * - 브랜드 컬러: 주황 (#FF6F00) — 로고와 동일
 * - pen 디자인 변수 기반
 */

import { Platform } from 'react-native';

/** 브랜드 주황 (로고 컬러) — Sporty, 역동적 */
export const BrandOrange = '#FF6F00';
export const BrandOrangeLight = '#F5A66A';
export const BrandOrangeMuted = '#D4885A';

/** 추가 색상 */
export const AccentGreen = '#5CB88F';
export const AccentGreenLight = '#E8F5EE';
export const HeartRed = '#EF4444';
export const NeonGreen = '#00FF88';

const tintColorLight = BrandOrange;
const tintColorDark = BrandOrange;

export const Colors = {
  light: {
    text: '#0D0D0D',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#525252',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorLight,
    surface: '#F5F5F5',
    border: '#E5E5E5',
    lightGray: '#F3F4F6',
    darkGray: '#374151',
    mapDark: '#1F2937',
  },
  dark: {
    text: '#FAFAFA',
    textSecondary: '#A3A3A3',
    textTertiary: '#737373',
    background: '#0D0D0D',
    tint: tintColorDark,
    icon: '#A3A3A3',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorDark,
    surface: '#262626',
    border: '#404040',
    lightGray: '#262626',
    darkGray: '#D4D4D4',
    mapDark: '#1F2937',
  },
};

/** 커스텀 폰트 (Google Fonts) */
export const F = {
  // Inter — 본문, 레이블
  inter400: 'Inter_400Regular',
  inter500: 'Inter_500Medium',
  inter600: 'Inter_600SemiBold',
  inter700: 'Inter_700Bold',
  inter800: 'Inter_800ExtraBold',
  // Montserrat — 큰 숫자, 메트릭
  mont500: 'Montserrat_500Medium',
  mont700: 'Montserrat_700Bold',
  mont800: 'Montserrat_800ExtraBold',
  // Bebas Neue — 초대형 숫자
  bebas: 'BebasNeue_400Regular',
} as const;

/** 라이트 테마 색상 축약 (pen 디자인 기준) */
export const C = Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
