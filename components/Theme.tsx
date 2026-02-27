import { StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { colors } from "@/constants/colors";

export default function AppHeader() {
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
      <Text style={styles.appTitle}>Diyaa Al-Quran</Text>
      <Text style={styles.appSubtitle}>ضياء القرآن</Text>
    </Animated.View>
  );
}

export function AnimatedProgressFill({ percentage }: { percentage: number }) {
  const widthPct = useSharedValue(0);

  useEffect(() => {
    widthPct.value = withDelay(
      400,
      withTiming(Math.round(percentage * 100), {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [percentage]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPct.value}%` as any,
  }));

  return <Animated.View style={[styles.progressFill, fillStyle]} />;
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.gold.primary,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.gold.dim,
    fontFamily: "Amiri_700Bold",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.gold.primary,
    borderRadius: 2,
  },
});
