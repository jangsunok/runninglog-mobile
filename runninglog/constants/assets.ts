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
