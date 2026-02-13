import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts, Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { MemorizationProvider } from "@/lib/memorization-context";
import { colors } from "@/constants/colors";
import BiometricLock from "@/components/BiometricLock";
import Walkthrough from "@/components/Walkthrough";
import { initializeNotifications } from "@/lib/notifications";

const WALKTHROUGH_KEY = "@diyaa_walkthrough_completed";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: colors.bg.primary },
        headerTintColor: colors.gold.primary,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="surah/[id]"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="juz/[id]"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const [walkthroughState, setWalkthroughState] = useState<"loading" | "show" | "done">("loading");

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(WALKTHROUGH_KEY).then((value) => {
      setWalkthroughState(value === "true" ? "done" : "show");
    });
  }, []);

  const handleWalkthroughComplete = useCallback(async () => {
    await AsyncStorage.setItem(WALKTHROUGH_KEY, "true");
    setWalkthroughState("done");
  }, []);

  if (!fontsLoaded || walkthroughState === "loading") return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MemorizationProvider>
          {walkthroughState === "show" ? (
            <Walkthrough onComplete={handleWalkthroughComplete} />
          ) : (
            <BiometricLock>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </BiometricLock>
          )}
        </MemorizationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
