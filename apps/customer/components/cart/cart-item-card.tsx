import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { View, Text, Pressable } from "react-native";

import { useCartStore, type CartItem } from "@/lib/cart-store";
import { getImageUrl } from "@/lib/get-image-url";

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <View className="mb-3 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
      <Image
        source={{ uri: getImageUrl(item.image) }}
        style={{ width: 80, height: 80, borderRadius: 12 }}
        contentFit="cover"
      />
      <View className="ml-3 flex-1">
        <Text className="text-base font-semibold text-white" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="mt-1 text-sm text-neutral-400">
          ₹{item.price} each
        </Text>
        <Text className="mt-1 text-lg font-bold text-orange-500">
          ₹{itemTotal}
        </Text>
      </View>

      {/* Quantity Controls */}
      <View className="items-center">
        <View className="flex-row items-center rounded-full border border-neutral-700 bg-neutral-800">
          <Pressable
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            className="h-8 w-8 items-center justify-center"
          >
            <Ionicons name="remove" size={18} color="#f97316" />
          </Pressable>
          <Text className="w-8 text-center text-base font-semibold text-white">
            {item.quantity}
          </Text>
          <Pressable
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            className="h-8 w-8 items-center justify-center"
          >
            <Ionicons name="add" size={18} color="#f97316" />
          </Pressable>
        </View>
        <Pressable onPress={() => removeItem(item.id)} className="mt-2">
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </Pressable>
      </View>
    </View>
  );
}
