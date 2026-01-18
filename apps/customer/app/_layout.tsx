import "@/global.css";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { queryClient } from "@/utils/tanstack-query";

// Dark theme colors
const DARK_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0a0a0a",
    card: "#0a0a0a",
    border: "#262626",
    primary: "#3b82f6",
    text: "#fafafa",
    notification: "#ef4444",
  },
};

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Set Android navigation bar to dark
    if (Platform.OS === "android") {
      void NavigationBar.setButtonStyleAsync("light");
      void NavigationBar.setBackgroundColorAsync("#0a0a0a");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DARK_THEME}>
        <StatusBar style="light" />
        <GestureHandlerRootView style={styles.container}>
          <Stack>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ title: "Modal", presentation: "modal" }}
            />
          </Stack>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
