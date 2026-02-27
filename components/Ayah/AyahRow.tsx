import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Ayah } from '@/lib/quran-data';


export const INTENSITY_LEVELS = [
  {
    value: 0.25,
    label: "Just Started",
    icon: "sparkles-outline" as const,
    color: "rgba(212, 175, 55, 0.4)",
  },
  {
    value: 0.5,
    label: "Learning",
    icon: "book-outline" as const,
    color: "rgba(212, 175, 55, 0.6)",
  },
  {
    value: 0.75,
    label: "Almost There",
    icon: "flame-outline" as const,
    color: "rgba(212, 175, 55, 0.8)",
  },
  {
    value: 1.0,
    label: "Fully Memorized",
    icon: "star" as const,
    color: colors.gold.primary,
  },
];

export default function AyahRow({
  ayah,
  memorized,
  selected,
  isSelecting,
  intensity,
  onPress,
  onLongPress,
}: {
  ayah: Ayah;
  memorized: boolean;
  selected: boolean;
  isSelecting: boolean;
  intensity: number;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const intensityAlpha = memorized ? Math.max(0.04, intensity * 0.12) : 0;
  const borderAlpha = memorized ? Math.max(0.08, intensity * 0.3) : 0;

  const bgColor = selected
    ? "rgba(255, 215, 0, 0.12)"
    : memorized
    ? `rgba(212, 175, 55, ${intensityAlpha})`
    : "transparent";

  const borderColor = selected
    ? "rgba(255, 215, 0, 0.3)"
    : memorized
    ? `rgba(212, 175, 55, ${borderAlpha})`
    : "transparent";

  const intensityLevel = INTENSITY_LEVELS.find(
    (l) => Math.abs(l.value - intensity) < 0.01
  );

  return (
    <Pressable
      onPress={isSelecting ? onPress : undefined}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.ayahRow,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: pressed && isSelecting ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.ayahContent}>
        <Text style={[styles.ayahText, memorized && styles.ayahTextMemorized]}>
          {ayah.text}
        </Text>
        <View style={styles.ayahFooter}>
          <View style={styles.ayahFooterLeft}>
            <View
              style={[
                styles.ayahNumberBadge,
                memorized && styles.ayahNumberMemorized,
              ]}
            >
              <Text
                style={[
                  styles.ayahNumber,
                  memorized && { color: colors.gold.bright },
                ]}
              >
                {ayah.ayahNumber}
              </Text>
            </View>
            {memorized && !isSelecting && intensityLevel && intensity < 1 && (
              <View style={styles.intensityBadge}>
                <Ionicons
                  name={intensityLevel.icon}
                  size={12}
                  color={intensityLevel.color}
                />
                <Text
                  style={[
                    styles.intensityBadgeText,
                    { color: intensityLevel.color },
                  ]}
                >
                  {intensityLevel.label}
                </Text>
              </View>
            )}
          </View>
          {memorized && !isSelecting && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={
                intensity >= 1
                  ? colors.gold.primary
                  : `rgba(212, 175, 55, ${Math.max(0.4, intensity)})`
              }
            />
          )}
          {isSelecting && (
            <View
              style={[styles.checkbox, selected && styles.checkboxSelected]}
            >
              {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ayahRow: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  ayahContent: {
    padding: 16,
  },
  ayahText: {
    fontSize: 22,
    lineHeight: 42,
    color: colors.text.arabicDefault,
    fontFamily: "Amiri_400Regular",
    textAlign: "right" as const,
    writingDirection: "rtl",
  },
  ayahTextMemorized: {
    color: colors.text.arabicActive,
  },
  ayahFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  ayahFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ayahNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  ayahNumberMemorized: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  ayahNumber: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.text.muted,
  },
  intensityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },

  intensityBadgeText: {
    fontSize: 10,
    fontWeight: "500" as const,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text.label,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.gold.primary,
    borderColor: colors.gold.primary,
  },
})