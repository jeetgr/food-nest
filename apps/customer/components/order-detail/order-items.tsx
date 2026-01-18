import { Image } from "expo-image";
import React from "react";
import { View, Text } from "react-native";

import { getImageUrl } from "@/lib/get-image-url";

interface OrderItemsProps {
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    food: {
      name: string;
      image: string;
    };
  }>;
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <View className="px-4 pb-6">
      <Text className="mb-4 text-lg font-semibold text-white">Order Items</Text>
      {items.map((item) => (
        <View
          key={item.id}
          className="mb-3 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-3"
        >
          <Image
            source={{ uri: getImageUrl(item.food.image) }}
            style={{ width: 60, height: 60, borderRadius: 12 }}
            contentFit="cover"
          />
          <View className="ml-3 flex-1">
            <Text className="text-base font-medium text-white">
              {item.food.name}
            </Text>
            <Text className="text-sm text-neutral-400">
              {item.quantity}x ₹{item.unitPrice}
            </Text>
          </View>
          <Text className="text-base font-semibold text-white">
            ₹{item.totalPrice}
          </Text>
        </View>
      ))}
    </View>
  );
}
