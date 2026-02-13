import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '@/constants/colors';

let Canvas: any, Circle: any, RadialGradient: any, vec: any, BlurMask: any, Group: any;
let skiaAvailable = false;

try {
  if (Platform.OS !== 'web') {
    const skia = require('@shopify/react-native-skia');
    Canvas = skia.Canvas;
    Circle = skia.Circle;
    RadialGradient = skia.RadialGradient;
    vec = skia.vec;
    BlurMask = skia.BlurMask;
    Group = skia.Group;
    skiaAvailable = true;
  }
} catch (e) {
  skiaAvailable = false;
}

export { skiaAvailable, Canvas, Circle, RadialGradient, vec, BlurMask, Group };

export interface GlowOrbProps {
  intensity: number;
  label: string;
  sublabel?: string;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  delay?: number;
}

export function getGlowColors(intensity: number) {
  if (intensity <= 0) return { core: [42, 42, 58], glow: [42, 42, 58], alpha: 0 };
  if (intensity < 0.25) return { core: [120, 100, 40], glow: [212, 175, 55], alpha: 0.2 };
  if (intensity < 0.5) return { core: [180, 150, 50], glow: [212, 175, 55], alpha: 0.4 };
  if (intensity < 0.75) return { core: [212, 175, 55], glow: [255, 215, 0], alpha: 0.6 };
  if (intensity < 1) return { core: [240, 200, 40], glow: [255, 215, 0], alpha: 0.8 };
  return { core: [255, 215, 0], glow: [255, 230, 100], alpha: 1.0 };
}

export function SkiaOrbShape({ intensity, size, cx, cy }: { intensity: number; size: number; cx: number; cy: number }) {
  if (!skiaAvailable) return null;

  const glowColors = getGlowColors(intensity);
  const coreColor = `rgba(${glowColors.core[0]}, ${glowColors.core[1]}, ${glowColors.core[2]}, 1)`;
  const glowColor = `rgba(${glowColors.glow[0]}, ${glowColors.glow[1]}, ${glowColors.glow[2]}, ${glowColors.alpha})`;
  const outerGlow = `rgba(${glowColors.glow[0]}, ${glowColors.glow[1]}, ${glowColors.glow[2]}, ${glowColors.alpha * 0.3})`;

  return (
    <Group>
      {intensity > 0 && (
        <Group>
          <Circle cx={cx} cy={cy} r={size * 0.9}>
            <RadialGradient
              c={vec(cx, cy)}
              r={size * 0.9}
              colors={[outerGlow, 'transparent']}
            />
          </Circle>

          <Circle cx={cx} cy={cy} r={size * 0.65}>
            <BlurMask blur={size * 0.15 * intensity} style="normal" />
            <RadialGradient
              c={vec(cx, cy)}
              r={size * 0.65}
              colors={[glowColor, 'transparent']}
            />
          </Circle>
        </Group>
      )}

      <Circle cx={cx} cy={cy} r={size / 2}>
        <RadialGradient
          c={vec(cx - size * 0.1, cy - size * 0.1)}
          r={size / 2}
          colors={
            intensity >= 1
              ? ['rgba(255, 240, 180, 1)', coreColor, `rgba(${glowColors.core[0]}, ${glowColors.core[1]}, ${glowColors.core[2]}, 0.7)`]
              : intensity > 0
                ? [`rgba(${glowColors.core[0] + 30}, ${glowColors.core[1] + 20}, ${glowColors.core[2] + 10}, 1)`, coreColor]
                : ['#3a3a4f', '#2a2a3a']
          }
        />
      </Circle>

      {intensity >= 0.5 && (
        <Circle cx={cx - size * 0.08} cy={cy - size * 0.08} r={size * 0.15}>
          <RadialGradient
            c={vec(cx - size * 0.08, cy - size * 0.08)}
            r={size * 0.15}
            colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
          />
        </Circle>
      )}
    </Group>
  );
}

function FallbackGlowOrb({ intensity, size }: { intensity: number; size: number }) {
  const glowSize = size * 1.6;
  const glowColors = getGlowColors(intensity);
  const bgColor = intensity <= 0
    ? colors.orb.empty
    : intensity >= 1
      ? colors.gold.bright
      : `rgba(${glowColors.core[0]}, ${glowColors.core[1]}, ${glowColors.core[2]}, 1)`;
  const borderColor = intensity > 0
    ? `rgba(${glowColors.glow[0]}, ${glowColors.glow[1]}, ${glowColors.glow[2]}, ${glowColors.alpha * 0.5})`
    : 'rgba(255,255,255,0.05)';

  return (
    <View style={[styles.orbWrapper, { width: glowSize, height: glowSize }]}>
      {intensity > 0 && (
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
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
        }}
      />
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GlowOrb({ intensity, label, sublabel, size = 56, onPress, onLongPress, delay = 0 }: GlowOrbProps) {
  const percentage = Math.round(intensity * 100);
  const canvasSize = size * 2;

  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(400)}
      style={[styles.container, { width: size + 20, alignItems: 'center' }]}
    >
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.pressable,
          { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        <View style={{ width: canvasSize, height: canvasSize, alignItems: 'center', justifyContent: 'center' }}>
          {skiaAvailable ? (
            <Canvas style={{ width: canvasSize, height: canvasSize }}>
              <SkiaOrbShape intensity={intensity} size={size} cx={canvasSize / 2} cy={canvasSize / 2} />
            </Canvas>
          ) : (
            <FallbackGlowOrb intensity={intensity} size={size} />
          )}
          <Text
            style={[
              styles.orbLabel,
              {
                fontSize: size * 0.22,
                position: 'absolute',
                color: intensity > 0.3 ? '#fff' : colors.text.muted,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      </AnimatedPressable>
      {sublabel && (
        <Text style={[styles.sublabel, { maxWidth: size + 16 }]} numberOfLines={1}>{sublabel}</Text>
      )}
      {intensity > 0 && intensity < 1 && (
        <Text style={styles.percentLabel}>{percentage}%</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbLabel: {
    color: '#fff',
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  sublabel: {
    color: colors.text.label,
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center' as const,
  },
  percentLabel: {
    color: colors.gold.dim,
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600' as const,
  },
});
