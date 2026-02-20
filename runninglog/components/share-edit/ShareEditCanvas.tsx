import { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import ViewShot from 'react-native-view-shot';
import { Calendar, MapPin } from 'lucide-react-native';

import { RoutePathSvg } from './RoutePathSvg';
import { TEMPLATES } from '@/constants/shareEditTemplates';
import type { ShareEditState, ShareCardData, StickerItem } from '@/types/shareEdit';
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

    const renderBlock = (
      block: { top: number; left: number; fontSize: number; fontWeight?: string; textAlign?: string; color?: string },
      content: string,
      key: string,
    ) => {
      if (!content) return null;
      const isCenter = block.textAlign === 'center';
      const isRight = block.textAlign === 'right';

      return (
        <Text
          key={key}
          style={[
            s.blockText,
            {
              position: 'absolute',
              top: block.top * canvasH,
              left: isCenter ? 0 : isRight ? undefined : block.left * CANVAS_W,
              right: isRight ? (1 - block.left) * CANVAS_W : undefined,
              width: isCenter ? CANVAS_W : undefined,
              fontSize: block.fontSize,
              fontWeight: (block.fontWeight as any) ?? '400',
              textAlign: (block.textAlign as any) ?? 'center',
              color: block.color ?? '#FFFFFF',
              fontFamily: F.inter400,
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
        {state.backgroundType === 'color' && (
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
          <>
            {renderBlock(template.blocks.distance, cardData.distanceKm, 'dist')}
            {renderBlock(template.blocks.distanceUnit, 'km', 'unit')}
          </>
        )}

        {state.dataToggles.showPace && (
          <>
            {renderBlock(template.blocks.pace, cardData.paceDisplay, 'pace')}
            {renderBlock(template.blocks.paceLabel, 'Pace', 'paceL')}
          </>
        )}

        {state.dataToggles.showTime && (
          <>
            {renderBlock(template.blocks.time, cardData.timeDisplay, 'time')}
            {renderBlock(template.blocks.timeLabel, 'Time', 'timeL')}
          </>
        )}

        {state.dataToggles.showHeartRate && cardData.heartRate && (
          renderBlock(template.blocks.pace, `${cardData.heartRate} bpm`, 'hr')
        )}

        {/* GPS route placeholder */}
        {cardData.hasRoute && state.backgroundType !== 'map' && (
          <View
            style={[
              s.routeBadge,
              {
                position: 'absolute',
                top: template.blocks.route.top * canvasH - 16,
                alignSelf: 'center',
                left: 0,
                right: 0,
              },
            ]}
          >
            <View style={s.routeInner}>
              <MapPin size={14} color="#FFFFFFB3" />
              <Text style={s.routeText}>GPS 경로</Text>
            </View>
          </View>
        )}

        {/* Logo watermark */}
        {renderBlock(template.blocks.logo, 'RunningLog', 'logo')}

        {/* Layer 4: Stickers */}
        {state.stickers.map((sticker) => (
          <View
            key={sticker.id}
            style={[
              s.stickerWrap,
              {
                position: 'absolute',
                top: sticker.y * canvasH - 16,
                left: sticker.x * CANVAS_W - 24,
              },
            ]}
          >
            {sticker.type === 'logo' && (
              <View style={s.stickerBadge}>
                <Text style={s.stickerBadgeText}>RunningLog</Text>
              </View>
            )}
            {sticker.type === 'pb' && (
              <View style={[s.stickerBadge, { backgroundColor: '#FFD700' }]}>
                <Text style={[s.stickerBadgeText, { color: '#000' }]}>PB</Text>
              </View>
            )}
            {sticker.type === 'complete_run' && (
              <View style={[s.stickerBadge, { backgroundColor: '#4ADE80' }]}>
                <Text style={[s.stickerBadgeText, { color: '#000' }]}>완런</Text>
              </View>
            )}
          </View>
        ))}
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
  routeBadge: {
    alignItems: 'center',
  },
  routeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  routeText: {
    color: '#FFFFFFB3',
    fontSize: 12,
  },
  stickerWrap: {
    zIndex: 100,
  },
  stickerBadge: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stickerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
