import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LICENSES = [
  { name: 'React Native', license: 'MIT', url: 'https://github.com/facebook/react-native' },
  { name: 'Expo', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Expo Router', license: 'MIT', url: 'https://github.com/expo/router' },
  { name: 'React Navigation', license: 'MIT', url: 'https://github.com/react-navigation/react-navigation' },
  { name: 'Lucide React Native', license: 'ISC', url: 'https://github.com/lucide-icons/lucide' },
  { name: 'React Native Reanimated', license: 'MIT', url: 'https://github.com/software-mansion/react-native-reanimated' },
  { name: 'React Native Gesture Handler', license: 'MIT', url: 'https://github.com/software-mansion/react-native-gesture-handler' },
  { name: 'React Native Maps', license: 'MIT', url: 'https://github.com/react-native-maps/react-native-maps' },
  { name: 'React Native SVG', license: 'MIT', url: 'https://github.com/software-mansion/react-native-svg' },
  { name: 'React Native Safe Area Context', license: 'MIT', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
  { name: 'React Native Screens', license: 'MIT', url: 'https://github.com/software-mansion/react-native-screens' },
  { name: 'React Native Toast Message', license: 'MIT', url: 'https://github.com/calintamas/react-native-toast-message' },
  { name: 'React Native WebView', license: 'MIT', url: 'https://github.com/nicejin/react-native-webview' },
  { name: 'React Native MMKV', license: 'MIT', url: 'https://github.com/mrousavy/react-native-mmkv' },
  { name: 'React Native Health Connect', license: 'MIT', url: 'https://github.com/matinzd/react-native-health-connect' },
  { name: 'Expo Image', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Expo Location', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Expo Linear Gradient', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Expo Blur', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Expo Secure Store', license: 'MIT', url: 'https://github.com/expo/expo' },
  { name: 'Naver Map', license: 'MIT', url: 'https://github.com/mj-studio-library/react-native-naver-map' },
  { name: 'Kakao SDK', license: 'MIT', url: 'https://github.com/millo-L/react-native-kakao' },
  { name: 'Zustand', license: 'MIT', url: 'https://github.com/pmndrs/zustand' },
];

export default function LicensesScreen() {
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
          오픈소스 라이선스
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {LICENSES.map((item, idx) => (
          <View
            key={idx}
            style={[styles.row, idx < LICENSES.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.lightGray }]}
          >
            <ThemedText style={[styles.name, { fontFamily: F.inter500 }]}>
              {item.name}
            </ThemedText>
            <ThemedText style={[styles.license, { color: c.textTertiary }]}>
              {item.license}
            </ThemedText>
          </View>
        ))}
      </ScrollView>
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
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  name: { fontSize: 15 },
  license: { fontSize: 13 },
});
