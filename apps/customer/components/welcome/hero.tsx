import React from "react";
import { View, Text } from "react-native";

import { Logo } from "@/components/logo";

export function WelcomeHero() {
  return (
    <View className="flex-1 items-center justify-center">
      {/* Logo */}
      <View className="mb-8">
        <Logo size={100} />
      </View>

      {/* Brand Name */}
      <Text className="mb-2 text-4xl font-bold text-white">FoodNest</Text>
      <Text className="mb-8 text-center text-lg text-neutral-400">
        Delicious food, delivered to your doorstep
      </Text>
    </View>
  );
}
