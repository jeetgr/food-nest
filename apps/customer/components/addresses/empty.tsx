import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

export function EmptyAddresses() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-neutral-900">
        <Ionicons name="location-outline" size={48} color="#525252" />
      </View>
      <Text className="mb-2 text-xl font-semibold text-white">
        No addresses yet
      </Text>
      <Text className="mb-6 text-center text-neutral-400">
        Add your first delivery address to start ordering.
      </Text>
      <Pressable
        onPress={() => router.push("/address-form")}
        className="rounded-2xl bg-orange-500 px-8 py-4"
      >
        <Text className="text-base font-semibold text-white">Add Address</Text>
      </Pressable>
    </View>
  );
}
