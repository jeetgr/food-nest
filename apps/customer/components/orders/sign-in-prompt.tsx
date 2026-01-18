import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

export function SignInPrompt() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-neutral-900">
        <Ionicons name="person-outline" size={48} color="#525252" />
      </View>
      <Text className="mb-2 text-xl font-semibold text-white">
        Sign in to view orders
      </Text>
      <Text className="mb-6 text-center text-neutral-400">
        Please sign in to see your order history.
      </Text>
      <Pressable
        onPress={() => router.push("/sign-in")}
        className="rounded-2xl bg-orange-500 px-8 py-4"
      >
        <Text className="text-base font-semibold text-white">Sign In</Text>
      </Pressable>
    </View>
  );
}
