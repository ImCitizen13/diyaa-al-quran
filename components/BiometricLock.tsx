import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, AppState, AppStateStatus } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { authenticateWithBiometrics, isBiometricEnabled, getBiometricType } from '@/lib/biometric-auth';

interface BiometricLockProps {
  children: React.ReactNode;
}

export default function BiometricLock({ children }: BiometricLockProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [biometricType, setBiometricType] = useState('Biometric');
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  useEffect(() => {
    checkAndAuthenticate();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        setIsLocked(true);
        promptAuth();
      }
    }
  }, []);

  const checkAndAuthenticate = async () => {
    const enabled = await isBiometricEnabled();
    const type = await getBiometricType();
    setBiometricType(type);

    if (!enabled || Platform.OS === 'web') {
      setIsChecking(false);
      setIsLocked(false);
      return;
    }

    setIsLocked(true);
    setIsChecking(false);
    promptAuth();
  };

  const promptAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      setIsLocked(false);
    }
  };

  if (isChecking) {
    return (
      <View style={[styles.lockScreen, { paddingTop: insets.top + webTopInset }]}>
        <Ionicons name="moon" size={48} color={colors.gold.primary} />
      </View>
    );
  }

  if (isLocked) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.lockScreen, { paddingTop: insets.top + webTopInset }]}
      >
        <View style={styles.lockContent}>
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={48} color={colors.gold.primary} />
          </View>
          <Text style={styles.lockTitle}>Diyaa Al-Quran</Text>
          <Text style={styles.lockSubtitle}>ضياء القرآن</Text>
          <Text style={styles.lockDesc}>Use {biometricType} to unlock</Text>
          <Pressable
            onPress={promptAuth}
            style={({ pressed }) => [styles.unlockBtn, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Ionicons
              name={biometricType === 'Face ID' ? 'scan' : 'finger-print'}
              size={28}
              color={colors.gold.primary}
            />
            <Text style={styles.unlockText}>Unlock</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContent: {
    alignItems: 'center',
    gap: 8,
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.gold.primary,
    letterSpacing: 1,
  },
  lockSubtitle: {
    fontSize: 18,
    color: colors.gold.dim,
    fontFamily: 'Amiri_700Bold',
  },
  lockDesc: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 8,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  unlockText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.gold.primary,
  },
});
