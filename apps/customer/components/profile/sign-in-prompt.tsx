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
        Sign in to your account
      </Text>
      <Text className="mb-6 text-center text-neutral-400">
        Sign in to manage your profile, addresses, and view order history.
      </Text>
      <Pressable
        onPress={() => router.push("/sign-in")}
        className="mb-3 w-full rounded-2xl bg-orange-500 py-4"
      >
        <Text className="text-center text-base font-semibold text-white">
          Sign In
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.push("/sign-up")}
        className="w-full rounded-2xl border border-neutral-700 py-4"
      >
        <Text className="text-center text-base font-semibold text-neutral-300">
          Create Account
        </Text>
      </Pressable>
    </View>
  );
}
