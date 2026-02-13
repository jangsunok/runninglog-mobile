import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { ChevronLeft, Watch, Smartphone, Activity, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, BrandOrange, F } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type DataSource = {
  id: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  name: string;
  description: string;
  connected: boolean;
};

export default function DataSourceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const scheme = colorScheme ?? 'light';
  const c = Colors[scheme];

  const [devices, setDevices] = useState<DataSource[]>([
    { id: 'apple-watch', icon: Watch, name: 'Apple Watch', description: '심박수, 칼로리, 케이던스', connected: false },
    { id: 'samsung-watch', icon: Watch, name: 'Samsung Watch', description: '심박수, 칼로리, 케이던스', connected: false },
  ]);

  const [services, setServices] = useState<DataSource[]>([
    { id: 'apple-health', icon: Activity, name: 'Apple Health', description: '활동 데이터 자동 동기화', connected: false },
    { id: 'samsung-health', icon: Activity, name: 'Samsung Health', description: '활동 데이터 자동 동기화', connected: false },
    { id: 'strava', icon: Zap, name: 'Strava', description: '활동 데이터 자동 동기화', connected: false },
  ]);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, connected: !d.connected } : d));
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={24} color={c.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { fontFamily: F.inter700 }]}>
          데이터 소스 연동
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Device Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { fontFamily: F.inter700 }]}>
            기기 연동
          </ThemedText>
          <View style={[styles.sectionCard, { borderColor: c.border }]}>
            {devices.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={[styles.cardDivider, { backgroundColor: c.border }]} />}
                <View style={styles.cardRow}>
                  <View style={styles.cardRowLeft}>
                    <item.icon size={22} color={c.textSecondary} />
                    <View>
                      <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                        {item.description}
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={item.connected}
                    onValueChange={() => toggleDevice(item.id)}
                    trackColor={{ false: '#D1D5DB', true: BrandOrange }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Service Section */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { fontFamily: F.inter700 }]}>
            서비스 연동
          </ThemedText>
          <View style={[styles.sectionCard, { borderColor: c.border }]}>
            {services.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={[styles.cardDivider, { backgroundColor: c.border }]} />}
                <View style={styles.cardRow}>
                  <View style={styles.cardRowLeft}>
                    <item.icon size={22} color={c.textSecondary} />
                    <View>
                      <ThemedText style={[styles.itemName, { fontFamily: F.inter500 }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.itemDesc, { color: c.textTertiary }]}>
                        {item.description}
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={item.connected}
                    onValueChange={() => toggleService(item.id)}
                    trackColor={{ false: '#D1D5DB', true: BrandOrange }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <ThemedText style={[styles.footerNote, { color: c.textTertiary }]}>
          기기와 서비스 연동 시 러닝로그가 활동 데이터를 자동으로 수집합니다.
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
  footerNote: { fontSize: 13 },
});
