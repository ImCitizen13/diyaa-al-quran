import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Animated, { FadeIn } from "react-native-reanimated";
import { colors } from "@/constants/colors";
import { AnimatedProgressFill } from "../Theme";
import { BISMILLAH, SurahMeta } from "@/lib/quran-data";

export default function SurahHeader({
  meta,
        memorized,
        total,
        percentage,
  showBismillah,
}: {
  meta: SurahMeta;
  memorized: number;
  total: number;
  percentage: number;
  showBismillah: boolean;
}) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.surahHeader}>
      <Text style={styles.surahTitleAr}>{meta.titleAr}</Text>
      <Text style={styles.surahTitleEn}>{meta.title.toUpperCase()}</Text>
      <Text style={styles.surahMeta}>
        {meta.type} · {meta.count} Verses · Juz {meta.juzList[0]?.index || "?"}
      </Text>
      <View style={styles.progressBar}>
        <AnimatedProgressFill percentage={percentage} />
      </View>
      <Text style={styles.progressText}>
        {memorized} / {total} memorized
      </Text>
      {showBismillah && <Text style={styles.bismillah}>{BISMILLAH}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  surahHeader: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  decorDots: {
    color: colors.gold.primary,
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 8,
  },
  surahTitleAr: {
    fontSize: 32,
    color: colors.gold.primary,
    fontFamily: "Amiri_700Bold",
    textAlign: "center" as const,
  },
  surahTitleEn: {
    fontSize: 12,
    color: colors.text.muted,
    letterSpacing: 3,
    marginTop: 6,
  },
  surahMeta: {
    fontSize: 12,
    color: colors.text.label,
    marginTop: 4,
  },

  progressBar: {
    width: "60%",
    height: 3,
    backgroundColor: colors.bg.elevated,
    borderRadius: 2,
    marginTop: 16,
    overflow: "hidden",
  },

  progressText: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 6,
  },
  bismillah: {
    fontSize: 24,
    color: colors.text.arabicDefault,
    fontFamily: "Amiri_400Regular",
    marginTop: 24,
    textAlign: "center" as const,
  },
});
