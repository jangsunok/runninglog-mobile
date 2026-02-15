import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ITEMS = [
  { label: '서비스 이용약관', route: '/(auth)/privacy-policy' },
  { label: '개인정보 처리방침', route: '/(auth)/privacy-policy' },
  { label: '위치기반서비스 이용약관', route: '/(auth)/privacy-policy' },
  { label: '오픈소스 라이선스', route: '/(auth)/privacy-policy' },
];

export default function TermsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          약관 및 정책
        </ThemedText>
      </View>

      <View style={styles.content}>
        {ITEMS.map((item, idx) => (
          <Pressable
            key={idx}
            style={styles.menuRow}
            onPress={() => router.push(item.route as any)}
          >
            <ThemedText style={[styles.menuLabel, { fontFamily: F.inter500 }]}>
              {item.label}
            </ThemedText>
            <ChevronRight size={20} color={c.textTertiary} />
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
  content: { paddingHorizontal: 20 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  menuLabel: { fontSize: 16 },
});
