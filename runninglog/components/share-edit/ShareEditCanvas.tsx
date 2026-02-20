import { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import ViewShot from 'react-native-view-shot';
import { RoutePathSvg } from './RoutePathSvg';
import { TEMPLATES, TEXT_THEMES, getThemeBlockColor } from '@/constants/shareEditTemplates';
import { Logo } from '@/constants/assets';
import type { ShareEditState, ShareCardData } from '@/types/shareEdit';
import type { ApiCoordinate } from '@/types/activity';
import type { Coordinate } from '@/types/run';
import { F } from '@/constants/theme';

const SCREEN_W = Dimensions.get('window').width;
const CANVAS_W = SCREEN_W - 40;

interface ShareEditCanvasProps {
  state: ShareEditState;
  cardData: ShareCardData;
  routeCoords: Coordinate[] | [number, number][] | ApiCoordinate[];
}

export const ShareEditCanvas = forwardRef<ViewShot, ShareEditCanvasProps>(
  function ShareEditCanvas({ state, cardData, routeCoords }, ref) {
    const canvasH = state.aspectRatio === '9:16'
      ? CANVAS_W * (16 / 9)
      : CANVAS_W;

    const template = useMemo(
      () => TEMPLATES.find((t) => t.id === state.templateId) ?? TEMPLATES[0],
      [state.templateId],
    );

    const themeColors = useMemo(
      () => TEXT_THEMES.find((t) => t.id === state.textTheme)?.colors ?? TEXT_THEMES[0].colors,
      [state.textTheme],
    );

    const NUMERIC_KEYS = new Set(['dist', 'time', 'pace', 'hr']);

    const getFontFamily = (key: string, weight?: string) => {
      if (!NUMERIC_KEYS.has(key)) return F.inter400;
      if (weight === '800') return F.mont800;
      if (weight === '700') return F.mont700;
      return F.mont500;
    };

    const renderBlock = (
      block: { top: number; left: number; fontSize: number; fontWeight?: string; textAlign?: string; color?: string; width?: number },
      content: string,
      key: string,
    ) => {
      if (!content) return null;
      const hasColumnWidth = block.width != null;
      const isCenter = block.textAlign === 'center';
      const isRight = block.textAlign === 'right';
      const color = getThemeBlockColor(key, themeColors);

      let blockLeft: number | undefined;
      let blockRight: number | undefined;
      let blockWidth: number | undefined;

      if (hasColumnWidth) {
        blockLeft = block.left * CANVAS_W;
        blockWidth = block.width! * CANVAS_W;
      } else if (isCenter) {
        blockLeft = 0;
        blockWidth = CANVAS_W;
      } else if (isRight) {
        blockRight = (1 - block.left) * CANVAS_W;
      } else {
        blockLeft = block.left * CANVAS_W;
      }

      return (
        <Text
          key={key}
          style={[
            s.blockText,
            {
              position: 'absolute',
              top: block.top * canvasH,
              left: blockLeft,
              right: blockRight,
              width: blockWidth,
              fontSize: block.fontSize,
              fontWeight: (block.fontWeight as any) ?? '400',
              textAlign: (block.textAlign as any) ?? 'center',
              color,
              fontFamily: getFontFamily(key, block.fontWeight),
            },
          ]}
        >
          {content}
        </Text>
      );
    };

    return (
      <ViewShot
        ref={ref}
        options={{ format: 'png', quality: 1.0 }}
        style={[s.canvas, { width: CANVAS_W, height: canvasH }]}
      >
        {/* Layer 1: Background */}
        {state.backgroundType === 'color' && state.backgroundColor !== 'transparent' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: state.backgroundColor }]} />
        )}
        {state.backgroundType === 'gallery' && state.backgroundUri && (
          <Image
            source={{ uri: state.backgroundUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
        {state.backgroundType === 'map' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A1A2E' }]}>
            {routeCoords.length >= 2 && (
              <RoutePathSvg
                coordinates={routeCoords}
                width={CANVAS_W}
                height={canvasH}
                padding={30}
              />
            )}
          </View>
        )}

        {/* Layer 2: Dim overlay */}
        {state.dimLevel > 0 && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `rgba(0,0,0,${state.dimLevel})` },
            ]}
          />
        )}

        {/* Layer 3: Data text */}
        {renderBlock(template.blocks.date, cardData.date, 'date')}

        {state.dataToggles.showDistance && (
          <Text
            key="dist"
            style={[
              s.blockText,
              {
                position: 'absolute',
                top: template.blocks.distance.top * canvasH,
                left: 0,
                width: CANVAS_W,
                fontSize: template.blocks.distance.fontSize,
                fontWeight: (template.blocks.distance.fontWeight as any) ?? '700',
                textAlign: 'center',
                color: getThemeBlockColor('dist', themeColors),
                fontFamily: getFontFamily('dist', template.blocks.distance.fontWeight),
              },
            ]}
          >
            {cardData.distanceKm}
            <Text style={{ fontSize: template.blocks.distanceUnit.fontSize, color: getThemeBlockColor('unit', themeColors), fontFamily: F.inter400 }}>
              {' km'}
            </Text>
          </Text>
        )}

        {state.dataToggles.showTime && (
          <>
            {renderBlock(template.blocks.time, cardData.timeDisplay, 'time')}
            {renderBlock(template.blocks.timeLabel, '시간', 'timeL')}
          </>
        )}

        {state.dataToggles.showPace && (
          <>
            {renderBlock(template.blocks.pace, cardData.paceDisplay, 'pace')}
            {renderBlock(template.blocks.paceLabel, '페이스', 'paceL')}
          </>
        )}

        {state.dataToggles.showHeartRate && cardData.heartRate && (
          <>
            {renderBlock(template.blocks.heartRate, cardData.heartRate, 'hr')}
            {renderBlock(template.blocks.heartRateLabel, '심박수', 'hrL')}
          </>
        )}

        {/* GPS route drawing */}
        {cardData.hasRoute && routeCoords.length >= 2 && state.backgroundType !== 'map' && (() => {
          const routeW = CANVAS_W * 0.65;
          const routeH = canvasH * 0.22;
          const routeTop = template.blocks.route.top * canvasH - routeH / 2;
          const routeLeft = (CANVAS_W - routeW) / 2;
          return (
            <View
              style={{
                position: 'absolute',
                top: routeTop,
                left: routeLeft,
                width: routeW,
                height: routeH,
              }}
            >
              <RoutePathSvg
                coordinates={routeCoords}
                width={routeW}
                height={routeH}
                strokeColor={themeColors.muted}
                strokeWidth={2}
                padding={8}
              />
            </View>
          );
        })()}

        {/* Logo watermark */}
        <View style={s.logoContainer}>
          <Image
            source={Logo.png}
            style={s.logoImage}
            contentFit="contain"
          />
        </View>
      </ViewShot>
    );
  },
);

const s = StyleSheet.create({
  canvas: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  blockText: {
    letterSpacing: 0.3,
  },
  logoContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  logoImage: {
    width: 22,
    height: 22,
  },
});
