import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';
import { TOTAL_AYAHS, TOTAL_SURAHS, TOTAL_JUZ } from '@/lib/quran-data';
import ProgressRing from '@/components/ProgressRing';
import GlowOrb from '@/components/GlowOrb';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { getOverallProgress, getJuzProgress, getStreak, getTodayCount, settings, dailyLog } = useMemorization();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const overall = useMemo(() => getOverallProgress(), [getOverallProgress]);
  const streak = useMemo(() => getStreak(), [getStreak]);
  const todayCount = useMemo(() => getTodayCount(), [getTodayCount]);

  const juzProgressList = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      juz: i + 1,
      ...getJuzProgress(i + 1),
    }));
  }, [getJuzProgress]);

  const last7Days = useMemo(() => {
    const days: { date: string; count: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en', { weekday: 'short' }).substring(0, 2);
      days.push({ date: key, count: dailyLog[key] || 0, label: dayLabel });
    }
    return days;
  }, [dailyLog]);

  const maxDayCount = Math.max(...last7Days.map((d) => d.count), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Progress</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.ringSection}>
          <ProgressRing
            size={180}
            strokeWidth={12}
            progress={overall.percentage}
            label="Memorized"
            sublabel={`${overall.memorized} / ${TOTAL_AYAHS} Ayahs`}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsGrid}>
          <StatCard
            icon="book"
            value={`${overall.surahsComplete}`}
            label={`/ ${TOTAL_SURAHS} Surahs`}
            color={colors.gold.primary}
          />
          <StatCard
            icon="layers"
            value={`${overall.juzComplete}`}
            label={`/ ${TOTAL_JUZ} Juz`}
            color={colors.gold.bright}
          />
          <StatCard
            icon="flame"
            value={`${streak}`}
            label="Day Streak"
            color="#FF6B35"
          />
          <StatCard
            icon="today"
            value={`${todayCount}`}
            label={`/ ${settings.dailyGoal}m Goal`}
            color="#4CAF50"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.chartContainer}>
            {last7Days.map((day) => (
              <View key={day.date} style={styles.chartBar}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max((day.count / maxDayCount) * 100, 4)}%`,
                        backgroundColor: day.count > 0 ? colors.gold.primary : colors.bg.elevated,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barCount}>{day.count}</Text>
                <Text style={styles.barLabel}>{day.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Juz Overview</Text>
          <View style={styles.juzGrid}>
            {juzProgressList.map((j) => (
              <GlowOrb
                key={`juz-progress-${j.juz}`}
                intensity={j.percentage}
                label={`${j.juz}`}
                size={36}
                delay={0}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  ringSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.muted,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    width: 20,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  barCount: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600' as const,
  },
  barLabel: {
    fontSize: 10,
    color: colors.text.label,
  },
  juzGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
});
