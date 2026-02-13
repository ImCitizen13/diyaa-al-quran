import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { skiaAvailable, Canvas, SkiaOrbShape, getGlowColors } from '@/components/GlowOrb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface OrbData {
  id: string;
  intensity: number;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

interface SkiaOrbGridProps {
  data: OrbData[];
  orbSize: number;
  paddingHorizontal?: number;
}

interface OrbPosition {
  x: number;
  y: number;
  row: number;
  col: number;
}

export default function SkiaOrbGrid({ data, orbSize, paddingHorizontal = 12 }: SkiaOrbGridProps) {
  const cellWidth = orbSize + 20;
  const canvasOrbSize = orbSize * 2;
  const cellHeight = canvasOrbSize + 30;

  const availableWidth = SCREEN_WIDTH - paddingHorizontal * 2;
  const orbsPerRow = Math.floor(availableWidth / cellWidth);
  const totalRows = Math.ceil(data.length / orbsPerRow);
  const gridWidth = orbsPerRow * cellWidth;
  const offsetX = (availableWidth - gridWidth) / 2;

  const positions = useMemo((): OrbPosition[] => {
    return data.map((_, index) => {
      const row = Math.floor(index / orbsPerRow);
      const col = index % orbsPerRow;
      const x = offsetX + col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + canvasOrbSize / 2;
      return { x, y, row, col };
    });
  }, [data.length, orbsPerRow, cellWidth, cellHeight, offsetX, canvasOrbSize]);

  const canvasHeight = totalRows * cellHeight;

  if (!skiaAvailable || Platform.OS === 'web') {
    return (
      <View style={[styles.fallbackGrid, { paddingHorizontal }]}>
        {data.map((orb, index) => (
          <FallbackOrb key={orb.id} orb={orb} orbSize={orbSize} delay={Math.min(index * 15, 1500)} />
        ))}
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ width: availableWidth, alignSelf: 'center' }}>
      <Canvas style={{ width: availableWidth, height: canvasHeight }}>
        {data.map((orb, index) => {
          const pos = positions[index];
          return (
            <SkiaOrbShape
              key={orb.id}
              intensity={orb.intensity}
              size={orbSize}
              cx={pos.x}
              cy={pos.y}
            />
          );
        })}
      </Canvas>

      <View style={[StyleSheet.absoluteFill, { width: availableWidth, height: canvasHeight }]}>
        {data.map((orb, index) => {
          const pos = positions[index];
          const percentage = Math.round(orb.intensity * 100);

          return (
            <Pressable
              key={orb.id}
              onPress={orb.onPress}
              onLongPress={orb.onLongPress}
              style={({ pressed }) => [
                styles.orbTouchTarget,
                {
                  position: 'absolute',
                  left: pos.x - cellWidth / 2,
                  top: pos.y - canvasOrbSize / 2,
                  width: cellWidth,
                  height: cellHeight,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                },
              ]}
            >
              <View style={{ height: canvasOrbSize, justifyContent: 'center', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.orbLabel,
                    {
                      fontSize: orbSize * 0.22,
                      color: orb.intensity > 0.3 ? '#fff' : colors.text.muted,
                    },
                  ]}
                >
                  {orb.label}
                </Text>
              </View>
              {orb.sublabel && (
                <Text style={[styles.sublabel, { maxWidth: orbSize + 16 }]} numberOfLines={1}>{orb.sublabel}</Text>
              )}
              {orb.intensity > 0 && orb.intensity < 1 && (
                <Text style={styles.percentLabel}>{percentage}%</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

function FallbackOrb({ orb, orbSize, delay }: { orb: OrbData; orbSize: number; delay: number }) {
  const glowSize = orbSize * 1.6;
  const glowColors = getGlowColors(orb.intensity);
  const percentage = Math.round(orb.intensity * 100);
  const bgColor = orb.intensity <= 0
    ? colors.orb.empty
    : orb.intensity >= 1
      ? colors.gold.bright
      : `rgba(${glowColors.core[0]}, ${glowColors.core[1]}, ${glowColors.core[2]}, 1)`;
  const borderColor = orb.intensity > 0
    ? `rgba(${glowColors.glow[0]}, ${glowColors.glow[1]}, ${glowColors.glow[2]}, ${glowColors.alpha * 0.5})`
    : 'rgba(255,255,255,0.05)';

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400)}
      style={[styles.fallbackContainer, { width: orbSize + 20 }]}
    >
      <Pressable
        onPress={orb.onPress}
        onLongPress={orb.onLongPress}
        style={({ pressed }) => [
          styles.orbTouchTarget,
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        <View style={[styles.fallbackOrbWrapper, { width: glowSize, height: glowSize }]}>
          {orb.intensity > 0 && (
            <View
              style={{
                position: 'absolute',
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: `rgba(${glowColors.glow[0]}, ${glowColors.glow[1]}, ${glowColors.glow[2]}, ${glowColors.alpha * 0.3})`,
              }}
            />
          )}
          <View
            style={{
              width: orbSize,
              height: orbSize,
              borderRadius: orbSize / 2,
              backgroundColor: bgColor,
              borderWidth: 1,
              borderColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={[
                styles.orbLabel,
                {
                  fontSize: orbSize * 0.22,
                  color: orb.intensity > 0.3 ? '#fff' : colors.text.muted,
                },
              ]}
            >
              {orb.label}
            </Text>
          </View>
        </View>
        {orb.sublabel && (
          <Text style={[styles.sublabel, { maxWidth: orbSize + 16 }]} numberOfLines={1}>{orb.sublabel}</Text>
        )}
        {orb.intensity > 0 && orb.intensity < 1 && (
          <Text style={styles.percentLabel}>{percentage}%</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fallbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  fallbackContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackOrbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbTouchTarget: {
    alignItems: 'center',
  },
  orbLabel: {
    color: '#fff',
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  sublabel: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  percentLabel: {
    color: colors.gold.bright,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600' as const,
  },
});
