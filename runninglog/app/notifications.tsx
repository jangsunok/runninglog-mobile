import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, BellOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api/notifications';
import type { Notification } from '@/types/api';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(1, 50);
      setNotifications(data.results);
    } catch {
      Toast.show({ type: 'error', text1: '알림을 불러오지 못했어요.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleReadAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      Toast.show({ type: 'error', text1: '알림 읽음 처리에 실패했어요.' });
    }
  };

  const handleItemPress = async (item: Notification) => {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
        );
      } catch {
        Toast.show({ type: 'error', text1: '알림 읽음 처리에 실패했어요.' });
      }
    }
    if (item.action_url) {
      router.push(item.action_url as any);
    }
  };

  // 오늘/이전 분리
  const today = new Date().toDateString();
  const todayItems = notifications.filter(
    (n) => new Date(n.created_at).toDateString() === today
  );
  const previousItems = notifications.filter(
    (n) => new Date(n.created_at).toDateString() !== today
  );
  const isEmpty = notifications.length === 0;

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
        <ThemedView style={[styles.container, styles.center]}>
          <ActivityIndicator size="large" color={BrandOrange} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['top']}>
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: 16 }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft size={24} color={c.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { fontFamily: F.mont700 }]}>알림</ThemedText>
        </View>
        <Pressable onPress={handleReadAll}>
          <ThemedText style={[styles.readAllBtn, { color: isEmpty ? c.textTertiary : BrandOrange }]}>
            전체 읽음
          </ThemedText>
        </Pressable>
      </View>
      <View style={[styles.headerDivider, { backgroundColor: c.border }]} />

      {isEmpty ? (
        <View style={styles.emptyBody}>
          <View style={[styles.emptyIconWrap, { backgroundColor: c.surface }]}>
            <BellOff size={36} color={c.textTertiary} />
          </View>
          <ThemedText style={[styles.emptyText, { color: c.textSecondary }]}>
            알림이 없습니다
          </ThemedText>
          <ThemedText style={[styles.emptySubText, { color: c.textTertiary }]}>
            새로운 알림이 오면 여기에 표시됩니다.
          </ThemedText>
        </View>
      ) : (
        <ScrollView>
          {todayItems.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: c.textSecondary }]}>오늘</ThemedText>
              </View>
              {todayItems.map((item, idx) => (
                <View key={item.id}>
                  <Pressable
                    style={[styles.notiItem, !item.is_read && { backgroundColor: '#FFF8F0' }]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.notiContent}>
                      <ThemedText style={[styles.notiTitle, { fontFamily: F.inter600 }]}>
                        {item.emoji ? `${item.emoji} ` : ''}{item.title}
                      </ThemedText>
                      <ThemedText style={[styles.notiBody, { color: c.textSecondary }]}>
                        {item.body}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.notiTime, { color: c.textTertiary }]}>
                      {item.time_display}
                    </ThemedText>
                  </Pressable>
                  {idx < todayItems.length - 1 && (
                    <View style={[styles.itemDivider, { backgroundColor: c.border }]} />
                  )}
                </View>
              ))}
            </View>
          )}
          {previousItems.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: c.textSecondary }]}>이전</ThemedText>
              </View>
              <View style={[styles.itemDivider, { backgroundColor: c.border }]} />
              {previousItems.map((item, idx) => (
                <View key={item.id}>
                  <Pressable
                    style={[styles.notiItem, !item.is_read && { backgroundColor: '#FFF8F0' }]}
                    onPress={() => handleItemPress(item)}
                  >
                    <View style={styles.notiContent}>
                      <ThemedText style={[styles.notiTitle, { fontFamily: F.inter600 }]}>
                        {item.emoji ? `${item.emoji} ` : ''}{item.title}
                      </ThemedText>
                      <ThemedText style={[styles.notiBody, { color: c.textSecondary }]}>
                        {item.body}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.notiTime, { color: c.textTertiary }]}>
                      {item.time_display}
                    </ThemedText>
                  </Pressable>
                  {idx < previousItems.length - 1 && (
                    <View style={[styles.itemDivider, { backgroundColor: c.border }]} />
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20 },
  readAllBtn: { fontSize: 14, fontWeight: '500' },
  headerDivider: { height: 1 },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 16, fontWeight: '500' },
  emptySubText: { fontSize: 13 },
  sectionHeader: { paddingHorizontal: 20, paddingVertical: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600' },
  notiItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  notiContent: { flex: 1, gap: 4 },
  notiTitle: { fontSize: 15 },
  notiBody: { fontSize: 13 },
  notiTime: { fontSize: 12 },
  itemDivider: { height: 1, marginHorizontal: 0 },
});
