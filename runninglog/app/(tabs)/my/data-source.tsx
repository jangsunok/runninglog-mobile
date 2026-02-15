import { useRouter } from 'expo-router';
import { Activity, Check, ChevronLeft, Loader2, Zap } from 'lucide-react-native';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentGreen, BrandOrange, Colors, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOAuthConnect } from '@/hooks/use-oauth-connect';
import { useAppleHealthSync } from '@/hooks/use-apple-health-sync';
import { useSamsungHealthSync } from '@/hooks/use-samsung-health-sync';

function formatLastSync(isoString: string | null): string {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전 동기화';
  if (minutes < 60) return `${minutes}분 전 동기화`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전 동기화`;
  return `${Math.floor(hours / 24)}일 전 동기화`;
}

export default function DataSourceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const oauth = useOAuthConnect();
  const appleHealth = useAppleHealthSync();
  const samsungHealth = useSamsungHealthSync();

  const handleHealthToggle = async (
    service: 'apple' | 'samsung',
    currentEnabled: boolean
  ) => {
    if (currentEnabled) {
      if (service === 'apple') await appleHealth.disable();
      else await samsungHealth.disable();
    } else {
      const success =
        service === 'apple'
          ? await appleHealth.enable()
          : await samsungHealth.enable();
      if (!success) {
        Toast.show({
          type: 'error',
          text1: '권한이 필요합니다',
          text2: '설정에서 건강 앱 접근을 허용해주세요.',
        });
      }
    }
  };

  const handleOAuthConnect = async (service: 'strava' | 'garmin') => {
    await oauth.connect(service);
  };

  const handleOAuthDisconnect = async (service: 'strava' | 'garmin') => {
    await oauth.disconnect(service);
    Toast.show({
      type: 'success',
      text1: `${service === 'strava' ? 'Strava' : 'Garmin'} 연결이 해제되었습니다.`,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          계정 및 기기 연동
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 건강 앱 연동 — 플랫폼별 분기 */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { fontFamily: F.inter700 }]}>
            건강 앱 연동
          </ThemedText>
          <View style={[styles.sectionCard, { borderColor: c.border }]}>
            {Platform.OS === 'ios' && (
              <View style={styles.cardRow}>
                <View style={styles.cardRowLeft}>
                  <Activity size={22} color={c.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                      Apple Health
                    </ThemedText>
                    <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                      {appleHealth.enabled
                        ? formatLastSync(appleHealth.lastSync) || '활동 데이터 자동 동기화 중'
                        : '활동 데이터 자동 동기화'}
                    </ThemedText>
                  </View>
                </View>
                {appleHealth.syncing ? (
                  <ActivityIndicator size="small" color={BrandOrange} />
                ) : (
                  <Switch
                    value={appleHealth.enabled}
                    onValueChange={() =>
                      handleHealthToggle('apple', appleHealth.enabled)
                    }
                    trackColor={{ false: '#D1D5DB', true: BrandOrange }}
                    thumbColor="#FFFFFF"
                  />
                )}
              </View>
            )}

            {Platform.OS === 'android' && (
              <View style={styles.cardRow}>
                <View style={styles.cardRowLeft}>
                  <Activity size={22} color={c.textSecondary} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                      Samsung Health
                    </ThemedText>
                    <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                      {!samsungHealth.available
                        ? 'Health Connect 앱 설치가 필요합니다'
                        : samsungHealth.enabled
                          ? formatLastSync(samsungHealth.lastSync) || '활동 데이터 자동 동기화 중'
                          : '활동 데이터 자동 동기화'}
                    </ThemedText>
                  </View>
                </View>
                {samsungHealth.syncing ? (
                  <ActivityIndicator size="small" color={BrandOrange} />
                ) : (
                  <Switch
                    value={samsungHealth.enabled}
                    disabled={!samsungHealth.available}
                    onValueChange={() =>
                      handleHealthToggle('samsung', samsungHealth.enabled)
                    }
                    trackColor={{ false: '#D1D5DB', true: BrandOrange }}
                    thumbColor="#FFFFFF"
                  />
                )}
              </View>
            )}
          </View>
        </View>

        {/* 서비스 연동 — Strava + Garmin */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { fontFamily: F.inter700 }]}>
            서비스 연동
          </ThemedText>
          <View style={[styles.sectionCard, { borderColor: c.border }]}>
            {/* Strava */}
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Zap size={22} color={c.textSecondary} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                    Strava
                  </ThemedText>
                  <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                    {oauth.strava ? '활동 데이터 자동 동기화 중' : '활동 데이터 자동 동기화'}
                  </ThemedText>
                </View>
              </View>
              {oauth.connecting === 'strava' ? (
                <ActivityIndicator size="small" color={BrandOrange} />
              ) : oauth.strava ? (
                <View style={styles.connectedRow}>
                  <View style={styles.connectedBadge}>
                    <Check size={14} color={AccentGreen} />
                    <ThemedText style={[styles.connectedText, { color: AccentGreen }]}>
                      연결됨
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => handleOAuthDisconnect('strava')}>
                    <ThemedText style={[styles.disconnectLink, { color: c.textTertiary }]}>
                      해제
                    </ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[styles.connectButton, { backgroundColor: BrandOrange }]}
                  onPress={() => handleOAuthConnect('strava')}
                >
                  <ThemedText style={[styles.connectButtonText, { fontFamily: F.inter600 }]}>
                    연결하기
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <View style={[styles.cardDivider, { backgroundColor: c.border }]} />

            {/* Garmin */}
            <View style={styles.cardRow}>
              <View style={styles.cardRowLeft}>
                <Zap size={22} color={c.textSecondary} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                    Garmin Connect
                  </ThemedText>
                  <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                    {oauth.garmin ? '활동 데이터 자동 동기화 중' : '활동 데이터 자동 동기화'}
                  </ThemedText>
                </View>
              </View>
              {oauth.connecting === 'garmin' ? (
                <ActivityIndicator size="small" color={BrandOrange} />
              ) : oauth.garmin ? (
                <View style={styles.connectedRow}>
                  <View style={styles.connectedBadge}>
                    <Check size={14} color={AccentGreen} />
                    <ThemedText style={[styles.connectedText, { color: AccentGreen }]}>
                      연결됨
                    </ThemedText>
                  </View>
                  <Pressable onPress={() => handleOAuthDisconnect('garmin')}>
                    <ThemedText style={[styles.disconnectLink, { color: c.textTertiary }]}>
                      해제
                    </ThemedText>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={[styles.connectButton, { backgroundColor: BrandOrange }]}
                  onPress={() => handleOAuthConnect('garmin')}
                >
                  <ThemedText style={[styles.connectButtonText, { fontFamily: F.inter600 }]}>
                    연결하기
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <ThemedText style={[styles.footerNote, { color: c.textTertiary }]}>
          서비스 연동 시 러닝로그가 활동 데이터를 자동으로 수집합니다.{'\n'}
          Strava/Garmin은 새 활동이 기록될 때 자동으로 동기화됩니다.
        </ThemedText>
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
  content: { padding: 20, gap: 24 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 15 },
  sectionCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemName: { fontSize: 15 },
  itemDesc: { fontSize: 12, marginTop: 2 },
  cardDivider: { height: 1 },
  footerNote: { fontSize: 13, lineHeight: 20 },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  disconnectLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  connectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
});
