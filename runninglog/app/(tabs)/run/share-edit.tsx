import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Toast from 'react-native-toast-message';

import { ShareEditCanvas } from '@/components/share-edit/ShareEditCanvas';
import { ShareEditTabs } from '@/components/share-edit/ShareEditTabs';
import { DEFAULT_DATA_TOGGLES } from '@/constants/shareEditTemplates';
import { BrandOrange, Colors, F } from '@/constants/theme';
import { getActivity } from '@/lib/api/activities';
import { ApiError } from '@/lib/api/client';
import type { ActivityDetail, ApiCoordinate } from '@/types/activity';
import type { Coordinate } from '@/types/run';
import type {
  ShareEditState,
  ShareCardData,
  AspectRatio,
  MainTab,
  BackgroundType,
  TemplateId,
  TextTheme,
} from '@/types/shareEdit';

const BG = '#F5F5F5';
const WHITE = '#FFFFFF';
const SCREEN_W = Dimensions.get('window').width;
const CANVAS_W = SCREEN_W - 40;

function normalizeCoords(coords: [number, number][] | ApiCoordinate[]): Coordinate[] {
  return coords.map((c) =>
    Array.isArray(c)
      ? { latitude: c[0], longitude: c[1] }
      : { latitude: c.lat, longitude: c.lng },
  );
}

/** 10.10 → "10.1", 10.12 → "10.12", 10.00 → "10.0" */
function formatShareDistance(km: number): string {
  const fixed = km.toFixed(2);
  return fixed.endsWith('0') ? km.toFixed(1) : fixed;
}

/** "0:50" → "00:50", "1:28:45" → "01:28:45" — 시가 0이면 MM:SS */
function formatShareDuration(raw: string | undefined | null): string {
  if (!raw) return '00:00';
  const parts = raw.split(':').map((p) => p.trim());
  while (parts.length < 3) parts.unshift('0');
  const [h, m, s] = parts.map((p) => p.padStart(2, '0'));
  return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

const CHECKER_CELL = 16;

function CheckerboardPreview({ width, height }: { width: number; height: number }) {
  const cols = Math.ceil(width / CHECKER_CELL);
  const rows = Math.ceil(height / CHECKER_CELL);

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 12, overflow: 'hidden' }]}>
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {Array.from({ length: cols }, (_, col) => (
            <View
              key={col}
              style={{
                width: CHECKER_CELL,
                height: CHECKER_CELL,
                backgroundColor: (row + col) % 2 === 0 ? '#FFFFFF' : '#E0E0E0',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ShareEditScreen() {
  const params = useLocalSearchParams<{ source?: string; id?: string }>();
  const activityId = params.id ? parseInt(params.id, 10) : NaN;
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);

  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editState, setEditState] = useState<ShareEditState>({
    aspectRatio: '9:16',
    backgroundType: 'color',
    backgroundUri: null,
    backgroundColor: 'transparent',
    dimLevel: 0,
    templateId: 'basic',
    textTheme: 'defaultBlack',
    dataToggles: { ...DEFAULT_DATA_TOGGLES },
    activeTab: 'text',
    isExporting: false,
  });

  useEffect(() => {
    if (!Number.isFinite(activityId)) {
      setError('잘못된 기록입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getActivity(activityId)
      .then((d) => {
        if (!cancelled) setActivity(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof ApiError ? e.message : '불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [activityId]);

  const routeCoords = useMemo(() => {
    if (!activity?.route_coordinates?.length) return [];
    return normalizeCoords(activity.route_coordinates);
  }, [activity]);

  const cardData: ShareCardData = useMemo(() => {
    if (!activity) {
      return { date: '', distanceKm: '0.0', paceDisplay: "--'--\"", timeDisplay: '00:00', heartRate: null, hasRoute: false, hasHeartRate: false };
    }
    return {
      date: formatDate(activity.started_at),
      distanceKm: formatShareDistance(activity.distance_km),
      paceDisplay: activity.average_pace_display?.trim() || "--'--\"",
      timeDisplay: formatShareDuration(activity.duration_display),
      heartRate: activity.average_heart_rate ? `${activity.average_heart_rate}` : null,
      hasRoute: (activity.route_coordinates?.length ?? 0) >= 2,
      hasHeartRate: activity.average_heart_rate != null && activity.average_heart_rate > 0,
    };
  }, [activity]);

  const setPartial = useCallback((patch: Partial<ShareEditState>) => {
    setEditState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleChangeTab = useCallback((tab: MainTab) => {
    setPartial({ activeTab: tab });
  }, [setPartial]);

  const handleChangeBackground = useCallback((type: BackgroundType, color?: string) => {
    setPartial({
      backgroundType: type,
      ...(type === 'color' && color ? { backgroundColor: color } : {}),
    });
  }, [setPartial]);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPartial({
        backgroundType: 'gallery',
        backgroundUri: result.assets[0].uri,
      });
    }
  }, [setPartial]);

  const handleChangeTemplate = useCallback((id: TemplateId) => {
    setPartial({ templateId: id });
  }, [setPartial]);

  const handleToggleData = useCallback((key: string, value: boolean) => {
    setEditState((prev) => ({
      ...prev,
      dataToggles: { ...prev.dataToggles, [key]: value },
    }));
  }, []);

  const handleChangeDim = useCallback((level: number) => {
    setPartial({ dimLevel: level });
  }, [setPartial]);

  const handleChangeTextTheme = useCallback((theme: TextTheme) => {
    setPartial({ textTheme: theme });
  }, [setPartial]);

  const handleComplete = useCallback(async () => {
    if (editState.isExporting) return;
    setPartial({ isExporting: true });

    try {
      const ref = viewShotRef.current as any;
      if (!ref?.capture) {
        Toast.show({ type: 'error', text1: '이미지 생성에 실패했어요. 다시 시도해 주세요.' });
        return;
      }
      const uri = await ref.capture();

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: '사진 저장 권한이 필요합니다.' });
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Toast.show({ type: 'success', text1: '사진이 저장되었습니다.' });
    } catch {
      Toast.show({ type: 'error', text1: '이미지 저장에 실패했어요. 다시 시도해 주세요.' });
    } finally {
      setPartial({ isExporting: false });
    }
  }, [editState.isExporting, setPartial]);

  if (loading) {
    return (
      <View style={[st.centered, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={BrandOrange} />
      </View>
    );
  }

  if (error || !activity) {
    return (
      <View style={[st.centered, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <Text style={st.errText}>{error ?? '기록을 찾을 수 없습니다.'}</Text>
        <Pressable onPress={() => router.back()} style={st.errBack}>
          <Text style={st.errBackText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={st.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={st.headerCancel}>취소</Text>
        </Pressable>
        <Text style={st.headerTitle}>공유 이미지 만들기</Text>
        <Pressable onPress={handleComplete} hitSlop={12} disabled={editState.isExporting}>
          <Text style={[st.headerDone, editState.isExporting && { opacity: 0.5 }]}>
            {editState.isExporting ? '저장 중...' : '완료'}
          </Text>
        </Pressable>
      </View>

      {/* Preview area */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Aspect ratio toggle */}
        <View style={st.ratioRow}>
          {(['9:16', '1:1'] as AspectRatio[]).map((r) => (
            <Pressable
              key={r}
              style={[st.ratioBtn, editState.aspectRatio === r && st.ratioBtnActive]}
              onPress={() => setPartial({ aspectRatio: r })}
            >
              <Text
                style={[st.ratioText, editState.aspectRatio === r && st.ratioTextActive]}
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Canvas */}
        <View style={st.canvasWrap}>
          {editState.backgroundType === 'color' && editState.backgroundColor === 'transparent' && (
            <CheckerboardPreview
              width={CANVAS_W}
              height={editState.aspectRatio === '9:16' ? CANVAS_W * (16 / 9) : CANVAS_W}
            />
          )}
          <ShareEditCanvas
            ref={viewShotRef}
            state={editState}
            cardData={cardData}
            routeCoords={routeCoords}
          />
        </View>
      </ScrollView>

      {/* Bottom panel */}
      <View style={[st.bottomPanel, { paddingBottom: insets.bottom }]}>
        <ShareEditTabs
          state={editState}
          hasRoute={cardData.hasRoute}
          hasHeartRate={cardData.hasHeartRate}
          onChangeTab={handleChangeTab}
          onChangeTextTheme={handleChangeTextTheme}
          onChangeBackground={handleChangeBackground}
          onPickPhoto={handlePickPhoto}
          onChangeTemplate={handleChangeTemplate}
          onToggleData={handleToggleData}
          onChangeDim={handleChangeDim}
        />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },
  centered: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errText: { color: '#EF4444', fontSize: 15, marginBottom: 16 },
  errBack: { paddingVertical: 10, paddingHorizontal: 20 },
  errBackText: { color: BrandOrange, fontSize: 15, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerCancel: {
    fontSize: 16,
    color: '#374151',
    fontFamily: F.inter400,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    fontFamily: F.inter600,
  },
  headerDone: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandOrange,
    fontFamily: F.inter600,
  },

  scroll: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },

  ratioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratioBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  ratioBtnActive: {
    backgroundColor: '#374151',
  },
  ratioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  ratioTextActive: {
    color: WHITE,
  },

  canvasWrap: {
    alignItems: 'center',
  },

  bottomPanel: {
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 5,
  },
});
