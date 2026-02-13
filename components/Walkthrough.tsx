import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, Dimensions, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, FadeInUp, FadeInDown, useAnimatedStyle, withTiming, withSpring, withSequence, withDelay, useSharedValue, interpolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WalkthroughStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

const STEPS: WalkthroughStep[] = [
  {
    icon: 'moon-outline',
    title: 'Diyaa Al-Quran',
    subtitle: 'ضياء القرآن',
    description: 'Welcome to the Light of the Quran. Track your memorization journey as glowing orbs that brighten with your progress.',
    accentColor: colors.gold.primary,
  },
  {
    icon: 'grid-outline',
    title: 'Browse & Navigate',
    subtitle: 'Surahs & Juz',
    description: 'Switch between Surah and Juz views on the home screen. Tap any orb to see its verses, or long-press a Surah to mark the whole thing at once.',
    accentColor: colors.gold.bright,
  },
  {
    icon: 'checkmark-circle-outline',
    title: 'Mark Your Progress',
    subtitle: 'Ayah by Ayah',
    description: 'Inside a Surah, tap "Memorize" to select individual verses. Choose how well you know them — from Just Started to Fully Memorized.',
    accentColor: 'rgba(212, 175, 55, 0.8)',
  },
  {
    icon: 'sunny-outline',
    title: 'Watch It Glow',
    subtitle: 'Intensity Matters',
    description: 'Each orb glows based on your mastery level, not just whether you started. As your confidence grows, the light grows with it.',
    accentColor: colors.gold.primary,
  },
  {
    icon: 'flame-outline',
    title: 'Stay Consistent',
    subtitle: 'Streaks & Goals',
    description: 'Set a daily goal, build your streak, and track your progress over time. Small steps lead to great achievements.',
    accentColor: '#FF9800',
  },
];

interface WalkthroughProps {
  onComplete: () => void;
}

export default function Walkthrough({ onComplete }: WalkthroughProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      onComplete();
    }
  }, [currentStep, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      flatListRef.current?.scrollToIndex({ index: prev, animated: true });
    }
  }, [currentStep]);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.topBar}>
        {currentStep > 0 ? (
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={colors.text.muted} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
        <View style={styles.stepIndicator}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep && styles.dotActive,
                i < currentStep && styles.dotCompleted,
              ]}
            />
          ))}
        </View>
        {!isLast ? (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={STEPS}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => `step-${i}`}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <StepView step={item} isActive={index === currentStep} />
        )}
        style={styles.flatList}
      />

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 20) }]}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: step.accentColor, transform: [{ scale: pressed ? 0.96 : 1 }] },
          ]}
        >
          {isLast ? (
            <>
              <Ionicons name="sparkles" size={20} color={colors.bg.primary} />
              <Text style={styles.nextBtnText}>Begin Your Journey</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.bg.primary} />
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

function StepView({ step, isActive }: { step: WalkthroughStep; isActive: boolean }) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.visualArea}>
        <View style={[styles.orbRing3, { borderColor: `${step.accentColor}10` }]}>
          <View style={[styles.orbRing2, { borderColor: `${step.accentColor}20` }]}>
            <View style={[styles.orbRing1, { borderColor: `${step.accentColor}40` }]}>
              <View style={[styles.iconOrb, { backgroundColor: `${step.accentColor}18` }]}>
                <Ionicons name={step.icon} size={48} color={step.accentColor} />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.textArea}>
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(100)}>
            <Text style={[styles.stepSubtitle, { color: step.accentColor }]}>{step.subtitle}</Text>
          </Animated.View>
        )}
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </Animated.View>
        )}
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </Animated.View>
        )}
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bg.elevated,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.gold.primary,
    borderRadius: 4,
  },
  dotCompleted: {
    backgroundColor: colors.gold.dim,
  },
  skipText: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '500' as const,
  },
  flatList: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  visualArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  orbRing3: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    gap: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 2,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text.primary,
    textAlign: 'center' as const,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    textAlign: 'center' as const,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.gold.bright,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.bg.primary,
  },
});
