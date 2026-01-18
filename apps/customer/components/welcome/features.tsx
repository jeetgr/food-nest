import React from "react";
import { View, Text } from "react-native";

export function WelcomeFeatures() {
  return (
    <View className="mb-12 w-full max-w-sm gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
          <Text className="text-lg text-orange-500">🍔</Text>
        </View>
        <Text className="flex-1 text-neutral-300">
          Explore our delicious menu
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
          <Text className="text-lg text-orange-500">⚡</Text>
        </View>
        <Text className="flex-1 text-neutral-300">
          Fast delivery in 30 minutes
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
          <Text className="text-lg text-orange-500">💳</Text>
        </View>
        <Text className="flex-1 text-neutral-300">Secure & easy payments</Text>
      </View>
    </View>
  );
}
