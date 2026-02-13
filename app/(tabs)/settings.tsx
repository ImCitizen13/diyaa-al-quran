import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Platform, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { useMemorization } from '@/lib/memorization-context';

const DAILY_GOALS = [1, 3, 5, 10, 15, 20, 30];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, exportData, resetAllData, getOverallProgress } = useMemorization();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleGoalChange = useCallback((goal: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    updateSettings({ dailyGoal: goal });
  }, [updateSettings]);

  const handleExport = useCallback(async () => {
    try {
      const data = await exportData();
      if (Platform.OS === 'web') {
        Alert.alert('Export Data', 'Data copied to clipboard');
      } else {
        await Share.share({ message: data, title: 'Diyaa Al-Quran Progress' });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  }, [exportData]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset All Progress',
      'Are you sure you want to reset all memorization progress? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete all your memorization data. Proceed?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Reset Everything',
                  style: 'destructive',
                  onPress: () => {
                    resetAllData();
                    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [resetAllData]);

  const overall = getOverallProgress();

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 + 84 : 100 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Goal</Text>
          <Text style={styles.sectionDesc}>Set how many Ayahs you want to memorize each day</Text>
          <View style={styles.goalGrid}>
            {DAILY_GOALS.map((goal) => (
              <Pressable
                key={goal}
                onPress={() => handleGoalChange(goal)}
                style={[styles.goalBtn, settings.dailyGoal === goal && styles.goalBtnActive]}
              >
                <Text style={[styles.goalText, settings.dailyGoal === goal && styles.goalTextActive]}>{goal}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <SettingsRow
            icon="download-outline"
            label="Export Progress"
            sublabel="Share your memorization data as JSON"
            onPress={handleExport}
          />
          <SettingsRow
            icon="trash-outline"
            label="Reset All Progress"
            sublabel={`${overall.memorized} ayahs will be cleared`}
            onPress={handleReset}
            destructive
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Diyaa Al-Quran</Text>
            <Text style={styles.aboutAr}>ضياء القرآن</Text>
            <Text style={styles.aboutDesc}>Light of the Quran</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutCredit}>Quran data sourced from quranjson (MIT License)</Text>
            <Text style={styles.aboutCredit}>6,236 verses across 114 Surahs and 30 Juz</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function SettingsRow({ icon, label, sublabel, onPress, destructive }: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name={icon as any} size={22} color={destructive ? colors.status.error : colors.gold.primary} />
      <View style={styles.settingsRowText}>
        <Text style={[styles.settingsLabel, destructive && { color: colors.status.error }]}>{label}</Text>
        {sublabel && <Text style={styles.settingsSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.text.label} />
    </Pressable>
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 12,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  goalBtnActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: colors.gold.primary,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text.muted,
  },
  goalTextActive: {
    color: colors.gold.primary,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
    gap: 12,
  },
  settingsRowText: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text.primary,
  },
  settingsSublabel: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glow.cardBorder,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.gold.primary,
  },
  aboutAr: {
    fontSize: 18,
    color: colors.gold.dim,
    fontFamily: 'Amiri_700Bold',
    marginTop: 4,
  },
  aboutDesc: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: colors.text.label,
    marginTop: 8,
  },
  aboutDivider: {
    width: 60,
    height: 1,
    backgroundColor: colors.glow.cardBorder,
    marginVertical: 16,
  },
  aboutCredit: {
    fontSize: 11,
    color: colors.text.label,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
});
