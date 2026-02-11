/**
 * 러닝로그 앱 테마
 * - 타겟: 30대 남성
 * - 무드: Modern, Precise, Sporty
 * - 브랜드 컬러: 주황 (#FF6F00) — 로고와 동일
 */

import { Platform } from 'react-native';

/** 브랜드 주황 (로고 컬러) — Sporty, 역동적 */
export const BrandOrange = '#FF6F00';

const tintColorLight = BrandOrange;
const tintColorDark = BrandOrange;

export const Colors = {
  light: {
    text: '#0D0D0D',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#525252',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorLight,
    /** 카드/섹션 배경 — Precise 구분 */
    surface: '#F5F5F5',
    border: '#E5E5E5',
  },
  dark: {
    text: '#FAFAFA',
    background: '#0D0D0D',
    tint: tintColorDark,
    icon: '#A3A3A3',
    tabIconDefault: '#737373',
    tabIconSelected: tintColorDark,
    surface: '#171717',
    border: '#262626',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
