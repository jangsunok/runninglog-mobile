import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ExternalLink, Crown } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SubscriptionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          결제 및 구독 관리
        </ThemedText>
      </View>

      <View style={styles.content}>
        {/* Plan Card */}
        <View style={[styles.planCard, { backgroundColor: c.lightGray }]}>
          <View style={styles.planHeader}>
            <View style={styles.planTitleRow}>
              <Crown size={20} color={BrandOrange} />
              <ThemedText style={[styles.planName, { fontFamily: F.inter700 }]}>
                Free Plan
              </ThemedText>
            </View>
            <View style={[styles.planBadge, { backgroundColor: c.surface }]}>
              <ThemedText style={[styles.planBadgeText, { color: c.textSecondary }]}>
                현재 플랜
              </ThemedText>
            </View>
          </View>

          <View style={[styles.planDivider, { backgroundColor: c.border }]} />

          <View style={styles.planDetail}>
            <ThemedText style={[styles.planDetailLabel, { color: c.textSecondary }]}>
              다음 결제일
            </ThemedText>
            <ThemedText style={[styles.planDetailValue, { fontFamily: F.inter600 }]}>
              -
            </ThemedText>
          </View>
        </View>

        {/* Manage Button */}
        <Pressable style={[styles.manageBtn, { backgroundColor: BrandOrange }]}>
          <ThemedText style={styles.manageBtnText}>구독 관리하기</ThemedText>
          <ExternalLink size={18} color="#FFFFFF" />
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
  content: { padding: 20, gap: 24 },
  planCard: { borderRadius: 16, padding: 24, gap: 16 },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planName: { fontSize: 18 },
  planBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  planBadgeText: { fontSize: 12, fontWeight: '500' },
  planDivider: { height: 1 },
  planDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planDetailLabel: { fontSize: 14 },
  planDetailValue: { fontSize: 14 },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 12,
  },
  manageBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
