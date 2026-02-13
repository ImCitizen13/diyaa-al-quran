import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';
import { TOTAL_AYAHS, TOTAL_SURAHS, TOTAL_JUZ } from '@/lib/quran-data';
import ProgressRing from '@/components/ProgressRing';
import GlowOrb from '@/components/GlowOrb';

function useCountUp(target: number, duration: number = 800, delay: number = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setValue(Math.round(eased * target));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}

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
            fillDelay={500}
          />
        </Animated.View>

        <View style={styles.statsGrid}>
          <AnimatedStatCard
            icon="book"
            target={overall.surahsComplete}
            label={`/ ${TOTAL_SURAHS} Surahs`}
            color={colors.gold.primary}
            index={0}
          />
          <AnimatedStatCard
            icon="layers"
            target={overall.juzComplete}
            label={`/ ${TOTAL_JUZ} Juz`}
            color={colors.gold.bright}
            index={1}
          />
          <AnimatedStatCard
            icon="flame"
            target={streak}
            label="Day Streak"
            color="#FF6B35"
            index={2}
          />
          <AnimatedStatCard
            icon="today"
            target={todayCount}
            label={`/ ${settings.dailyGoal}m Goal`}
            color="#4CAF50"
            index={3}
          />
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Last 7 Days</Text>
          <View style={styles.chartContainer}>
            {last7Days.map((day, i) => (
              <AnimatedBar
                key={day.date}
                count={day.count}
                label={day.label}
                maxCount={maxDayCount}
                delay={600 + i * 80}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(500)} style={styles.section}>
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

function AnimatedStatCard({
  icon,
  target,
  label,
  color,
  index,
}: {
  icon: string;
  target: number;
  label: string;
  color: string;
  index: number;
}) {
  const delay = 250 + index * 100;
  const countDelay = delay + 200;
  const displayValue = useCountUp(target, 800, countDelay);

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={styles.statCard}>
      <Animated.View entering={ZoomIn.delay(delay + 100).springify().damping(10)}>
        <Ionicons name={icon as any} size={20} color={color} />
      </Animated.View>
      <Text style={[styles.statValue, { color }]}>{displayValue}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

function AnimatedBar({
  count,
  label,
  maxCount,
  delay,
}: {
  count: number;
  label: string;
  maxCount: number;
  delay: number;
}) {
  const heightPct = useSharedValue(4);

  useEffect(() => {
    const target = Math.max((count / maxCount) * 100, 4);
    heightPct.value = withDelay(delay, withTiming(target, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, [count, maxCount, delay]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${heightPct.value}%` as any,
    backgroundColor: count > 0 ? colors.gold.primary : colors.bg.elevated,
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(300)} style={styles.chartBar}>
      <View style={styles.barWrapper}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
      <Text style={styles.barLabel}>{label}</Text>
    </Animated.View>
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
