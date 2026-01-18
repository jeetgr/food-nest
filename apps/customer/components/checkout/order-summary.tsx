import { Image } from "expo-image";
import React from "react";
import { View, Text } from "react-native";

import { getImageUrl } from "@/lib/get-image-url";

interface OrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    price: string;
    quantity: number;
    image: string;
  }>;
}

export function OrderSummary({ items }: OrderSummaryProps) {
  return (
    <View className="px-4 pb-6">
      <Text className="mb-4 text-lg font-semibold text-white">
        Order Summary
      </Text>
      {items.map((item) => (
        <View
          key={item.id}
          className="mb-3 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-3"
        >
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={{ width: 60, height: 60, borderRadius: 12 }}
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-white">
              {item.name}
            </Text>
            <Text className="text-sm text-neutral-400">
              {item.quantity}x ₹{item.price}
            </Text>
          </View>
          <Text className="text-base font-semibold text-white">
            ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}
