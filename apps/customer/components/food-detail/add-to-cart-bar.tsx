import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AddToCartBarProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToCart: () => void;
  price: string;
  isAvailable: boolean;
}

export function AddToCartBar({
  quantity,
  onIncrement,
  onDecrement,
  onAddToCart,
  price,
  isAvailable,
}: AddToCartBarProps) {
  const insets = useSafeAreaInsets();
  const totalPrice = (parseFloat(price) * quantity).toFixed(2);

  return (
    <View
      className="border-t border-neutral-800 bg-neutral-900 px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      {/* Quantity Selector */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg text-neutral-300">Quantity</Text>
        <View className="flex-row items-center rounded-full border border-neutral-700 bg-neutral-800">
          <Pressable
            onPress={onDecrement}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="remove" size={20} color="#f97316" />
          </Pressable>
          <Text className="w-10 text-center text-lg font-semibold text-white">
            {quantity}
          </Text>
          <Pressable
            onPress={onIncrement}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="add" size={20} color="#f97316" />
          </Pressable>
        </View>
      </View>

      {/* Add to Cart Button */}
      <Pressable
        onPress={onAddToCart}
        disabled={!isAvailable}
        className={`flex-row items-center justify-center rounded-2xl py-4 ${
          isAvailable ? "bg-orange-500 active:bg-orange-600" : "bg-neutral-700"
        }`}
      >
        <Ionicons
          name="cart-outline"
          size={22}
          color={isAvailable ? "white" : "#a3a3a3"}
        />
        <Text
          className={`ml-2 text-lg font-semibold ${
            isAvailable ? "text-white" : "text-neutral-400"
          }`}
        >
          Add to Cart - ₹{totalPrice}
        </Text>
      </Pressable>
    </View>
  );
}
