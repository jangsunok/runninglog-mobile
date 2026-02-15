import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Switch, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/lib/api/notification-settings';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [pushEnabled, setPushEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [nightPushEnabled, setNightPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await getNotificationSettings();
      setPushEnabled(data.push_enabled);
      setMarketingEnabled(data.marketing_enabled);
      setNightPushEnabled(data.night_push_enabled);
    } catch {
      // 기본값 유지
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = async (
    key: 'push_enabled' | 'marketing_enabled' | 'night_push_enabled',
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    setter(value);
    try {
      await updateNotificationSettings({ [key]: value });
    } catch {
      setter(!value);
      Toast.show({ type: 'error', text1: '설정 변경에 실패했어요. 다시 시도해주세요.' });
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BrandOrange} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          알림 및 동의 설정
        </ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.toggleRow}>
          <ThemedText style={[styles.toggleLabel, { fontFamily: F.inter500 }]}>
            전체 푸시 알림
          </ThemedText>
          <Switch
            value={pushEnabled}
            onValueChange={(v) => handleToggle('push_enabled', v, setPushEnabled)}
            trackColor={{ false: '#D1D5DB', true: BrandOrange }}
            thumbColor="#FFFFFF"
            style={styles.toggle}
          />
        </View>

        <View style={styles.toggleRow}>
          <ThemedText style={[styles.toggleLabel, { fontFamily: F.inter500 }]}>
            마케팅 정보 수신 동의
          </ThemedText>
          <Switch
            value={marketingEnabled}
            onValueChange={(v) => handleToggle('marketing_enabled', v, setMarketingEnabled)}
            trackColor={{ false: '#D1D5DB', true: BrandOrange }}
            thumbColor="#FFFFFF"
            style={styles.toggle}
          />
        </View>

        <View style={styles.toggleRow}>
          <ThemedText style={[styles.toggleLabel, { fontFamily: F.inter500 }]}>
            야간 푸시 동의 (21시~08시)
          </ThemedText>
          <Switch
            value={nightPushEnabled}
            onValueChange={(v) => handleToggle('night_push_enabled', v, setNightPushEnabled)}
            trackColor={{ false: '#D1D5DB', true: BrandOrange }}
            thumbColor="#FFFFFF"
            style={styles.toggle}
          />
        </View>

        <View style={styles.toggleRow}>
          <ThemedText style={[styles.toggleLabel, { fontFamily: F.inter500 }]}>
            GPS 제공 동의
          </ThemedText>
          <Pressable style={styles.gpsBtn}>
            <ThemedText style={[styles.gpsBtnText, { color: BrandOrange }]}>
              확인하기
            </ThemedText>
            <ChevronRight size={16} color={BrandOrange} />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  toggleLabel: { fontSize: 16 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toggle: { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] },
  gpsBtnText: { fontSize: 14 },
});
