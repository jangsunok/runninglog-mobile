export type AspectRatio = '9:16' | '1:1';

export type BackgroundType = 'gallery' | 'map' | 'color';

export type TemplateId = 'basic' | 'minimal' | 'nature' | 'energy';

export type MainTab = 'text' | 'background' | 'template' | 'data';

export type TextTheme = 'default' | 'defaultBlack' | 'white' | 'black';

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
  textTheme: TextTheme;
  dataToggles: DataToggles;
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
