import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { updateProfile } from '@/lib/api/auth';

type ThemeOption = 'system' | 'light' | 'dark';

const OPTIONS: { value: ThemeOption; label: string }[] = [
  { value: 'system', label: '시스템 설정에 맞춤' },
  { value: 'light', label: '라이트 모드' },
  { value: 'dark', label: '다크 모드' },
];

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [selected, setSelected] = useState<ThemeOption>('system');

  const handleSelect = async (value: ThemeOption) => {
    const prev = selected;
    setSelected(value);
    try {
      await updateProfile({ theme_preference: value });
    } catch {
      setSelected(prev); // 롤백
      Alert.alert('설정 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          테마 설정
        </ThemedText>
      </View>

      <View style={styles.content}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.radioRow}
            onPress={() => handleSelect(opt.value)}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: selected === opt.value ? BrandOrange : '#D1D5DB',
                  borderWidth: 2,
                },
              ]}
            >
              {selected === opt.value && (
                <View style={[styles.radioInner, { backgroundColor: BrandOrange }]} />
              )}
            </View>
            <ThemedText style={[styles.radioLabel, { fontFamily: F.inter500 }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  radioLabel: { fontSize: 16 },
});
