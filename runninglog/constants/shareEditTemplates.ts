import type { TemplateId, TextTheme } from '@/types/shareEdit';

export interface TemplateBlock {
  top: number;
  left: number;
  fontSize: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  /** 0-1 fraction of canvas width; when set, text is constrained to this column */
  width?: number;
}

export interface TemplateLayout {
  id: TemplateId;
  label: string;
  blocks: {
    date: TemplateBlock;
    distance: TemplateBlock;
    distanceUnit: TemplateBlock;
    time: TemplateBlock;
    timeLabel: TemplateBlock;
    pace: TemplateBlock;
    paceLabel: TemplateBlock;
    heartRate: TemplateBlock;
    heartRateLabel: TemplateBlock;
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
      date: { top: 0.05, left: 0.5, fontSize: 13, textAlign: 'center', color: MUTED },
      distance: { top: 0.12, left: 0.5, fontSize: 52, fontWeight: '700', textAlign: 'center', color: WHITE },
      distanceUnit: { top: 0.22, left: 0.5, fontSize: 16, textAlign: 'center', color: MUTED },
      time: { top: 0.28, left: 0.5, fontSize: 34, fontWeight: '600', textAlign: 'center', color: WHITE },
      timeLabel: { top: 0.35, left: 0.5, fontSize: 1, textAlign: 'center', color: 'transparent' },
      pace: { top: 0.42, left: 0, width: 0.5, fontSize: 22, fontWeight: '600', textAlign: 'center', color: WHITE },
      paceLabel: { top: 0.48, left: 0, width: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      heartRate: { top: 0.42, left: 0.5, width: 0.5, fontSize: 22, fontWeight: '600', textAlign: 'center', color: WHITE },
      heartRateLabel: { top: 0.48, left: 0.5, width: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
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
      time: { top: 0.78, left: 0.5, fontSize: 20, fontWeight: '600', textAlign: 'left', color: WHITE },
      timeLabel: { top: 0.83, left: 0.5, fontSize: 11, textAlign: 'left', color: MUTED },
      pace: { top: 0.78, left: 0.08, fontSize: 20, fontWeight: '600', textAlign: 'left', color: WHITE },
      paceLabel: { top: 0.83, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      heartRate: { top: 0.88, left: 0.08, fontSize: 20, fontWeight: '600', textAlign: 'left', color: WHITE },
      heartRateLabel: { top: 0.91, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
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
      time: { top: 0.42, left: 0.5, fontSize: 18, fontWeight: '600', textAlign: 'center', color: WHITE },
      timeLabel: { top: 0.47, left: 0.5, fontSize: 11, textAlign: 'center', color: MUTED },
      pace: { top: 0.32, left: 0.5, fontSize: 18, fontWeight: '600', textAlign: 'center', color: WHITE },
      paceLabel: { top: 0.37, left: 0.5, fontSize: 11, textAlign: 'center', color: MUTED },
      heartRate: { top: 0.52, left: 0.5, fontSize: 18, fontWeight: '600', textAlign: 'center', color: WHITE },
      heartRateLabel: { top: 0.57, left: 0.5, fontSize: 11, textAlign: 'center', color: MUTED },
      route: { top: 0.68, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
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
      time: { top: 0.20, left: 0.08, fontSize: 24, fontWeight: '700', textAlign: 'left', color: WHITE },
      timeLabel: { top: 0.26, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      pace: { top: 0.08, left: 0.08, fontSize: 24, fontWeight: '700', textAlign: 'left', color: WHITE },
      paceLabel: { top: 0.14, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      heartRate: { top: 0.32, left: 0.08, fontSize: 24, fontWeight: '700', textAlign: 'left', color: WHITE },
      heartRateLabel: { top: 0.38, left: 0.08, fontSize: 11, textAlign: 'left', color: MUTED },
      route: { top: 0.52, left: 0.5, fontSize: 12, textAlign: 'center', color: MUTED },
      logo: { top: 0.94, left: 0.92, fontSize: 14, fontWeight: '700', textAlign: 'right', color: '#FF6F00CC' },
    },
  },
];

export const BACKGROUND_COLORS = [
  { id: 'transparent', color: 'transparent', label: '투명' },
  { id: 'white', color: '#FFFFFF', label: '화이트' },
  { id: 'black', color: '#000000', label: '블랙' },
  { id: 'orange', color: '#ff6f00', label: '오렌지' },
] as const;

export interface TextThemeColors {
  primary: string;
  secondary: string;
  muted: string;
  logo: string;
}

export const TEXT_THEMES: { id: TextTheme; label: string; colors: TextThemeColors }[] = [
  {
    id: 'defaultBlack',
    label: '기본 블랙',
    colors: { primary: '#FF6F00', secondary: '#000000', muted: '#000000B3', logo: '#00000080' },
  },
  {
    id: 'default',
    label: '기본 화이트',
    colors: { primary: '#FF6F00', secondary: '#FFFFFF', muted: '#FFFFFFB3', logo: '#FFFFFF80' },
  },
  {
    id: 'black',
    label: '블랙',
    colors: { primary: '#000000', secondary: '#000000', muted: '#000000B3', logo: '#00000080' },
  },
  {
    id: 'white',
    label: '화이트',
    colors: { primary: '#FFFFFF', secondary: '#FFFFFF', muted: '#FFFFFFB3', logo: '#FFFFFF80' },
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
