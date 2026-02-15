import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Bell, ChevronRight, Gem, Headphones, LogOut, Plug, SunMoon, FileText, UserX, User as UserIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCallback, useEffect, useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCurrentUser, type User } from '@/lib/api/auth';
import { getUnreadCount } from '@/lib/api/notifications';

type MenuItem = {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  route?: string;
  right?: 'arrow' | 'badge';
};

const MENU_ITEMS: MenuItem[] = [
  { icon: Plug, label: '데이터 소스 연동', route: '/(tabs)/my/data-source', right: 'arrow' },
  { icon: Gem, label: '결제 및 구독 관리', route: '/(tabs)/my/subscription', right: 'arrow' },
  { icon: Bell, label: '알림 및 동의 설정', route: '/(tabs)/my/notification-settings', right: 'arrow' },
  { icon: SunMoon, label: '테마 설정', route: '/(tabs)/my/theme-settings', right: 'arrow' },
  { icon: FileText, label: '약관 및 정책', route: '/(tabs)/my/terms', right: 'arrow' },
  { icon: Headphones, label: '고객센터', route: '/(tabs)/my/support', right: 'arrow' },
];

export default function MyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [user, setUser] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [userData, count] = await Promise.all([
        getCurrentUser(),
        getUnreadCount(),
      ]);
      setUser(userData);
      setUnreadCount(count);
    } catch {
      Toast.show({ type: 'error', text1: '정보를 불러오지 못했어요.' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
            마이페이지
          </ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/my/notifications')}>
            <View style={styles.bellWrapper}>
              <Bell size={22} color={c.textSecondary} />
              {unreadCount > 0 && <View style={styles.notificationDot} />}
            </View>
          </Pressable>
        </View>

        {/* Profile Section */}
        <Pressable style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: c.lightGray }]}>
            <UserIcon size={28} color={c.textSecondary} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={[styles.nickname, { fontFamily: F.inter700 }]}>
              {user?.nickname ?? '러너'}
            </ThemedText>
          </View>
          <Pressable style={[styles.profileBtn, { backgroundColor: c.lightGray }]}>
            <ThemedText style={[styles.profileBtnText, { color: c.textSecondary }]}>
              프로필 설정
            </ThemedText>
            <ChevronRight size={16} color={c.textSecondary} />
          </Pressable>
        </Pressable>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: c.lightGray }]} />

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={index}
              style={styles.menuRow}
              onPress={() => item.route && router.push(item.route as any)}
            >
              <View style={styles.menuRowLeft}>
                <item.icon size={22} color={c.textSecondary} />
                <ThemedText style={[styles.menuLabel, { fontFamily: F.inter500 }]}>
                  {item.label}
                </ThemedText>
              </View>
              {item.right === 'arrow' && (
                <ChevronRight size={20} color={c.textTertiary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: c.lightGray }]} />

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/(tabs)/my/logout')}
          >
            <View style={styles.menuRowLeft}>
              <LogOut size={22} color={c.textSecondary} />
              <ThemedText style={[styles.menuLabel, { fontFamily: F.inter500 }]}>
                로그아웃
              </ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/(tabs)/my/withdraw')}
          >
            <View style={styles.menuRowLeft}>
              <UserX size={22} color={c.textTertiary} />
              <ThemedText style={[styles.withdrawLabel, { color: c.textTertiary }]}>
                탈퇴하기
              </ThemedText>
            </View>
          </Pressable>
        </View>

        {/* 테스트: 월간 결산 */}
        <View style={styles.reportBtnSection}>
          <Pressable
            style={styles.reportBtn}
            onPress={() => router.push('/(tabs)/my/monthly-report')}
          >
            <ThemedText style={styles.reportBtnText}>
              테스트 결산 확인하기
            </ThemedText>
          </Pressable>
        </View>

        {/* Version */}
        <View style={styles.versionSection}>
          <ThemedText style={[styles.versionText, { color: c.textTertiary }]}>
            v1.0.0
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 28, lineHeight: 38 },
  bellWrapper: { width: 22, height: 22 },
  notificationDot: {
    position: 'absolute',
    right: -1,
    top: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, gap: 4 },
  nickname: { fontSize: 18 },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  profileBtnText: { fontSize: 13, fontWeight: '500' },
  divider: { height: 8 },
  menuSection: { paddingVertical: 8 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: { fontSize: 16 },
  bottomSection: { paddingVertical: 8 },
  withdrawLabel: { fontSize: 16, fontWeight: '500' },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  versionText: { fontSize: 13 },
  reportBtnSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  reportBtn: {
    backgroundColor: BrandOrange,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: F.inter700,
  },
});
