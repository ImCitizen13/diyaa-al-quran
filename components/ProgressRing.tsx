import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  fillDelay?: number;
  glowPulse?: boolean;
}

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  label,
  sublabel,
  showPercentage = true,
  fillDelay = 0,
  glowPulse = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const fillProgress = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withDelay(
      fillDelay,
      withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) })
    );

    if (glowPulse && progress > 0) {
      // Initial burst
      glowOpacity.value = withDelay(
        fillDelay,
        withSequence(
          withTiming(0.6, { duration: 400 }),
          withTiming(0.15, { duration: 600 }),
          withRepeat(
            withSequence(
              withTiming(0.3, { duration: 1500 }),
              withTiming(0.1, { duration: 1500 }),
            ),
            -1,
            true
          )
        )
      );
      glowScale.value = withDelay(
        fillDelay,
        withSequence(
          withTiming(1.3, { duration: 400 }),
          withTiming(1.1, { duration: 600 }),
          withRepeat(
            withSequence(
              withTiming(1.2, { duration: 1500 }),
              withTiming(1.05, { duration: 1500 }),
            ),
            -1,
            true
          )
        )
      );
    }
  }, [progress, fillDelay, glowPulse]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - fillProgress.value),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const glowSize = size * 1.4;

  return (
    <View style={[styles.container, { width: glowPulse ? glowSize : size, height: glowPulse ? glowSize : size }]}>
      {glowPulse && progress > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: colors.gold.primary,
            },
            glowStyle,
          ]}
        />
      )}
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.bg.elevated}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.gold.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {showPercentage && (
          <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
        )}
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    color: colors.gold.bright,
    fontSize: 28,
    fontWeight: '700' as const,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  sublabel: {
    color: colors.text.muted,
    fontSize: 10,
    marginTop: 1,
  },
});
