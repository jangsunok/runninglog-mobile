import { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  View,
  Pressable,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import { ChevronLeft, Share2, Heart, TrendingUp, Mountain } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Polyline, Marker } from 'react-native-maps';
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';

import { getActivity } from '@/lib/api/activities';
import type { ActivityDetail, ActivitySplit, ApiCoordinate } from '@/types/activity';
import { ApiError } from '@/lib/api/client';
import { BrandOrange, HeartRed, F } from '@/constants/theme';

const { width: SW } = Dimensions.get('window');
const MAP_H = 420;

// Always dark theme for result screen
const BG = '#0D0D0D';
const GRID = '#333333';
const WHITE = '#FFFFFF';
const TERTIARY = '#9CA3AF';
const MUTED = '#666666';
const PACE_BLUE = '#4A9EFF';
const ELEV_GREEN = '#4CAF50';

// Chart dimensions
const C_PAD = 24;
const C_TOTAL_W = SW - C_PAD * 2;
const Y_W = 34;
const PLOT_W = C_TOTAL_W - Y_W;
const PLOT_H = 200;

const ZONE_COLORS = ['#60A5FA', '#8bc34a', '#EAB308', '#F97316', '#EF4444'];
const ZONE_LABELS = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];

// ── Helpers ──────────────────────────────────

function normalizeCoords(coords: [number, number][] | ApiCoordinate[]) {
  return coords.map(c =>
    Array.isArray(c)
      ? { latitude: c[0], longitude: c[1] }
      : { latitude: c.lat, longitude: c.lng },
  );
}

function paceToSec(pace: string): number {
  const p = pace.split(':').map(Number);
  return (p[0] || 0) * 60 + (p[1] || 0);
}

function parseMins(display: string): number {
  const p = display.split(':').map(Number);
  if (p.length === 3) return p[0] * 60 + p[1] + p[2] / 60;
  if (p.length === 2) return p[0] + p[1] / 60;
  return 0;
}

function koreanDate(iso: string, endIso?: string): string {
  const d = new Date(iso);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const pad2 = (n: number) => String(n).padStart(2, '0');
  let r = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (endIso) {
    const e = new Date(endIso);
    r += ` - ${pad2(e.getHours())}:${pad2(e.getMinutes())}`;
  }
  return r;
}

function areaPath(data: number[], w: number, h: number, minV: number, maxV: number) {
  if (data.length < 2) return { line: '', area: '' };
  const rng = maxV - minV || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: +(i * step).toFixed(1),
    y: +(h - ((v - minV) / rng) * h).toFixed(1),
  }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return { line, area: `${line} L${w},${h} L0,${h} Z` };
}

function hrZones(splits: ActivitySplit[], maxHR: number | null): number[] {
  if (!maxHR || maxHR <= 0) return [20, 20, 20, 20, 20];
  const z = [0, 0, 0, 0, 0];
  let n = 0;
  for (const sp of splits) {
    if (sp.average_heart_rate) {
      const pct = sp.average_heart_rate / maxHR;
      if (pct >= 0.9) z[4]++;
      else if (pct >= 0.8) z[3]++;
      else if (pct >= 0.7) z[2]++;
      else if (pct >= 0.6) z[1]++;
      else z[0]++;
      n++;
    }
  }
  return n === 0 ? [20, 20, 20, 20, 20] : z.map(v => Math.round((v / n) * 100));
}

// ── StatCard ─────────────────────────────────

function StatCard({ label, value, unit, icon }: {
  label: string; value: string; unit?: string; icon?: React.ReactNode;
}) {
  return (
    <View style={st.statCard}>
      <Text style={st.statLabel}>{label}</Text>
      <View style={st.statValRow}>
        {icon}
        <Text style={st.statVal}>{value}</Text>
      </View>
      {unit && <Text style={st.statUnit}>{unit}</Text>}
    </View>
  );
}

// ── PaceChart ────────────────────────────────

function PaceChart({ splits, avgPace, bestPace, avgSec }: {
  splits: ActivitySplit[]; avgPace: string; bestPace: string; avgSec: number;
}) {
  const secs = splits.map(sp => paceToSec(sp.pace));
  const mn = Math.min(...secs);
  const mx = Math.max(...secs);
  const pad = Math.max((mx - mn) * 0.25, 30);
  const cMin = mn - pad;
  const cMax = mx + pad;

  // Invert: lower pace (faster) at top → use (cMax + cMin - v) so faster = higher
  const inv = secs.map(v => cMax + cMin - v);
  const { line, area } = areaPath(inv, PLOT_W, PLOT_H, cMin, cMax);

  const yN = 5;
  const yGap = PLOT_H / (yN - 1);
  const paceRange = cMax - cMin;
  const yLabels = Array.from({ length: yN }, (_, i) => {
    const sec = cMin + (i * paceRange) / (yN - 1);
    return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  });

  const avgY = PLOT_H - ((cMax + cMin - avgSec - cMin) / paceRange) * PLOT_H;

  return (
    <View style={st.chartSection}>
      <View style={st.chartHeader}>
        <View style={st.chartTitleWrap}>
          <TrendingUp size={18} color={PACE_BLUE} />
          <Text style={st.chartTitle}>페이스</Text>
        </View>
      </View>
      <View style={st.hLine} />
      <View style={st.chartStatsRow}>
        <View style={st.chartStatCol}>
          <Text style={st.chartStatLabel}>평균</Text>
          <Text style={st.chartStatVal}>{avgPace}</Text>
        </View>
        <View style={st.chartStatDiv} />
        <View style={st.chartStatCol}>
          <Text style={st.chartStatLabel}>최고</Text>
          <Text style={st.chartStatVal}>{bestPace}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: Y_W, height: PLOT_H }}>
          {yLabels.map((l, i) => (
            <Text key={i} style={[st.yLabel, { position: 'absolute', top: i * yGap - 6 }]}>{l}</Text>
          ))}
        </View>
        <Svg width={PLOT_W} height={PLOT_H}>
          <Defs>
            <LinearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4A9EFF80" />
              <Stop offset="1" stopColor="#4A9EFF20" />
            </LinearGradient>
          </Defs>
          {Array.from({ length: yN }, (_, i) => (
            <Line key={i} x1={0} y1={i * yGap} x2={PLOT_W} y2={i * yGap} stroke={GRID} strokeWidth={1} />
          ))}
          {area ? <Path d={area} fill="url(#pG)" /> : null}
          {line ? <Path d={line} fill="none" stroke={PACE_BLUE} strokeWidth={1.5} strokeLinecap="round" /> : null}
          <Line x1={0} y1={avgY} x2={PLOT_W} y2={avgY} stroke="#FFFFFF66" strokeWidth={1} strokeDasharray="4,4" />
        </Svg>
      </View>
      <View style={st.xRow}>
        {splits.map(sp => (
          <Text key={sp.split_number} style={st.xLabel}>{sp.split_number}km</Text>
        ))}
      </View>
    </View>
  );
}

// ── SplitTable ───────────────────────────────

function SplitTable({ splits, avgPace }: { splits: ActivitySplit[]; avgPace: string }) {
  const secs = splits.map(sp => paceToSec(sp.pace));
  const mn = Math.min(...secs);
  const mx = Math.max(...secs);
  const rng = mx - mn || 1;

  return (
    <View style={st.chartSection}>
      <View style={st.chartHeader}>
        <Text style={st.chartTitle}>구간별 페이스</Text>
        <Text style={st.subtitleText}>평균 {avgPace}</Text>
      </View>
      <View style={st.splitHdr}>
        <Text style={[st.splitHdrCell, { width: 32 }]}>Km</Text>
        <Text style={[st.splitHdrCell, { width: 48 }]}>페이스</Text>
        <View style={{ flex: 1 }} />
        <Text style={[st.splitHdrCell, { width: 40, textAlign: 'right' }]}>고도</Text>
        <Text style={[st.splitHdrCell, { width: 32, textAlign: 'right' }]}>심박수</Text>
      </View>
      <View style={st.hLine} />
      {splits.map(sp => {
        const pSec = paceToSec(sp.pace);
        const barPct = ((pSec - mn) / rng) * 0.6 + 0.3;
        return (
          <View key={sp.split_number} style={st.splitRow}>
            <Text style={[st.splitCell, { width: 32 }]}>{sp.split_number}</Text>
            <Text style={[st.splitCell, { width: 48 }]}>{sp.pace_display}</Text>
            <View style={st.splitBarWrap}>
              <View style={[st.splitBar, { width: `${barPct * 100}%` }]} />
            </View>
            <Text style={[st.splitCell, { width: 40, textAlign: 'right' }]}>
              {sp.elevation_change != null ? sp.elevation_change : '—'}
            </Text>
            <Text style={[st.splitCell, { width: 32, textAlign: 'right' }]}>
              {sp.average_heart_rate ?? '—'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── ElevChart ────────────────────────────────

function ElevChart({ data, splits, gain, loss }: {
  data: number[]; splits: ActivitySplit[]; gain: number | null; loss: number | null;
}) {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pad = Math.max((mx - mn) * 0.25, 10);
  const cMin = mn - pad;
  const cMax = mx + pad;
  const { line, area } = areaPath(data, PLOT_W, PLOT_H, cMin, cMax);

  const yN = 4;
  const yGap = PLOT_H / (yN - 1);
  const yLabels = Array.from({ length: yN }, (_, i) =>
    `${Math.round(cMax - (i * (cMax - cMin)) / (yN - 1))}`,
  );

  return (
    <View style={st.chartSection}>
      <View style={st.chartHeader}>
        <View style={st.chartTitleWrap}>
          <Mountain size={18} color={ELEV_GREEN} />
          <Text style={st.chartTitle}>고도</Text>
        </View>
      </View>
      <View style={st.hLine} />
      <View style={st.chartStatsRow}>
        <View style={st.chartStatCol}>
          <Text style={st.chartStatLabel}>상승</Text>
          <Text style={st.chartStatVal}>{gain != null ? `${gain}m` : '—'}</Text>
        </View>
        <View style={st.chartStatDiv} />
        <View style={st.chartStatCol}>
          <Text style={st.chartStatLabel}>하강</Text>
          <Text style={st.chartStatVal}>{loss != null ? `${loss}m` : '—'}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: Y_W, height: PLOT_H }}>
          {yLabels.map((l, i) => (
            <Text key={i} style={[st.yLabel, { position: 'absolute', top: i * yGap - 6 }]}>{l}</Text>
          ))}
        </View>
        <Svg width={PLOT_W} height={PLOT_H}>
          <Defs>
            <LinearGradient id="eG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#4CAF5090" />
              <Stop offset="1" stopColor="#4CAF5010" />
            </LinearGradient>
          </Defs>
          {Array.from({ length: yN }, (_, i) => (
            <Line key={i} x1={0} y1={i * yGap} x2={PLOT_W} y2={i * yGap} stroke={GRID} strokeWidth={1} />
          ))}
          {area ? <Path d={area} fill="url(#eG)" /> : null}
          {line ? <Path d={line} fill="none" stroke={ELEV_GREEN} strokeWidth={1.5} strokeLinecap="round" /> : null}
        </Svg>
      </View>
      <View style={st.xRow}>
        {splits.map(sp => (
          <Text key={sp.split_number} style={st.xLabel}>{sp.split_number}km</Text>
        ))}
      </View>
    </View>
  );
}

// ── CadenceChart ─────────────────────────────

function CadenceChart({ avg, splits }: { avg: number; splits: ActivitySplit[] }) {
  const data = useMemo(
    () => splits.map((_, i) => avg + Math.round(Math.sin(i * 1.5) * avg * 0.08)),
    [avg, splits],
  );
  if (data.length < 2) return null;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pad = Math.max((mx - mn) * 0.3, 5);
  const { line, area } = areaPath(data, C_TOTAL_W, 100, mn - pad, mx + pad);

  return (
    <View style={st.chartSection}>
      <View style={st.chartHeader}>
        <Text style={st.chartTitle}>케이던스</Text>
        <Text style={st.subtitleText}>평균 {avg} spm</Text>
      </View>
      <Svg width={C_TOTAL_W} height={100}>
        <Defs>
          <LinearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF6F0030" />
            <Stop offset="1" stopColor="#FF6F0005" />
          </LinearGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#cG)" /> : null}
        {line ? <Path d={line} fill="none" stroke={BrandOrange} strokeWidth={2.5} strokeLinecap="round" /> : null}
      </Svg>
      <View style={st.xRow}>
        {splits.map(sp => (
          <Text key={sp.split_number} style={st.xLabel}>{sp.split_number}km</Text>
        ))}
      </View>
    </View>
  );
}

// ── HRChart + Zones ──────────────────────────

function HRSection({ data, splits, avgHR, maxHR, zones }: {
  data: number[]; splits: ActivitySplit[];
  avgHR: number | null; maxHR: number | null; zones: number[];
}) {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const pad = Math.max((mx - mn) * 0.3, 10);
  const { line, area } = areaPath(data, C_TOTAL_W, 100, mn - pad, mx + pad);

  const xLabels = splits
    .filter(sp => sp.average_heart_rate != null)
    .map(sp => `${sp.split_number}km`);

  return (
    <View style={st.chartSection}>
      <View style={st.chartHeader}>
        <Text style={st.chartTitle}>심박수</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Heart size={14} color={HeartRed} fill={HeartRed} />
          <Text style={st.subtitleText}>평균 {avgHR ?? '—'} bpm</Text>
        </View>
      </View>
      <Svg width={C_TOTAL_W} height={100}>
        <Defs>
          <LinearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#EF444430" />
            <Stop offset="1" stopColor="#EF444405" />
          </LinearGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#hG)" /> : null}
        {line ? <Path d={line} fill="none" stroke={HeartRed} strokeWidth={2.5} strokeLinecap="round" /> : null}
      </Svg>
      <View style={st.xRow}>
        {xLabels.map((l, i) => (
          <Text key={i} style={st.xLabel}>{l}</Text>
        ))}
      </View>

      {zones.length === 5 && (
        <View style={st.zoneSection}>
          <Text style={st.zoneTitle}>심박 존</Text>
          {[4, 3, 2, 1, 0].map(i => (
            <View key={i} style={st.zoneRow}>
              <Text style={[st.zoneLabel, { color: ZONE_COLORS[i] }]}>{ZONE_LABELS[i]}</Text>
              <View style={st.zoneBarBg}>
                <View style={[st.zoneBarFill, { width: `${zones[i]}%`, backgroundColor: ZONE_COLORS[i] }]} />
              </View>
              <Text style={st.zonePct}>{zones[i]}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main ─────────────────────────────────────

export default function RunDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const activityId = id ? parseInt(id, 10) : NaN;
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(activityId)) {
      setError('잘못된 기록입니다.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    getActivity(activityId)
      .then(d => { if (!cancelled) setActivity(d); })
      .catch(e => { if (!cancelled) setError(e instanceof ApiError ? e.message : '불러오지 못했습니다.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activityId]);

  const route = useMemo(() => {
    if (!activity?.route_coordinates?.length) return [];
    return normalizeCoords(activity.route_coordinates);
  }, [activity]);

  const mapRegion = useMemo(() => {
    if (!route.length) return null;
    const lats = route.map(r => r.latitude);
    const lngs = route.map(r => r.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) * 1.4 + 0.005,
      longitudeDelta: (maxLng - minLng) * 1.4 + 0.005,
    };
  }, [route]);

  const steps = useMemo(() => {
    if (!activity?.average_cadence || !activity.duration_display) return null;
    return Math.round(activity.average_cadence * parseMins(activity.duration_display));
  }, [activity]);

  const paceData = useMemo(
    () => (activity?.splits ?? []).map(sp => paceToSec(sp.pace)),
    [activity],
  );

  const hrDataArr = useMemo(
    () => (activity?.splits ?? []).filter(sp => sp.average_heart_rate != null).map(sp => sp.average_heart_rate!),
    [activity],
  );

  const elevArr = useMemo(() => {
    if (!activity?.splits?.length) return [];
    let cum = 0;
    return activity.splits.map(sp => { cum += sp.elevation_change ?? 0; return cum; });
  }, [activity]);

  const zones = useMemo(
    () => activity?.splits?.length ? hrZones(activity.splits, activity.max_heart_rate) : [],
    [activity],
  );

  if (loading) {
    return (
      <View style={[st.centered, { backgroundColor: BG }]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={WHITE} />
      </View>
    );
  }
  if (error || !activity) {
    return (
      <View style={[st.centered, { backgroundColor: BG }]}>
        <StatusBar barStyle="light-content" />
        <Text style={st.errText}>{error ?? '기록을 찾을 수 없습니다.'}</Text>
        <Pressable onPress={() => router.back()} style={st.errBack}>
          <Text style={st.errBackText}>돌아가기</Text>
        </Pressable>
      </View>
    );
  }

  const avgSec = paceToSec(activity.average_pace);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: BG }} bounces={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Map ── */}
      <View style={st.mapWrap}>
        {route.length > 0 && mapRegion ? (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            userInterfaceStyle="dark"
          >
            <Polyline coordinates={route} strokeColor={BrandOrange} strokeWidth={4} />
            {activity.start_coordinates && (
              <Marker coordinate={{ latitude: activity.start_coordinates.lat, longitude: activity.start_coordinates.lng }}>
                <View style={st.badge}><Text style={st.badgeText}>출발</Text></View>
              </Marker>
            )}
            {activity.end_coordinates && (
              <Marker coordinate={{ latitude: activity.end_coordinates.lat, longitude: activity.end_coordinates.lng }}>
                <View style={st.badge}><Text style={st.badgeText}>도착</Text></View>
              </Marker>
            )}
          </MapView>
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1F2937' }]} />
        )}
        <ExpoGradient colors={['#0D0D0DFF', '#0D0D0D00']} style={st.mapGrad} />
        <View style={[st.navRow, { paddingTop: insets.top + 8 }]}>
          <Pressable style={st.mapBtn} onPress={() => router.back()}>
            <ChevronLeft size={20} color={WHITE} />
          </Pressable>
          <Pressable style={st.mapBtn}>
            <Share2 size={18} color={WHITE} />
          </Pressable>
        </View>
      </View>

      {/* ── Distance ── */}
      <View style={st.distSection}>
        <View style={st.distRow}>
          <Text style={st.distVal}>{activity.distance_km.toFixed(2)}</Text>
          <Text style={st.distUnit}>km</Text>
        </View>
        <Text style={st.dateLabel}>{koreanDate(activity.started_at, activity.ended_at)}</Text>
      </View>

      <View style={st.divThin} />

      {/* ── Stats Grid ── */}
      <View style={st.statsGrid}>
        <View style={st.statsRow}>
          <StatCard label="시간" value={activity.duration_display} />
          <StatCard label="평균 페이스" value={activity.average_pace_display} />
          <StatCard label="칼로리" value={`${activity.calories}`} unit="kcal" />
        </View>
        <View style={st.statsRow}>
          <StatCard
            label="평균 심박수"
            value={activity.average_heart_rate ? `${activity.average_heart_rate}` : '—'}
            unit="bpm"
            icon={<Heart size={18} color={HeartRed} fill={HeartRed} />}
          />
          <StatCard label="케이던스" value={activity.average_cadence ? `${activity.average_cadence}` : '—'} unit="spm" />
          <StatCard label="걸음" value={steps ? steps.toLocaleString() : '—'} unit="steps" />
        </View>
      </View>

      <View style={st.divThin} />

      {/* ── Pace Chart ── */}
      {paceData.length >= 2 && (
        <>
          <View style={st.divThick} />
          <PaceChart splits={activity.splits} avgPace={activity.average_pace_display} bestPace={activity.best_pace_display} avgSec={avgSec} />
        </>
      )}

      {/* ── Split Table ── */}
      {activity.splits.length > 0 && (
        <>
          <View style={st.divThick} />
          <SplitTable splits={activity.splits} avgPace={activity.average_pace_display} />
        </>
      )}

      {/* ── Elevation ── */}
      {elevArr.length >= 2 && (
        <>
          <View style={st.divThick} />
          <ElevChart data={elevArr} splits={activity.splits} gain={activity.elevation_gain} loss={activity.elevation_loss} />
        </>
      )}

      {/* ── Cadence ── */}
      {activity.average_cadence != null && activity.splits.length >= 2 && (
        <>
          <View style={st.divThick} />
          <CadenceChart avg={activity.average_cadence} splits={activity.splits} />
        </>
      )}

      {/* ── Heart Rate + Zones ── */}
      {hrDataArr.length >= 2 && (
        <>
          <View style={st.divThick} />
          <HRSection data={hrDataArr} splits={activity.splits} avgHR={activity.average_heart_rate} maxHR={activity.max_heart_rate} zones={zones} />
        </>
      )}

      <View style={{ height: 40 + insets.bottom }} />
    </ScrollView>
  );
}

// ── Styles ───────────────────────────────────

const st = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errText: { color: '#EF4444', fontSize: 15, marginBottom: 16 },
  errBack: { paddingVertical: 10, paddingHorizontal: 20 },
  errBackText: { color: WHITE, fontSize: 15 },

  // Map
  mapWrap: { height: MAP_H, width: '100%' },
  mapGrad: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  navRow: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  mapBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#00000060', alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: BrandOrange, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { color: WHITE, fontFamily: F.inter700, fontSize: 11 },

  // Distance
  distSection: { alignItems: 'center', gap: 8, paddingVertical: 32, paddingHorizontal: 24 },
  distRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  distVal: { color: WHITE, fontFamily: F.inter800, fontSize: 72, lineHeight: 72 },
  distUnit: { color: TERTIARY, fontFamily: F.inter500, fontSize: 24, lineHeight: 30, marginBottom: 6 },
  dateLabel: { color: TERTIARY, fontSize: 13 },

  // Dividers
  divThin: { height: 1, backgroundColor: '#262626' },
  divThick: { height: 8, backgroundColor: '#1A1A1A' },

  // Stats
  statsGrid: { paddingVertical: 20, paddingHorizontal: 24, gap: 0 },
  statsRow: { flexDirection: 'row' },
  statCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 16 },
  statLabel: { color: TERTIARY, fontSize: 12 },
  statValRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  statVal: { color: WHITE, fontFamily: F.inter700, fontSize: 22 },
  statUnit: { color: TERTIARY, fontSize: 11 },

  // Chart section
  chartSection: { backgroundColor: BG, paddingVertical: 24, paddingHorizontal: 24, gap: 16 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chartTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chartTitle: { color: WHITE, fontFamily: F.inter700, fontSize: 18 },
  hLine: { height: 1, backgroundColor: GRID },
  chartStatsRow: { flexDirection: 'row', alignItems: 'center' },
  chartStatCol: { flex: 1, alignItems: 'center', gap: 4 },
  chartStatDiv: { width: 1, height: 45, backgroundColor: GRID },
  chartStatLabel: { color: TERTIARY, fontSize: 12 },
  chartStatVal: { color: WHITE, fontFamily: F.inter700, fontSize: 20 },
  subtitleText: { color: TERTIARY, fontSize: 13 },

  yLabel: { color: MUTED, fontSize: 11 },
  xRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 8 },
  xLabel: { color: MUTED, fontSize: 10 },

  // Split table
  splitHdr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  splitHdrCell: { color: TERTIARY, fontFamily: F.inter600, fontSize: 12 },
  splitRow: { flexDirection: 'row', alignItems: 'center', height: 32 },
  splitCell: { color: WHITE, fontFamily: F.inter500, fontSize: 13 },
  splitBarWrap: { flex: 1, height: 14, backgroundColor: '#FFFFFF10', borderRadius: 4, marginHorizontal: 8 },
  splitBar: { height: 14, backgroundColor: BrandOrange, borderRadius: 4 },

  // HR Zones
  zoneSection: { gap: 8, paddingTop: 16 },
  zoneTitle: { color: WHITE, fontFamily: F.inter600, fontSize: 14 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zoneLabel: { fontFamily: F.inter600, fontSize: 11, width: 48 },
  zoneBarBg: { flex: 1, height: 16, backgroundColor: '#FFFFFF10', borderRadius: 4 },
  zoneBarFill: { height: 16, borderRadius: 4 },
  zonePct: { color: TERTIARY, fontFamily: F.inter500, fontSize: 11, width: 30, textAlign: 'right' },
});
