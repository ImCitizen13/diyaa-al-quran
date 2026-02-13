import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface GlowOrbProps {
  intensity: number;
  label: string;
  sublabel?: string;
  size?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  delay?: number;
}

function getOrbColors(intensity: number): { core: string; glow: string; border: string } {
  if (intensity <= 0) {
    return { core: colors.orb.empty, glow: 'transparent', border: 'rgba(255,255,255,0.05)' };
  }
  if (intensity < 0.25) {
    return { core: `rgba(212, 175, 55, ${0.15 + intensity})`, glow: colors.orb.dimGlow, border: 'rgba(212, 175, 55, 0.15)' };
  }
  if (intensity < 0.5) {
    return { core: `rgba(212, 175, 55, ${0.3 + intensity})`, glow: colors.orb.midGlow, border: 'rgba(212, 175, 55, 0.25)' };
  }
  if (intensity < 0.75) {
    return { core: colors.gold.primary, glow: colors.orb.strongGlow, border: 'rgba(212, 175, 55, 0.4)' };
  }
  if (intensity < 1) {
    return { core: colors.gold.bright, glow: colors.gold.primary, border: 'rgba(255, 215, 0, 0.5)' };
  }
  return { core: colors.gold.bright, glow: colors.gold.bright, border: 'rgba(255, 215, 0, 0.7)' };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GlowOrb({ intensity, label, sublabel, size = 56, onPress, onLongPress, delay = 0 }: GlowOrbProps) {
  const orbColors = getOrbColors(intensity);
  const glowSize = size * 1.6;
  const percentage = Math.round(intensity * 100);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: withTiming(intensity > 0 ? Math.min(intensity * 1.2, 1) : 0, { duration: 500 }),
  }));

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
        <View style={[styles.orbWrapper, { width: glowSize, height: glowSize }]}>
          <Animated.View
            style={[
              styles.glowLayer,
              {
                width: glowSize,
                height: glowSize,
                borderRadius: glowSize / 2,
                backgroundColor: orbColors.glow,
              },
              animatedGlowStyle,
            ]}
          />

          {intensity >= 1 ? (
            <LinearGradient
              colors={['#ffd700', colors.gold.primary, 'rgba(212, 175, 55, 0.6)']}
              style={[
                styles.orbCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: orbColors.border,
                },
              ]}
            >
              <View style={[styles.innerGlow, { width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2 }]} />
              <Text style={[styles.orbLabel, { fontSize: size * 0.22 }]}>{label}</Text>
            </LinearGradient>
          ) : (
            <View
              style={[
                styles.orbCircle,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: intensity > 0 ? orbColors.core : colors.orb.empty,
                  borderColor: orbColors.border,
                },
              ]}
            >
              {intensity >= 0.5 && (
                <View style={[styles.innerGlow, { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, opacity: intensity }]} />
              )}
              <Text style={[styles.orbLabel, { fontSize: size * 0.22, color: intensity > 0.3 ? '#fff' : colors.text.muted }]}>{label}</Text>
            </View>
          )}
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
  glowLayer: {
    position: 'absolute',
  },
  orbCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
