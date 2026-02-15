/**
 * 러닝로그 앱 로고 및 공통 에셋
 * - 타겟: 30대 남성 / 무드: Modern, Precise, Sporty
 * - PNG: 앱 아이콘·스플래시·인앱 표시 (app.json 및 화면에서 사용)
 * - SVG: assets/images/runninglog.svg — 벡터 필요 시 react-native-svg-transformer 도입 후 사용
 */

export const Logo = {
  /** 인앱 로고 이미지 (expo-image 등에서 사용) */
  png: require('@/assets/images/runninglog.png'),
} as const;

/** 거리별 메달 에셋 (달성 / 미달성) */
export const Medals = {
  '5km': {
    on: require('@/assets/images/medals/medal_5km.png'),
  },
  '10km': {
    on: require('@/assets/images/medals/medal_10km.png'),
  },
  half: {
    on: require('@/assets/images/medals/medal_half.png'),
    off: require('@/assets/images/medals/medal_off_half.png'),
  },
  full: {
    on: require('@/assets/images/medals/medal_full.png'),
    off: require('@/assets/images/medals/medal_off_full.png'),
  },
} as const;
