/**
 * 위치 권한 온보딩 - 권한 요청 전 안내
 * - 러닝 기록을 위해 필요한 이유
 * - 개인정보 저장 안 함 안내
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BrandOrange } from '@/constants/theme';

const backgroundDark = '#0D0D0D';
const textDark = '#FAFAFA';
const textSecondary = '#6B7280';

interface LocationPermissionOnboardingProps {
  onRequest: () => void;
  onSkip?: () => void;
}

export function LocationPermissionOnboarding({ onRequest, onSkip }: LocationPermissionOnboardingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="location-on" size={56} color={BrandOrange} />
      </View>
      <Text style={styles.title}>위치 권한이 필요합니다</Text>
      <Text style={styles.body}>
        러닝 기록을 위해 이동 경로를 그리려면 위치 접근이 필요합니다.
      </Text>
      <Text style={styles.note}>
        위치 데이터는 서버에 저장하지 않으며, 기록 저장 시 로컬에서만 사용됩니다.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onRequest}
      >
        <Text style={styles.buttonText}>권한 허용하고 달리기 시작</Text>
      </Pressable>
      {onSkip && (
        <Pressable onPress={onSkip} style={styles.skip}>
          <Text style={styles.skipText}>나중에 하기</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundDark,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: textDark,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    backgroundColor: BrandOrange,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 260,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  skip: {
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    color: textSecondary,
    fontSize: 15,
  },
});
