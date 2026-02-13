import React, { useState, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Dimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInLeft, FadeInUp, FadeOut, FadeOutRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';
import { getAllSurahs, getAllJuz } from '@/lib/quran-data';
import SkiaOrbGrid, { type OrbData } from '@/components/SkiaOrbGrid';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'juz' | 'surah';

const INTENSITY_LEVELS = [
  { value: 0.25, label: 'Just Started', icon: 'sparkles-outline' as const, color: 'rgba(212, 175, 55, 0.4)' },
  { value: 0.5, label: 'Learning', icon: 'book-outline' as const, color: 'rgba(212, 175, 55, 0.6)' },
  { value: 0.75, label: 'Almost There', icon: 'flame-outline' as const, color: 'rgba(212, 175, 55, 0.8)' },
  { value: 1.0, label: 'Fully Memorized', icon: 'star' as const, color: colors.gold.primary },
];

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('juz');
  const insets = useSafeAreaInsets();
  const { getSurahProgress, getJuzProgress, getOverallProgress, getStreak, getTodayCount, settings, memorizeAyahs } = useMemorization();

  const overall = useMemo(() => getOverallProgress(), [getOverallProgress]);
  const streak = useMemo(() => getStreak(), [getStreak]);
  const todayCount = useMemo(() => getTodayCount(), [getTodayCount]);

  const allSurahs = useMemo(() => getAllSurahs(), []);
  const allJuz = useMemo(() => getAllJuz(), []);

  const [pickerSurah, setPickerSurah] = useState<{ index: number; title: string; titleAr: string; count: number } | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState(1.0);
  const [congratsInfo, setCongratsInfo] = useState<{ count: number; title: string } | null>(null);
  const congratsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleView = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setViewMode((prev) => (prev === 'juz' ? 'surah' : 'juz'));
  }, []);

  const handleSurahLongPress = useCallback((surah: typeof allSurahs[0]) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedIntensity(1.0);
    setPickerSurah(surah);
  }, []);

  const juzOrbData = useMemo((): OrbData[] => {
    return allJuz.map((juz) => {
      const progress = getJuzProgress(juz.index);
      return {
        id: `juz-${juz.index}`,
        intensity: progress.percentage * 0.85,
        label: `${juz.index}`,
        sublabel: `Juz ${juz.index}`,
        onPress: () => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: '/juz/[id]', params: { id: juz.index.toString() } });
        },
      };
    });
  }, [allJuz, getJuzProgress]);

  const surahOrbData = useMemo((): OrbData[] => {
    return allSurahs.map((surah) => {
      const progress = getSurahProgress(surah.index);
      return {
        id: `surah-${surah.index}`,
        intensity: progress.percentage * 0.85,
        label: `${surah.index}`,
        sublabel: surah.titleAr,
        onPress: () => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: '/surah/[id]', params: { id: surah.index.toString() } });
        },
        onLongPress: () => handleSurahLongPress(surah),
      };
    });
  }, [allSurahs, getSurahProgress, handleSurahLongPress]);

  const handleConfirm = useCallback(async () => {
    if (!pickerSurah) return;
    const entries = Array.from({ length: pickerSurah.count }, (_, i) => ({
      surahNumber: pickerSurah.index,
      ayahNumber: i + 1,
    }));
    await memorizeAyahs(entries, selectedIntensity);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const info = { count: pickerSurah.count, title: pickerSurah.titleAr };
    setPickerSurah(null);

    setCongratsInfo(info);
    if (congratsTimerRef.current) clearTimeout(congratsTimerRef.current);
    congratsTimerRef.current = setTimeout(() => setCongratsInfo(null), 3000);
  }, [pickerSurah, selectedIntensity, memorizeAyahs]);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const currentLevel = INTENSITY_LEVELS.find(l => l.value === selectedIntensity) || INTENSITY_LEVELS[3];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
        <Text style={styles.appTitle}>Diyaa Al-Quran</Text>
        <Text style={styles.appSubtitle}>ضياء القرآن</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(overall.percentage * 100)}%</Text>
          <Text style={styles.statLabel}>Memorized</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{todayCount}/{settings.dailyGoal}</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          onPress={toggleView}
          style={[styles.toggleBtn, viewMode === 'juz' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, viewMode === 'juz' && styles.toggleTextActive]}>Juz</Text>
        </Pressable>
        <Pressable
          onPress={toggleView}
          style={[styles.toggleBtn, viewMode === 'surah' && styles.toggleActive]}
        >
          <Text style={[styles.toggleText, viewMode === 'surah' && styles.toggleTextActive]}>Surah</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.gridContainer, { paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={viewMode} entering={FadeInLeft.springify().damping(16).stiffness(140)} exiting={FadeOutRight.duration(150)}>
          {viewMode === 'juz' ? (
            <SkiaOrbGrid
              data={juzOrbData}
              orbSize={56}
              showPattern
            />
          ) : (
            <SkiaOrbGrid
              data={surahOrbData}
              orbSize={44}
              showPattern
            />
          )}
        </Animated.View>
      </ScrollView>

      <Modal
        visible={!!pickerSurah}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerSurah(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerSurah(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {pickerSurah && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitleAr}>{pickerSurah.titleAr}</Text>
                  <Text style={styles.modalTitleEn}>{pickerSurah.title}</Text>
                  <Text style={styles.modalSubtitle}>{pickerSurah.count} Ayahs</Text>
                </View>

                <Text style={styles.intensityTitle}>How well do you know this Surah?</Text>

                <View style={styles.intensityGrid}>
                  {INTENSITY_LEVELS.map((level) => (
                    <Pressable
                      key={level.value}
                      onPress={() => {
                        if (Platform.OS !== 'web') Haptics.selectionAsync();
                        setSelectedIntensity(level.value);
                      }}
                      style={[
                        styles.intensityOption,
                        selectedIntensity === level.value && styles.intensityOptionActive,
                        selectedIntensity === level.value && { borderColor: level.color },
                      ]}
                    >
                      <Ionicons
                        name={level.icon}
                        size={20}
                        color={selectedIntensity === level.value ? level.color : colors.text.muted}
                      />
                      <Text style={[
                        styles.intensityLabel,
                        selectedIntensity === level.value && { color: level.color },
                      ]}>
                        {level.label}
                      </Text>
                      <View style={[styles.intensityBar, { width: `${level.value * 100}%`, backgroundColor: level.color }]} />
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [styles.confirmBtn, { transform: [{ scale: pressed ? 0.97 : 1 }], backgroundColor: currentLevel.color }]}
                >
                  <Ionicons name="checkmark" size={20} color={colors.bg.primary} />
                  <Text style={styles.confirmText}>Mark Entire Surah</Text>
                </Pressable>

                <Pressable onPress={() => setPickerSurah(null)} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {congratsInfo && (
        <Pressable style={styles.congratsOverlay} onPress={() => setCongratsInfo(null)}>
          <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.congratsCard}>
            <Ionicons name="star" size={48} color={colors.gold.bright} />
            <Text style={styles.congratsTitle}>MashaAllah!</Text>
            <Text style={styles.congratsSubtitle}>
              You memorized {congratsInfo.title}
            </Text>
            <Text style={styles.congratsDetail}>
              {congratsInfo.count} {congratsInfo.count === 1 ? 'Ayah' : 'Ayahs'}
            </Text>
            <Text style={styles.congratsDismiss}>Tap to dismiss</Text>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: colors.gold.primary,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.gold.dim,
    fontFamily: 'Amiri_700Bold',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.gold.bright,
  },
  statLabel: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: colors.bg.secondary,
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text.muted,
  },
  toggleTextActive: {
    color: colors.gold.primary,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bg.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleAr: {
    fontSize: 28,
    color: colors.gold.primary,
    fontFamily: 'Amiri_700Bold',
    textAlign: 'center' as const,
  },
  modalTitleEn: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  intensityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text.primary,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  intensityGrid: {
    gap: 6,
  },
  intensityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.bg.elevated,
    borderWidth: 1.5,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  intensityOptionActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text.muted,
    flex: 1,
  },
  intensityBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: 1,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: colors.bg.primary,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  congratsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  congratsCard: {
    alignItems: 'center',
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
    fontWeight: '700' as const,
    color: colors.gold.bright,
    marginTop: 8,
  },
  congratsSubtitle: {
    fontSize: 18,
    color: colors.text.primary,
    fontFamily: 'Amiri_700Bold',
    textAlign: 'center' as const,
  },
  congratsDetail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  congratsDismiss: {
    fontSize: 11,
    color: colors.text.label,
    marginTop: 8,
  },
});
