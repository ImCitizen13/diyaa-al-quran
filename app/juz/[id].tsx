import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';
import { getSurahsInJuz, getSurahMeta, getTotalAyahsInJuz } from '@/lib/quran-data';
import GlowOrb from '@/components/GlowOrb';
import ProgressRing from '@/components/ProgressRing';

export default function JuzDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const juzNumber = parseInt(id, 10);
  const insets = useSafeAreaInsets();
  const { getJuzProgress, getSurahProgress } = useMemorization();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const juzProgress = useMemo(() => getJuzProgress(juzNumber), [juzNumber, getJuzProgress]);
  const surahsInJuz = useMemo(() => getSurahsInJuz(juzNumber), [juzNumber]);
  const totalAyahs = useMemo(() => getTotalAyahsInJuz(juzNumber), [juzNumber]);

  const uniqueSurahs = useMemo(() => {
    const seen = new Set<number>();
    return surahsInJuz.filter((s) => {
      if (seen.has(s.surahNumber)) return false;
      seen.add(s.surahNumber);
      return true;
    });
  }, [surahsInJuz]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.gold.primary} />
        </Pressable>
        <Text style={styles.topTitle}>Juz {juzNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.headerSection}>
          <ProgressRing
            size={120}
            strokeWidth={8}
            progress={juzProgress.percentage}
            sublabel={`${juzProgress.memorized} / ${juzProgress.total} Ayahs`}
          />
          <Text style={styles.headerLabel}>Juz {juzNumber}</Text>
          <Text style={styles.headerSub}>{uniqueSurahs.length} Surahs</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.surahSection}>
          <Text style={styles.sectionTitle}>Surahs in this Juz</Text>
          <View style={styles.surahList}>
            {uniqueSurahs.map((s, index) => {
              const meta = getSurahMeta(s.surahNumber);
              const progress = getSurahProgress(s.surahNumber);
              if (!meta) return null;

              return (
                <Pressable
                  key={`surah-${s.surahNumber}`}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/surah/[id]', params: { id: s.surahNumber.toString() } });
                  }}
                  style={({ pressed }) => [styles.surahCard, { opacity: pressed ? 0.8 : 1 }]}
                >
                  <GlowOrb
                    intensity={progress.percentage}
                    label={`${meta.index}`}
                    size={44}
                    delay={index * 50}
                  />
                  <View style={styles.surahInfo}>
                    <Text style={styles.surahName}>{meta.title}</Text>
                    <Text style={styles.surahNameAr}>{meta.titleAr}</Text>
                    <Text style={styles.surahMeta}>{meta.count} Ayahs · {meta.type}</Text>
                  </View>
                  <View style={styles.surahProgressCol}>
                    <Text style={styles.surahPercent}>{Math.round(progress.percentage * 100)}%</Text>
                    <Text style={styles.surahCount}>{progress.memorized}/{progress.total}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.gold.primary,
    marginTop: 16,
  },
  headerSub: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  surahSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  surahList: {
    gap: 8,
  },
  surahCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
    gap: 12,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  surahNameAr: {
    fontSize: 16,
    color: colors.gold.dim,
    fontFamily: 'Amiri_700Bold',
    marginTop: 2,
  },
  surahMeta: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  surahProgressCol: {
    alignItems: 'flex-end',
  },
  surahPercent: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.gold.primary,
  },
  surahCount: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 2,
  },
});
