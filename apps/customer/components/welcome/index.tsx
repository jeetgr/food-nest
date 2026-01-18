import { router } from "expo-router";
import React from "react";
import { View, Pressable, Text } from "react-native";

import { setOnboardingComplete } from "@/lib/onboarding";

import { WelcomeFeatures } from "./features";
import { WelcomeHero } from "./hero";

export function Welcome() {
  const handleGetStarted = async () => {
    await setOnboardingComplete();
    router.push("/sign-up");
  };

  const handleSignIn = async () => {
    await setOnboardingComplete();
    router.push("/sign-in");
  };

  return (
    <View className="flex-1 bg-neutral-950 px-6">
      {/* Hero Section */}
      <View className="flex-1 items-center justify-center">
        <WelcomeHero />
        <WelcomeFeatures />
      </View>

      {/* Bottom Actions */}
      <View className="gap-4 pb-12">
        {/* Get Started Button */}
        <Pressable
          onPress={handleGetStarted}
          className="w-full items-center rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
        >
          <Text className="text-lg font-semibold text-white">Get Started</Text>
        </Pressable>

        {/* Sign In Link */}
        <View className="flex-row justify-center gap-1">
          <Text className="text-neutral-400">Already have an account?</Text>
          <Pressable onPress={handleSignIn}>
            <Text className="font-semibold text-orange-500">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
