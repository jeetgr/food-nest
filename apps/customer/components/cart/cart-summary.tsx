import React from "react";
import { View, Text, Pressable } from "react-native";

import { useCartStore } from "@/lib/cart-store";

interface CartSummaryProps {
  onCheckout: () => void;
}

export function CartSummary({ onCheckout }: CartSummaryProps) {
  const total = useCartStore((state) => state.getTotal());

  return (
    <View className="border-t border-neutral-800 bg-neutral-900 px-4 pt-4 pb-8">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg text-neutral-300">Total</Text>
        <Text className="text-2xl font-bold text-white">
          ₹{total.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onCheckout}
        className="items-center rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
      >
        <Text className="text-lg font-semibold text-white">
          Proceed to Checkout
        </Text>
      </Pressable>
    </View>
  );
}
