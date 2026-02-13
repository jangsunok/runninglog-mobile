/**
 * 위치 권한 거절 시 안내 UI
 * - 기능 제한 안내
 * - 설정으로 이동 버튼
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BrandOrange } from '@/constants/theme';
import { openAppSettings } from '@/hooks/useLocationPermission';

const backgroundDark = '#0D0D0D';
const textDark = '#FAFAFA';
const textSecondary = '#6B7280';

interface LocationPermissionDeniedProps {
  onOpenSettings?: () => void;
}

export function LocationPermissionDenied({ onOpenSettings }: LocationPermissionDeniedProps) {
  const handleOpenSettings = () => {
    if (onOpenSettings) onOpenSettings();
    else openAppSettings();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialIcons name="location-off" size={56} color={textSecondary} />
      </View>
      <Text style={styles.title}>위치 권한이 꺼져 있습니다</Text>
      <Text style={styles.body}>
        위치 권한을 허용해야 러닝 경로를 기록할 수 있습니다.{'\n'}
        설정에서 ‘위치’를 켜 주세요.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleOpenSettings}
      >
        <Text style={styles.buttonText}>설정으로 이동</Text>
        <MaterialIcons name="settings" size={20} color="#FFFFFF" />
      </Pressable>
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
    color: textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BrandOrange,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
