import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeOut,
  FadeInUp,
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { colors } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface WalkthroughStep {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  image?: ImageSourcePropType;
  type?: "welcome" | "image" | "notifications" | "pace" | "final";
}

const PACE_OPTIONS = [
  { value: 15, label: "15 min / day", description: "Gentle start" },
  { value: 30, label: "30 min / day", description: "Steady pace" },
  { value: 45, label: "45 min / day", description: "Committed" },
  { value: 60, label: "1 hour / day", description: "Dedicated" },
];

const STEPS: WalkthroughStep[] = [
  {
    icon: "moon-outline",
    title: "Diyaa Al-Quran",
    subtitle: "ضياء القرآن",
    description:
      "Welcome to the Qurannic Lights app. Track your memorization journey and watch the parts of the Quran that you have memorized brighten with your progress.",
    accentColor: colors.gold.primary,
    type: "welcome",
  },
  {
    icon: "grid-outline",
    title: "Browse & Navigate",
    subtitle: "Surahs & Juz",
    description:
      "Switch between Surah and Juz views on the home screen. Tap any orb to see its verses, or long-press a Surah to mark the whole thing at once.",
    accentColor: colors.gold.bright,
    image: require("@/assets/images/walkthrough-browse.png"),
    type: "image",
  },
  {
    icon: "checkmark-circle-outline",
    title: "Mark Your Progress",
    subtitle: "Ayah by Ayah",
    description:
      'Inside a Surah, tap "Memorize" to select individual verses. Choose how well you know them — from Just Started to Fully Memorized.',
    accentColor: "rgba(212, 175, 55, 0.8)",
    image: require("@/assets/images/walkthrough-memorize.png"),
    type: "image",
  },
  {
    icon: "sunny-outline",
    title: "Watch It Glow",
    subtitle: "Intensity Matters",
    description:
      "Each orb glows based on your mastery level, not just whether you started. As your confidence grows, the light grows with it.",
    accentColor: colors.gold.primary,
    image: require("@/assets/images/walkthrough-glow.png"),
    type: "image",
  },
  {
    icon: "notifications-outline",
    title: "Stay on Track",
    subtitle: "Daily Reminders",
    description:
      "Get gentle reminders to review and memorize. We'll only notify you at the time you choose.",
    accentColor: colors.gold.primary,
    type: "notifications",
  },
  {
    icon: "speedometer-outline",
    title: "Set Your Pace",
    subtitle: "Daily Goal",
    description:
      "How long would you like to read Quran each day? You can change this anytime in Settings.",
    accentColor: colors.gold.primary,
    type: "pace",
  },
  {
    icon: "sparkles",
    title: "You're All Set!",
    subtitle: "بسم الله",
    description:
      "May Allah make your memorization journey easy and blessed. Every Ayah you learn is a light on your path.",
    accentColor: colors.gold.bright,
    type: "final",
  },
];

interface WalkthroughProps {
  onComplete: (settings?: { pace?: number; notificationsEnabled?: boolean }) => void;
}

export default function Walkthrough({ onComplete }: WalkthroughProps) {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [notifStatus, setNotifStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [selectedPace, setSelectedPace] = useState(30);
  const flatListRef = useRef<FlatList>(null);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      onComplete({ pace: selectedPace, notificationsEnabled: notifStatus === "granted" });
    }
  }, [currentStep, onComplete, selectedPace, notifStatus]);

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

  const handleRequestNotifications = useCallback(async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotifStatus(status === "granted" ? "granted" : "denied");
    } catch {
      setNotifStatus("denied");
    }
  }, []);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[styles.container, { paddingTop: insets.top + webTopInset }]}
    >
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
          <StepView
            step={item}
            isActive={index === currentStep}
            notifStatus={notifStatus}
            onRequestNotifications={handleRequestNotifications}
            selectedPace={selectedPace}
            onSelectPace={setSelectedPace}
          />
        )}
        style={styles.flatList}
      />

      <View
        style={[
          styles.bottomArea,
          { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) },
        ]}
      >
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            {
              backgroundColor: step.accentColor,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
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

function StepView({
  step,
  isActive,
  notifStatus,
  onRequestNotifications,
  selectedPace,
  onSelectPace,
}: {
  step: WalkthroughStep;
  isActive: boolean;
  notifStatus: "idle" | "granted" | "denied";
  onRequestNotifications: () => void;
  selectedPace: number;
  onSelectPace: (v: number) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      {/* Visual area */}
      <View style={styles.visualArea}>
        {step.type === "image" && step.image ? (
          isActive && (
            <Animated.View entering={ZoomIn.duration(500).delay(100)} style={styles.imageFrame}>
              <Image source={step.image} style={styles.screenshot} resizeMode="contain" />
            </Animated.View>
          )
        ) : step.type === "notifications" ? (
          isActive && (
            <View style={styles.notifVisual}>
              {notifStatus === "granted" ? (
                <Animated.View entering={ZoomIn.duration(400).delay(200)} key="notif-granted">
                  <Ionicons name="checkmark-circle" size={80} color={colors.gold.primary} />
                </Animated.View>
              ) : notifStatus === "denied" ? (
                <Animated.View entering={ZoomIn.duration(400).delay(200)} key="notif-denied">
                  <Ionicons name="close-circle" size={80} color={colors.text.muted} />
                </Animated.View>
              ) : (
                <Animated.View entering={ZoomIn.duration(400).delay(100)} exiting={ZoomOut.duration(300)} key="notif-idle">
                  <View style={styles.notifIconWrap}>
                    <Ionicons name="notifications-outline" size={56} color={colors.gold.primary} />
                  </View>
                </Animated.View>
              )}
            </View>
          )
        ) : step.type === "final" ? (
          isActive && (
            <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.finalVisual}>
              <Ionicons name="sparkles" size={64} color={colors.gold.bright} />
            </Animated.View>
          )
        ) : step.type === "pace" ? (
          isActive && (
            <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.paceGrid}>
              {PACE_OPTIONS.map((opt, i) => (
                <PaceOption
                  key={opt.value}
                  opt={opt}
                  selected={selectedPace === opt.value}
                  onSelect={() => onSelectPace(opt.value)}
                  delay={i * 60}
                />
              ))}
            </Animated.View>
          )
        ) : (
          /* Welcome step — icon + rings */
          <View style={[styles.orbRing3, { borderColor: `${step.accentColor}10` }]}>
            <View style={[styles.orbRing2, { borderColor: `${step.accentColor}20` }]}>
              <View style={[styles.orbRing1, { borderColor: `${step.accentColor}40` }]}>
                <View style={[styles.iconOrb, { backgroundColor: `${step.accentColor}18` }]}>
                  <Ionicons name={step.icon} size={48} color={step.accentColor} />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Text area */}
      <View style={styles.textArea}>
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <Text style={[styles.stepSubtitle, { color: step.accentColor }]}>
              {step.subtitle}
            </Text>
          </Animated.View>
        )}
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </Animated.View>
        )}
        {isActive && (
          <Animated.View entering={FadeInUp.duration(400).delay(400)}>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </Animated.View>
        )}

        {/* Notification action button */}
        {step.type === "notifications" && isActive && notifStatus === "idle" && (
          <Animated.View entering={FadeInUp.duration(400).delay(500)}>
            <Pressable
              onPress={onRequestNotifications}
              style={({ pressed }) => [
                styles.notifBtn,
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Ionicons name="notifications" size={18} color={colors.bg.primary} />
              <Text style={styles.notifBtnText}>Enable Notifications</Text>
            </Pressable>
          </Animated.View>
        )}
        {step.type === "notifications" && isActive && notifStatus === "granted" && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={styles.notifStatusText}>Notifications enabled!</Text>
          </Animated.View>
        )}
        {step.type === "notifications" && isActive && notifStatus === "denied" && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={styles.notifDeniedText}>
              You can enable notifications later in Settings.
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function PaceOption({
  opt,
  selected,
  onSelect,
  delay,
}: {
  opt: (typeof PACE_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1.04 : 1, { damping: 14, stiffness: 160 }) }],
    opacity: withSpring(selected ? 1 : 0.75, { damping: 14, stiffness: 160 }),
  }));

  return (
    <Animated.View entering={FadeInUp.duration(350).delay(delay)} style={animStyle}>
      <Pressable
        onPress={onSelect}
        style={[styles.paceOption, selected && styles.paceOptionActive]}
      >
        <Text style={[styles.paceLabel, selected && styles.paceLabelActive]}>
          {opt.label}
        </Text>
        <Text style={styles.paceDesc}>{opt.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "500" as const,
  },
  flatList: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  visualArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    minHeight: IMAGE_HEIGHT,
  },
  // Welcome orb rings
  orbRing3: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  orbRing2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  orbRing1: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconOrb: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  // Image steps
  imageFrame: {
    width: SCREEN_WIDTH * 0.6,
    height: IMAGE_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: colors.gold.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  screenshot: {
    width: "100%",
    height: "100%",
  },
  // Text area
  textArea: {
    alignItems: "center",
    gap: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    letterSpacing: 2,
    textAlign: "center" as const,
    textTransform: "uppercase" as const,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    textAlign: "center" as const,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text.secondary,
    textAlign: "center" as const,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  // Final step
  finalVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${colors.gold.bright}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${colors.gold.bright}30`,
  },
  // Notifications
  notifVisual: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  notifIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.gold.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: `${colors.gold.primary}30`,
  },
  notifBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: colors.gold.primary,
  },
  notifBtnText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.bg.primary,
  },
  notifStatusText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.gold.primary,
  },
  notifDeniedText: {
    marginTop: 16,
    fontSize: 13,
    color: colors.text.muted,
    textAlign: "center" as const,
  },
  // Pace picker
  paceGrid: {
    width: "100%",
    gap: 8,
  },
  paceOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: colors.bg.card,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  paceOptionActive: {
    borderColor: colors.gold.primary,
    backgroundColor: `${colors.gold.primary}12`,
  },
  paceLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
  },
  paceLabelActive: {
    color: colors.gold.primary,
  },
  paceDesc: {
    fontSize: 13,
    color: colors.text.muted,
  },
  // Bottom
  bottomArea: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "700" as const,
    color: colors.bg.primary,
  },
});
