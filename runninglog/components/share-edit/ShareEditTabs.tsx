import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Switch, ScrollView } from 'react-native';
import { Image as ImageIcon, Layout, BarChart3, Sticker, Plus, Map, Camera, Sun } from 'lucide-react-native';

import { BACKGROUND_COLORS, TEMPLATES } from '@/constants/shareEditTemplates';
import { BrandOrange } from '@/constants/theme';
import type { MainTab, ShareEditState, BackgroundType, TemplateId, StickerType } from '@/types/shareEdit';

const ACCENT = BrandOrange;
const TAB_INACTIVE = '#9CA3AF';
const DIVIDER = '#E5E5E5';

interface ShareEditTabsProps {
  state: ShareEditState;
  hasRoute: boolean;
  hasHeartRate: boolean;
  onChangeTab: (tab: MainTab) => void;
  onChangeBackground: (type: BackgroundType, color?: string) => void;
  onPickPhoto: () => void;
  onChangeTemplate: (id: TemplateId) => void;
  onToggleData: (key: string, value: boolean) => void;
  onChangeDim: (level: number) => void;
  onAddSticker?: (type: StickerType) => void;
}

const TABS: { id: MainTab; label: string; Icon: any }[] = [
  { id: 'background', label: '배경', Icon: ImageIcon },
  { id: 'template', label: '템플릿', Icon: Layout },
  { id: 'data', label: '데이터', Icon: BarChart3 },
  { id: 'sticker', label: '스티커', Icon: Sticker },
];

const DATA_ITEMS: { key: string; label: string; needsData?: boolean }[] = [
  { key: 'showDistance', label: '거리' },
  { key: 'showTime', label: '시간' },
  { key: 'showPace', label: '페이스' },
  { key: 'showHeartRate', label: '심박수', needsData: true },
  { key: 'showWeather', label: '날씨' },
];

export function ShareEditTabs({
  state,
  hasRoute,
  hasHeartRate,
  onChangeTab,
  onChangeBackground,
  onPickPhoto,
  onChangeTemplate,
  onToggleData,
  onChangeDim,
  onAddSticker,
}: ShareEditTabsProps) {
  return (
    <View style={s.container}>
      {/* Main tab bar */}
      <View style={s.tabBar}>
        {TABS.map((tab) => {
          const active = state.activeTab === tab.id;
          const color = active ? ACCENT : TAB_INACTIVE;
          return (
            <Pressable
              key={tab.id}
              style={s.tabItem}
              onPress={() => onChangeTab(tab.id)}
            >
              <tab.Icon size={20} color={color} />
              <Text style={[s.tabLabel, { color }]}>{tab.label}</Text>
              {active && <View style={s.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      <View style={s.divider} />

      {/* Tab content */}
      <View style={s.content}>
        {state.activeTab === 'background' && (
          <BackgroundOptions
            state={state}
            hasRoute={hasRoute}
            onChangeBackground={onChangeBackground}
            onPickPhoto={onPickPhoto}
            onChangeDim={onChangeDim}
          />
        )}
        {state.activeTab === 'template' && (
          <TemplateOptions
            current={state.templateId}
            onChange={onChangeTemplate}
          />
        )}
        {state.activeTab === 'data' && (
          <DataOptions
            toggles={state.dataToggles}
            hasHeartRate={hasHeartRate}
            onToggle={onToggleData}
          />
        )}
        {state.activeTab === 'sticker' && (
          <StickerOptions onAddSticker={onAddSticker} />
        )}
      </View>
    </View>
  );
}

function BackgroundOptions({
  state,
  hasRoute,
  onChangeBackground,
  onPickPhoto,
  onChangeDim,
}: {
  state: ShareEditState;
  hasRoute: boolean;
  onChangeBackground: (type: BackgroundType, color?: string) => void;
  onPickPhoto: () => void;
  onChangeDim: (level: number) => void;
}) {
  return (
    <>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.optRow}>
      {/* Gallery */}
      <Pressable
        style={[
          s.optCard,
          state.backgroundType === 'gallery' && s.optCardActive,
        ]}
        onPress={onPickPhoto}
      >
        <Camera size={20} color={state.backgroundType === 'gallery' ? ACCENT : '#6B7280'} />
        <Text style={[s.optLabel, state.backgroundType === 'gallery' && s.optLabelActive]}>
          사진추가
        </Text>
      </Pressable>

      {/* Map */}
      <Pressable
        style={[
          s.optCard,
          state.backgroundType === 'map' && s.optCardActive,
          !hasRoute && s.optCardDisabled,
        ]}
        onPress={() => hasRoute && onChangeBackground('map')}
        disabled={!hasRoute}
      >
        <Map size={20} color={state.backgroundType === 'map' ? ACCENT : hasRoute ? '#6B7280' : '#D1D5DB'} />
        <Text style={[s.optLabel, state.backgroundType === 'map' && s.optLabelActive, !hasRoute && s.optLabelDisabled]}>
          지도형
        </Text>
      </Pressable>

      {/* Color swatches */}
      {BACKGROUND_COLORS.map((c) => {
        const active = state.backgroundType === 'color' && state.backgroundColor === c.color;
        return (
          <Pressable
            key={c.id}
            style={[s.optCard, active && s.optCardActive]}
            onPress={() => onChangeBackground('color', c.color)}
          >
            <View style={[s.colorSwatch, { backgroundColor: c.color }]} />
            <Text style={[s.optLabel, active && s.optLabelActive]}>{c.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>

    {/* Dim slider — visible only for gallery background */}
    {state.backgroundType === 'gallery' && (
      <View style={s.dimRow}>
        <Sun size={16} color="#6B7280" />
        <Text style={s.dimLabel}>어둡게</Text>
        <View style={s.dimTrack}>
          {[0, 0.15, 0.3, 0.5, 0.7].map((level) => (
            <Pressable
              key={level}
              style={[
                s.dimDot,
                state.dimLevel === level && s.dimDotActive,
              ]}
              onPress={() => onChangeDim(level)}
            >
              <View style={[s.dimDotInner, { opacity: 1 - level }]} />
            </Pressable>
          ))}
        </View>
      </View>
    )}
    </>
  );
}

function TemplateOptions({ current, onChange }: { current: TemplateId; onChange: (id: TemplateId) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.optRow}>
      {TEMPLATES.map((t) => {
        const active = current === t.id;
        return (
          <Pressable
            key={t.id}
            style={[s.templateCard, active && s.templateCardActive]}
            onPress={() => onChange(t.id)}
          >
            <View style={s.templatePreview}>
              <Text style={s.templatePreviewText}>{t.label[0]}</Text>
            </View>
            <Text style={[s.optLabel, active && s.optLabelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function DataOptions({
  toggles,
  hasHeartRate,
  onToggle,
}: {
  toggles: ShareEditState['dataToggles'];
  hasHeartRate: boolean;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <View style={s.dataList}>
      {DATA_ITEMS.map((item) => {
        const value = (toggles as any)[item.key] as boolean;
        const disabled = item.key === 'showHeartRate' && !hasHeartRate;
        return (
          <View key={item.key} style={s.dataRow}>
            <Text style={[s.dataLabel, disabled && s.dataLabelDisabled]}>
              {item.label}
              {disabled ? ' (데이터 없음)' : ''}
            </Text>
            <Switch
              value={value}
              onValueChange={(v) => onToggle(item.key, v)}
              disabled={disabled}
              trackColor={{ false: '#D1D5DB', true: ACCENT }}
              thumbColor="#FFFFFF"
            />
          </View>
        );
      })}
    </View>
  );
}

const STICKER_ITEMS: { type: StickerType; label: string }[] = [
  { type: 'logo', label: '로고' },
  { type: 'pb', label: 'PB' },
  { type: 'complete_run', label: '완런' },
];

function StickerOptions({ onAddSticker }: { onAddSticker?: (type: StickerType) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.optRow}>
      {STICKER_ITEMS.map((item) => (
        <Pressable
          key={item.type}
          style={s.stickerCard}
          onPress={() => onAddSticker?.(item.type)}
        >
          <View style={s.stickerPreview}>
            <Plus size={16} color="#9CA3AF" />
          </View>
          <Text style={s.optLabel}>{item.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: ACCENT,
    borderRadius: 1,
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
  },
  content: {
    minHeight: 100,
    paddingVertical: 12,
  },
  optRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  optCard: {
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minWidth: 64,
  },
  optCardActive: {
    borderColor: ACCENT,
    backgroundColor: '#FFF7ED',
  },
  optCardDisabled: {
    opacity: 0.4,
  },
  optLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  optLabelActive: {
    color: ACCENT,
    fontWeight: '600',
  },
  optLabelDisabled: {
    color: '#D1D5DB',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  templateCard: {
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minWidth: 72,
  },
  templateCardActive: {
    borderColor: ACCENT,
    backgroundColor: '#FFF7ED',
  },
  templatePreview: {
    width: 56,
    height: 72,
    backgroundColor: '#1A1A2E',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatePreviewText: {
    color: '#FFFFFF80',
    fontSize: 18,
    fontWeight: '700',
  },
  dataList: {
    paddingHorizontal: 20,
    gap: 4,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dataLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  dataLabelDisabled: {
    color: '#D1D5DB',
  },
  stickerCard: {
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    minWidth: 72,
  },
  stickerPreview: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  dimLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dimTrack: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  dimDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimDotActive: {
    borderColor: ACCENT,
  },
  dimDotInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#374151',
  },
});
