import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CheckoutFooterProps {
  total: number;
  onPlaceOrder: () => void;
  isPending: boolean;
  canPlaceOrder: boolean;
}

export function CheckoutFooter({
  total,
  onPlaceOrder,
  isPending,
  canPlaceOrder,
}: CheckoutFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-neutral-800 bg-neutral-900 px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 16 }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg text-neutral-300">Total</Text>
        <Text className="text-2xl font-bold text-white">
          ₹{total.toFixed(2)}
        </Text>
      </View>
      <Pressable
        onPress={onPlaceOrder}
        disabled={isPending || !canPlaceOrder}
        className={`items-center rounded-2xl py-4 ${
          isPending || !canPlaceOrder
            ? "bg-orange-500/50"
            : "bg-orange-500 active:bg-orange-600"
        }`}
      >
        {isPending ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-lg font-semibold text-white">
              Placing Order...
            </Text>
          </View>
        ) : (
          <Text className="text-lg font-semibold text-white">Place Order</Text>
        )}
      </Pressable>
    </View>
  );
}
