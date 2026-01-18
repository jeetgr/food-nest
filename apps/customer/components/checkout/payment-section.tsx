import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text } from "react-native";

export function PaymentSection() {
  return (
    <View className="px-4 pb-6">
      <Text className="mb-4 text-lg font-semibold text-white">
        Payment Method
      </Text>
      <View className="flex-row items-center rounded-2xl border border-orange-500 bg-orange-500/10 p-4">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
          <Ionicons name="cash-outline" size={20} color="#f97316" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-white">Cash on Delivery</Text>
          <Text className="text-sm text-neutral-400">
            Pay when your order arrives
          </Text>
        </View>
        <View className="h-5 w-5 items-center justify-center rounded-full border-2 border-orange-500 bg-orange-500">
          <Ionicons name="checkmark" size={12} color="white" />
        </View>
      </View>
    </View>
  );
}
