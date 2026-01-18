import "@/global.css";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import React, { useEffect, useState } from "react";
import { Platform, View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import { hasCompletedOnboarding } from "@/lib/onboarding";
import { queryClient } from "@/utils/tanstack-query";

// Prevent splash screen from auto-hiding
void SplashScreen.preventAutoHideAsync();

// Dark theme colors
const DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a0a0a",
    card: "#0a0a0a",
    border: "#262626",
    primary: "#f97316", // Orange brand color
    text: "#fafafa",
    notification: "#ef4444",
  },
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Set Android navigation bar to dark - background color is handled by edge-to-edge
    if (Platform.OS === "android") {
      void NavigationBar.setButtonStyleAsync("light");
    }

    // Set system background color to avoid white flashes
    void SystemUI.setBackgroundColorAsync("#0a0a0a");

    // Check onboarding status
    async function checkOnboarding() {
      try {
        const completed = await hasCompletedOnboarding();
        setShowWelcome(!completed);
      } finally {
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    }

    void checkOnboarding();
  }, []);

  useEffect(() => {
    // Navigate after layout is ready
    if (isReady) {
      if (showWelcome) {
        router.replace("/welcome");
      } else {
        router.replace("/");
      }
    }
  }, [isReady, showWelcome]);

  // Show loading while checking onboarding status
  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DARK_THEME}>
        <StatusBar style="light" />
        <GestureHandlerRootView className="flex-1 bg-neutral-950">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0a0a0a" },
            }}
          >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen
              name="modal"
              options={{
                headerShown: true,
                title: "Modal",
                presentation: "modal",
              }}
            />
          </Stack>
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                backgroundColor: "#171717",
                borderColor: "#262626",
                borderWidth: 1,
              },
              titleStyle: {
                color: "#fafafa",
              },
              descriptionStyle: {
                color: "#a3a3a3",
              },
            }}
          />
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
