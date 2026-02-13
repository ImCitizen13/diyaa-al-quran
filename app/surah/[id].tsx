import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  useSharedValue,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/colors";
import { useMemorization } from "@/lib/memorization-context";
import {
  getSurahMeta,
  getSurahAyahs,
  BISMILLAH,
  type Ayah,
} from "@/lib/quran-data";
import IslamicPattern from "@/components/IslamicPattern";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const INTENSITY_LEVELS = [
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

export default function SurahDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id, 10);
  const insets = useSafeAreaInsets();
  const {
    isMemorized,
    getAyahIntensity,
    memorizeAyahs,
    unmemorizeAyah,
    getSurahProgress,
  } = useMemorization();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedAyahs, setSelectedAyahs] = useState<Set<number>>(new Set());
  const [selectedIntensity, setSelectedIntensity] = useState(1.0);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);
  const [undoEntries, setUndoEntries] = useState<
    { surahNumber: number; ayahNumber: number }[] | null
  >(null);
  const [congratsCount, setCongratsCount] = useState(0);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const congratsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const meta = useMemo(() => getSurahMeta(surahNumber), [surahNumber]);
  const ayahs = useMemo(() => getSurahAyahs(surahNumber), [surahNumber]);
  const progress = useMemo(
    () => getSurahProgress(surahNumber),
    [surahNumber, getSurahProgress]
  );

  const showBismillah = surahNumber !== 9 && surahNumber !== 1;

  const toggleSelect = useCallback((ayahNumber: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setSelectedAyahs((prev) => {
      const next = new Set(prev);
      if (next.has(ayahNumber)) {
        next.delete(ayahNumber);
      } else {
        next.add(ayahNumber);
      }
      return next;
    });
  }, []);

  const enterSelectionMode = useCallback(() => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSelecting(true);
    setSelectedAyahs(new Set());
    setShowIntensityPicker(false);
    setSelectedIntensity(1.0);
  }, []);

  const cancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectedAyahs(new Set());
    setShowIntensityPicker(false);
  }, []);

  const selectAll = useCallback(() => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    const unmemorized = ayahs.filter(
      (a) => !isMemorized(surahNumber, a.ayahNumber)
    );
    setSelectedAyahs(new Set(unmemorized.map((a) => a.ayahNumber)));
  }, [ayahs, isMemorized, surahNumber]);

  const handleShowIntensityPicker = useCallback(() => {
    if (selectedAyahs.size === 0) return;
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setShowIntensityPicker(true);
  }, [selectedAyahs]);

  const handleIntensitySelect = useCallback((value: number) => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setSelectedIntensity(value);
  }, []);

  const confirmMemorization = useCallback(async () => {
    const entries = Array.from(selectedAyahs).map((ayahNumber) => ({
      surahNumber,
      ayahNumber,
    }));

    if (entries.length === 0) return;

    await memorizeAyahs(entries, selectedIntensity);
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const count = entries.length;
    setUndoEntries(entries);
    setIsSelecting(false);
    setSelectedAyahs(new Set());
    setShowIntensityPicker(false);
    setSelectedIntensity(1.0);

    // Show congrats dialog
    setCongratsCount(count);
    if (congratsTimerRef.current) clearTimeout(congratsTimerRef.current);
    congratsTimerRef.current = setTimeout(() => setCongratsCount(0), 3000);

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoEntries(null), 5000);
  }, [selectedAyahs, surahNumber, memorizeAyahs, selectedIntensity]);

  const handleUndo = useCallback(async () => {
    if (!undoEntries) return;
    for (const entry of undoEntries) {
      await unmemorizeAyah(entry.surahNumber, entry.ayahNumber);
    }
    setUndoEntries(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [undoEntries, unmemorizeAyah]);

  const handleAyahLongPress = useCallback(
    (ayahNumber: number) => {
      if (isSelecting) return;
      const memorized = isMemorized(surahNumber, ayahNumber);
      if (memorized) {
        Alert.alert(
          "Remove from Memorized?",
          "This Ayah will be unmarked as memorized.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => {
                unmemorizeAyah(surahNumber, ayahNumber);
                if (Platform.OS !== "web")
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                  );
              },
            },
          ]
        );
      } else {
        enterSelectionMode();
        setSelectedAyahs(new Set([ayahNumber]));
      }
    },
    [isSelecting, isMemorized, surahNumber, unmemorizeAyah, enterSelectionMode]
  );

  const renderAyah = useCallback(
    ({ item, index }: { item: Ayah; index: number }) => {
      const memorized = isMemorized(surahNumber, item.ayahNumber);
      const selected = selectedAyahs.has(item.ayahNumber);
      const intensity = getAyahIntensity(surahNumber, item.ayahNumber);

      return (
        <AyahRow
          ayah={item}
          memorized={memorized}
          selected={selected}
          isSelecting={isSelecting}
          intensity={intensity}
          onPress={() => {
            if (isSelecting) {
              toggleSelect(item.ayahNumber);
            }
          }}
          onLongPress={() => handleAyahLongPress(item.ayahNumber)}
        />
      );
    },
    [
      isMemorized,
      getAyahIntensity,
      surahNumber,
      selectedAyahs,
      isSelecting,
      toggleSelect,
      handleAyahLongPress,
    ]
  );

  if (!meta) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + webTopInset,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: colors.text.muted }}>Surah not found</Text>
      </View>
    );
  }

  const currentLevel =
    INTENSITY_LEVELS.find((l) => l.value === selectedIntensity) ||
    INTENSITY_LEVELS[3];

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + webTopInset, overflow: "hidden" },
      ]}
    >
      <IslamicPattern width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.gold.primary} />
        </Pressable>
        {isSelecting ? (
          <View style={styles.selectionBar}>
            <Pressable onPress={cancelSelection}>
              <Ionicons name="close" size={24} color={colors.text.muted} />
            </Pressable>
            <Text style={styles.selectionCount}>
              {selectedAyahs.size} selected
            </Text>
            <Pressable onPress={selectAll}>
              <Text style={styles.selectAllText}>All</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={enterSelectionMode}
            style={({ pressed }) => [
              styles.memorizeBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.gold.primary}
            />
            <Text style={styles.memorizeBtnText}>Memorize</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={ayahs}
        renderItem={renderAyah}
        keyExtractor={(item) => `${item.surahNumber}:${item.ayahNumber}`}
        contentContainerStyle={{ paddingBottom: isSelecting ? 200 : 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.surahHeader}
          >
            <Text style={styles.decorDots}>---</Text>
            <Text style={styles.surahTitleAr}>{meta.titleAr}</Text>
            <Text style={styles.surahTitleEn}>{meta.title.toUpperCase()}</Text>
            <Text style={styles.surahMeta}>
              {meta.type} · {meta.count} Verses · Juz{" "}
              {meta.juzList[0]?.index || "?"}
            </Text>
            <View style={styles.progressBar}>
              <AnimatedProgressFill percentage={progress.percentage} />
            </View>
            <Text style={styles.progressText}>
              {progress.memorized} / {progress.total} memorized
            </Text>
            {showBismillah && <Text style={styles.bismillah}>{BISMILLAH}</Text>}
          </Animated.View>
        }
        extraData={`${isSelecting}-${selectedAyahs.size}-${progress.memorized}`}
      />

      {isSelecting && selectedAyahs.size > 0 && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.fabContainer, { bottom: insets.bottom + 16 }]}
        >
          {showIntensityPicker ? (
            <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.intensityPanel}>
              <Text style={styles.intensityTitle}>
                How well do you know these Ayahs?
              </Text>
              <View style={styles.intensityGrid}>
                {INTENSITY_LEVELS.map((level) => (
                  <Pressable
                    key={level.value}
                    onPress={() => handleIntensitySelect(level.value)}
                    style={[
                      styles.intensityOption,
                      selectedIntensity === level.value &&
                        styles.intensityOptionActive,
                      selectedIntensity === level.value && {
                        borderColor: level.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={level.icon}
                      size={20}
                      color={
                        selectedIntensity === level.value
                          ? level.color
                          : colors.text.muted
                      }
                    />
                    <Text
                      style={[
                        styles.intensityLabel,
                        selectedIntensity === level.value && {
                          color: level.color,
                        },
                      ]}
                    >
                      {level.label}
                    </Text>
                    <View
                      style={[
                        styles.intensityBar,
                        {
                          width: `${level.value * 100}%`,
                          backgroundColor: level.color,
                        },
                      ]}
                    />
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={confirmMemorization}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  {
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                    backgroundColor: currentLevel.color,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.bg.primary}
                />
                <Text style={styles.confirmText}>
                  Confirm ({selectedAyahs.size} Ayahs)
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Pressable
              onPress={handleShowIntensityPicker}
              style={({ pressed }) => [
                styles.fabBtn,
                { transform: [{ scale: pressed ? 0.95 : 1 }] },
              ]}
            >
              <Ionicons name="checkmark" size={22} color={colors.bg.primary} />
              <Text style={styles.fabText}>
                Mark as Memorized ({selectedAyahs.size})
              </Text>
            </Pressable>
          )}
        </Animated.View>
      )}

      {undoEntries && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.undoBar, { bottom: insets.bottom + 20 }]}
        >
          <Text style={styles.undoText}>
            {undoEntries.length} Ayahs marked as memorized
          </Text>
          <Pressable onPress={handleUndo}>
            <Text style={styles.undoBtn}>Undo</Text>
          </Pressable>
        </Animated.View>
      )}

      {congratsCount > 0 && (
        <Pressable style={styles.congratsOverlay} onPress={() => setCongratsCount(0)}>
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.congratsCard}>
            <Ionicons name="star" size={48} color={colors.gold.bright} />
            <Text style={styles.congratsTitle}>MashaAllah!</Text>
            <Text style={styles.congratsSubtitle}>
              You memorized {congratsCount} {congratsCount === 1 ? 'Ayah' : 'Ayahs'}
            </Text>
            <Text style={styles.congratsDismiss}>Tap to dismiss</Text>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

function AnimatedProgressFill({ percentage }: { percentage: number }) {
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

function AyahRow({
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
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  memorizeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  memorizeBtnText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.gold.primary,
  },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
    gap: 12,
  },
  selectionCount: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.gold.primary,
  },
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
  progressFill: {
    height: "100%",
    backgroundColor: colors.gold.primary,
    borderRadius: 2,
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
  fabContainer: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  fabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gold.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.bg.primary,
  },
  intensityPanel: {
    backgroundColor: colors.bg.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
    gap: 12,
  },
  intensityTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    textAlign: "center" as const,
  },
  intensityGrid: {
    gap: 6,
  },
  intensityOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: "transparent",
    overflow: "hidden",
  },
  intensityOptionActive: {
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.text.muted,
    flex: 1,
  },
  intensityBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.bg.primary,
  },
  undoBar: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg.card,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  undoText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  undoBtn: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: colors.gold.bright,
  },
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 100,
  },
  congratsCard: {
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
    gap: 8,
  },
  congratsTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.gold.bright,
    marginTop: 8,
  },
  congratsSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center" as const,
  },
  congratsDismiss: {
    fontSize: 11,
    color: colors.text.label,
    marginTop: 8,
  },
});
