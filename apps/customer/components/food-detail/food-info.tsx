import React from "react";
import { View, Text } from "react-native";

interface FoodInfoProps {
  name: string;
  category: string;
  price: string;
  description: string | null;
  isAvailable: boolean;
}

export function FoodInfo({
  name,
  category,
  price,
  description,
  isAvailable,
}: FoodInfoProps) {
  return (
    <View className="px-4 py-6">
      {/* Category Badge */}
      <View className="mb-3 self-start rounded-full bg-orange-500/20 px-3 py-1">
        <Text className="text-sm font-medium text-orange-500">{category}</Text>
      </View>

      {/* Name */}
      <Text className="mb-2 text-3xl font-bold text-white">{name}</Text>

      {/* Price */}
      <Text className="mb-4 text-2xl font-bold text-orange-500">₹{price}</Text>

      {/* Description */}
      {description && (
        <View className="mb-6">
          <Text className="mb-2 text-lg font-semibold text-white">
            Description
          </Text>
          <Text className="leading-6 text-neutral-400">{description}</Text>
        </View>
      )}

      {/* Availability */}
      <View className="mb-6 flex-row items-center gap-2">
        <View
          className={`h-3 w-3 rounded-full ${
            isAvailable ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <Text className="text-neutral-400">
          {isAvailable ? "Available" : "Currently Unavailable"}
        </Text>
      </View>
    </View>
  );
}
