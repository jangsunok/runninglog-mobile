import { useRouter } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, Mail, MessageCircle, ExternalLink } from 'lucide-react-native';


import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SupportScreen() {
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
          고객센터
        </ThemedText>
      </View>

      <View style={styles.content}>
        <Pressable
          style={[styles.card, { borderColor: c.border }]}
          onPress={() => Linking.openURL('mailto:support@runninglog.life')}
        >
          <Mail size={24} color={BrandOrange} />
          <View style={styles.cardContent}>
            <ThemedText style={[styles.cardTitle, { fontFamily: F.inter600 }]}>
              이메일 문의
            </ThemedText>
            <ThemedText style={[styles.cardDesc, { color: c.textSecondary }]}>
              support@runninglog.life
            </ThemedText>
          </View>
          <ExternalLink size={18} color={c.textTertiary} />
        </Pressable>

        <Pressable style={[styles.card, { borderColor: c.border }]}>
          <MessageCircle size={24} color={BrandOrange} />
          <View style={styles.cardContent}>
            <ThemedText style={[styles.cardTitle, { fontFamily: F.inter600 }]}>
              자주 묻는 질문
            </ThemedText>
            <ThemedText style={[styles.cardDesc, { color: c.textSecondary }]}>
              FAQ에서 답변을 찾아보세요
            </ThemedText>
          </View>
          <ExternalLink size={18} color={c.textTertiary} />
        </Pressable>
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
  content: { padding: 20, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardContent: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 15 },
  cardDesc: { fontSize: 13 },
});
