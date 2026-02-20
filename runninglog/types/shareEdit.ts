export type AspectRatio = '9:16' | '1:1';

export type BackgroundType = 'gallery' | 'map' | 'color';

export type TemplateId = 'basic' | 'minimal' | 'nature' | 'energy';

export type MainTab = 'background' | 'template' | 'data' | 'sticker';

export type StickerType = 'logo' | 'pb' | 'complete_run';

export interface StickerItem {
  id: string;
  type: StickerType;
  /** Normalized x position (0-1) relative to canvas */
  x: number;
  /** Normalized y position (0-1) relative to canvas */
  y: number;
}

export interface DataToggles {
  showDistance: boolean;
  showTime: boolean;
  showPace: boolean;
  showHeartRate: boolean;
  showWeather: boolean;
}

export interface ShareEditState {
  aspectRatio: AspectRatio;
  backgroundType: BackgroundType;
  backgroundUri: string | null;
  backgroundColor: string;
  dimLevel: number;
  templateId: TemplateId;
  dataToggles: DataToggles;
  stickers: StickerItem[];
  activeTab: MainTab;
  isExporting: boolean;
}

export interface ShareCardData {
  date: string;
  distanceKm: string;
  paceDisplay: string;
  timeDisplay: string;
  heartRate: string | null;
  hasRoute: boolean;
  hasHeartRate: boolean;
}
