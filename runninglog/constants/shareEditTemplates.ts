import type { TemplateId, TextTheme } from '@/types/shareEdit';

export interface TemplateBlock {
  top: number;
  left: number;
  fontSize: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface TemplateLayout {
  id: TemplateId;
  label: string;
  blocks: {
    date: TemplateBlock;
    distance: TemplateBlock;
    distanceUnit: TemplateBlock;
    pace: TemplateBlock;
    paceLabel: TemplateBlock;
    time: TemplateBlock;
    timeLabel: TemplateBlock;
    route: TemplateBlock;
    logo: TemplateBlock;
  };
}

const WHITE = '#FFFFFF';
const MUTED = '#FFFFFFB3';

export const TEMPLATES: TemplateLayout[] = [
  {
    id: 'basic',
    label: '기본형',
    blocks: {
      date: { top: 0.08, left: 0.5, fontSize: 13, textAlign: 'center', color: MUTED },
      distance: { top: 0.22, left: 0.5, fontSize: 52, fontWeight: '700', textAlign: 'center', color: WHITE },
      distanceUnit: { top: 0.32, left: 0.5, fontSize: 16, textAlign: 'center', color: MUTED },
      pace: { top: 0.44, left: 0.3, fontSize: 22, fontWeight: '600', textAlign: 'center', color: WHITE },
      paceLabel: { top: 0.50, left: 0.3, fontSize: 12, textAlign: 'center', color: MUTED },
      time: { top: 0.44, left: 0.7, fontSize: 22, fontWeight: '600', textAlign: 'center', color: WHITE },
      timeLabel: { top: 0.50, left: 0.7, fontSize: 12, textAlign: 'center', color: MUTED },
      route: { top: 0.62, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      logo: { top: 0.88, left: 0.5, fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#FFFFFF80' },
    },
  },
  {
    id: 'minimal',
    label: '미니멀',
    blocks: {
      date: { top: 0.06, left: 0.08, fontSize: 12, textAlign: 'left', color: MUTED },
      distance: { top: 0.14, left: 0.08, fontSize: 56, fontWeight: '700', textAlign: 'left', color: WHITE },
      distanceUnit: { top: 0.25, left: 0.08, fontSize: 16, textAlign: 'left', color: MUTED },
      pace: { top: 0.78, left: 0.08, fontSize: 20, fontWeight: '600', textAlign: 'left', color: WHITE },
      paceLabel: { top: 0.83, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      time: { top: 0.78, left: 0.5, fontSize: 20, fontWeight: '600', textAlign: 'left', color: WHITE },
      timeLabel: { top: 0.83, left: 0.5, fontSize: 11, textAlign: 'left', color: MUTED },
      route: { top: 0.48, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      logo: { top: 0.92, left: 0.92, fontSize: 12, fontWeight: '600', textAlign: 'right', color: '#FFFFFF80' },
    },
  },
  {
    id: 'nature',
    label: '네이처',
    blocks: {
      date: { top: 0.88, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      distance: { top: 0.10, left: 0.5, fontSize: 60, fontWeight: '700', textAlign: 'center', color: WHITE },
      distanceUnit: { top: 0.22, left: 0.5, fontSize: 18, textAlign: 'center', color: MUTED },
      pace: { top: 0.32, left: 0.5, fontSize: 18, fontWeight: '600', textAlign: 'center', color: WHITE },
      paceLabel: { top: 0.37, left: 0.5, fontSize: 11, textAlign: 'center', color: MUTED },
      time: { top: 0.42, left: 0.5, fontSize: 18, fontWeight: '600', textAlign: 'center', color: WHITE },
      timeLabel: { top: 0.47, left: 0.5, fontSize: 11, textAlign: 'center', color: MUTED },
      route: { top: 0.60, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      logo: { top: 0.94, left: 0.5, fontSize: 13, fontWeight: '600', textAlign: 'center', color: '#FFFFFF60' },
    },
  },
  {
    id: 'energy',
    label: '에너지',
    blocks: {
      date: { top: 0.06, left: 0.92, fontSize: 12, textAlign: 'right', color: MUTED },
      distance: { top: 0.72, left: 0.08, fontSize: 64, fontWeight: '800', textAlign: 'left', color: WHITE },
      distanceUnit: { top: 0.84, left: 0.08, fontSize: 20, fontWeight: '700', textAlign: 'left', color: '#FF6F00' },
      pace: { top: 0.08, left: 0.08, fontSize: 24, fontWeight: '700', textAlign: 'left', color: WHITE },
      paceLabel: { top: 0.14, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      time: { top: 0.20, left: 0.08, fontSize: 24, fontWeight: '700', textAlign: 'left', color: WHITE },
      timeLabel: { top: 0.26, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      route: { top: 0.48, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      logo: { top: 0.94, left: 0.92, fontSize: 14, fontWeight: '700', textAlign: 'right', color: '#FF6F00CC' },
    },
  },
];

export const BACKGROUND_COLORS = [
  { id: 'transparent', color: 'transparent', label: '투명' },
  { id: 'dark', color: '#1A1A2E', label: '컬러1' },
  { id: 'orange', color: '#FF6F00', label: '컬러2' },
  { id: 'navy', color: '#0D1B2A', label: '컬러3' },
  { id: 'forest', color: '#1B4332', label: '컬러4' },
] as const;

export interface TextThemeColors {
  primary: string;
  secondary: string;
  muted: string;
  logo: string;
}

export const TEXT_THEMES: { id: TextTheme; label: string; colors: TextThemeColors }[] = [
  {
    id: 'default',
    label: '기본 테마',
    colors: { primary: '#FF6F00', secondary: '#FFFFFF', muted: '#FFFFFFB3', logo: '#FFFFFF80' },
  },
  {
    id: 'white',
    label: '화이트',
    colors: { primary: '#FFFFFF', secondary: '#FFFFFF', muted: '#FFFFFFB3', logo: '#FFFFFF80' },
  },
  {
    id: 'black',
    label: '블랙',
    colors: { primary: '#000000', secondary: '#000000', muted: '#000000B3', logo: '#00000080' },
  },
];

export function getThemeBlockColor(
  blockKey: string,
  colors: TextThemeColors,
): string {
  switch (blockKey) {
    case 'dist': return colors.primary;
    case 'pace':
    case 'time':
    case 'hr': return colors.secondary;
    case 'logo': return colors.logo;
    default: return colors.muted;
  }
}

export const DEFAULT_DATA_TOGGLES = {
  showDistance: true,
  showTime: true,
  showPace: true,
  showHeartRate: false,
  showWeather: false,
} as const;
