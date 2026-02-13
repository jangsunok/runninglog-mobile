import { View, Text, StyleSheet } from 'react-native';
import type { ViewProps } from 'react-native';

/** 웹에서는 지도 미지원 — 플레이스홀더 렌더링 */
export function MapView({ style, children, ...props }: ViewProps & Record<string, any>) {
  return (
    <View style={[styles.placeholder, style]} {...props}>
      <Text style={styles.text}>지도는 모바일에서만 지원됩니다</Text>
      {children}
    </View>
  );
}

export function Polyline(_props: any) {
  return null;
}

export function Marker({ children }: any) {
  return children ?? null;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
