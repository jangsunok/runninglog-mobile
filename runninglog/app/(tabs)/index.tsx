import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { BrandOrange } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const POPULAR_CONSULTS = [
  '장거리 러닝 시 숨이 차요. 호흡법이 궁금해요.',
  '마라톤 전날 식단 추천 부탁드려요.',
  '발바닥 물집 예방 방법이 있을까요?',
  '주말 반팔 러닝 시 자외선 차단 어떻게 하시나요?',
];

const UPCOMING_MARATHONS = [
  { id: '1', name: '서울 마라톤 2025', date: '2025.03.16', location: '서울' },
  { id: '2', name: '부산 국제 마라톤', date: '2025.04.06', location: '부산' },
];

const ALL_MARATHONS = [
  { id: '1', name: '서울 마라톤 2025', date: '2025.03.16', location: '서울' },
  { id: '2', name: '부산 국제 마라톤', date: '2025.04.06', location: '부산' },
  { id: '3', name: '대구 국제 마라톤', date: '2025.04.13', location: '대구' },
  { id: '4', name: '제주 올레 마라톤', date: '2025.05.18', location: '제주' },
  { id: '5', name: '인천 공항 Sky 마라톤', date: '2025.06.01', location: '인천' },
  { id: '6', name: '춘천 마라톤', date: '2025.06.15', location: '춘천' },
];

function useWeekRunCounts() {
  return [0, 2, 1, 0, 3, 1, 0];
}

function ConsultTicker({ onPress }: { onPress: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [index, setIndex] = useState(0);
  const translateY = useSharedValue(0);
  const lineHeight = 24;
  const items = POPULAR_CONSULTS;

  const nextIndex = () => setIndex((i) => (i + 1) % items.length);

  useEffect(() => {
    const id = setInterval(() => {
      translateY.value = withTiming(-lineHeight, { duration: 400 }, (finished) => {
        if (finished) {
          runOnJS(nextIndex)();
          translateY.value = 0;
        }
      });
    }, 3000);
    return () => clearInterval(id);
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const textColor = isDark ? '#FAFAFA' : '#0D0D0D';

  return (
    <Pressable onPress={onPress} style={styles.tickerTouch}>
      <View style={styles.tickerWrap}>
        <View style={[styles.tickerWindow, { backgroundColor: isDark ? '#262626' : '#F5F5F5' }]}>
          <Animated.View style={[{ height: lineHeight * 2 }, animatedStyle]}>
            <ThemedText style={[styles.tickerLine, { color: textColor }]} numberOfLines={1}>
              {items[index]}
            </ThemedText>
            <ThemedText style={[styles.tickerLine, { color: textColor }]} numberOfLines={1}>
              {items[(index + 1) % items.length]}
            </ThemedText>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const weekCounts = useWeekRunCounts();
  const [allList, setAllList] = useState(ALL_MARATHONS);
  const loadingRef = useRef(false);

  const searchBg = isDark ? '#262626' : '#F5F5F5';
  const searchBorder = isDark ? '#404040' : '#E5E5E5';
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  const loadMore = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setTimeout(() => {
      setAllList((prev) => [
        ...prev,
        ...ALL_MARATHONS.map((m, i) => ({
          ...m,
          id: `more-${prev.length + i}`,
          name: `${m.name} (${prev.length + i + 1})`,
        })),
      ]);
      loadingRef.current = false;
    }, 600);
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const pad = 200;
      if (contentOffset.y + layoutMeasurement.height >= contentSize.height - pad) {
        loadMore();
      }
    },
    [loadMore]
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={[styles.searchBox, { backgroundColor: searchBg, borderColor: searchBorder }]}>
          <MaterialIcons name="search" size={20} color={iconColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FAFAFA' : '#0D0D0D' }]}
            placeholder="대회명, 지역을 검색해보세요."
            placeholderTextColor={isDark ? '#737373' : '#a3a3a3'}
            editable={false}
          />
        </View>
        <Pressable style={styles.notiBtn} hitSlop={12}>
          <MaterialIcons name="notifications-none" size={24} color={iconColor} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            이번 주 달리기 기록
          </ThemedText>
          <View style={styles.weekRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <View key={label} style={styles.dayCell}>
                <ThemedText style={styles.dayLabel}>{label}</ThemedText>
                <View style={[styles.countBadge, weekCounts[i] > 0 && styles.countBadgeActive]}>
                  <ThemedText
                    style={[
                      styles.countText,
                      weekCounts[i] > 0 && { color: '#fff' },
                    ]}
                  >
                    {weekCounts[i]}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            인기 있는 고민상담
          </ThemedText>
          <ConsultTicker onPress={() => router.push('/(tabs)/consult')} />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            참여 예정 마라톤 대회
          </ThemedText>
          {UPCOMING_MARATHONS.map((m) => (
            <Pressable
              key={m.id}
              style={[styles.card, { backgroundColor: isDark ? '#262626' : '#F5F5F5' }]}
            >
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {m.name}
              </ThemedText>
              <ThemedText style={styles.cardMeta}>
                {m.date} · {m.location}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            마라톤 대회 전체
          </ThemedText>
          {allList.map((item) => (
            <View
              key={item.id}
              style={[styles.marathonRow, { borderBottomColor: isDark ? '#262626' : '#E5E5E5' }]}
            >
              <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.marathonName}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.marathonMeta}>
                {item.date} · {item.location}
              </ThemedText>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  notiBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 6,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeActive: {
    backgroundColor: BrandOrange,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tickerTouch: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tickerWrap: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tickerWindow: {
    height: 24,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tickerLine: {
    height: 24,
    lineHeight: 24,
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 4,
  },
  marathonRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  marathonName: {
    marginBottom: 4,
  },
  marathonMeta: {
    fontSize: 13,
    opacity: 0.8,
  },
});
