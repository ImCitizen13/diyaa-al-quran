import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';
import { getAllSurahs, getAllJuz } from '@/lib/quran-data';
import GlowOrb from '@/components/GlowOrb';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'juz' | 'surah';

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('juz');
  const insets = useSafeAreaInsets();
  const { getSurahProgress, getJuzProgress, getOverallProgress, getStreak, getTodayCount, settings } = useMemorization();

  const overall = useMemo(() => getOverallProgress(), [getOverallProgress]);
  const streak = useMemo(() => getStreak(), [getStreak]);
  const todayCount = useMemo(() => getTodayCount(), [getTodayCount]);

  const allSurahs = useMemo(() => getAllSurahs(), []);
  const allJuz = useMemo(() => getAllJuz(), []);

  const toggleView = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setViewMode((prev) => (prev === 'juz' ? 'surah' : 'juz'));
  }, []);

  const orbsPerRow = viewMode === 'juz' ? 5 : 6;
  const orbSize = viewMode === 'juz' ? 56 : 44;
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

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
        contentInsetAdjustmentBehavior="automatic"
      >
        {viewMode === 'juz' ? (
          <View style={styles.grid}>
            {allJuz.map((juz, index) => {
              const progress = getJuzProgress(juz.index);
              return (
                <GlowOrb
                  key={`juz-${juz.index}`}
                  intensity={progress.percentage}
                  label={`${juz.index}`}
                  sublabel={`Juz ${juz.index}`}
                  size={orbSize}
                  delay={index * 30}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/juz/[id]', params: { id: juz.index.toString() } });
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.grid}>
            {allSurahs.map((surah, index) => {
              const progress = getSurahProgress(surah.index);
              return (
                <GlowOrb
                  key={`surah-${surah.index}`}
                  intensity={progress.percentage}
                  label={`${surah.index}`}
                  sublabel={surah.titleAr}
                  size={orbSize}
                  delay={Math.min(index * 15, 1500)}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/surah/[id]', params: { id: surah.index.toString() } });
                  }}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
