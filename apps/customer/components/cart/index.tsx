import { router } from "expo-router";
import React from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { authClient } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";

import { CartItemCard } from "./cart-item-card";
import { CartSummary } from "./cart-summary";
import { EmptyCart } from "./empty-cart";

export function Cart() {
  const insets = useSafeAreaInsets();
  const items = useCartStore((state) => state.items);

  const clearCart = useCartStore((state) => state.clearCart);
  const { data: session } = authClient.useSession();

  const handleCheckout = () => {
    if (!session?.user) {
      toast.error("Please sign in", {
        description: "You need to sign in to place an order.",
      });
      router.push("/sign-in");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <View
        className="flex-1 bg-neutral-950"
        style={{ paddingTop: insets.top }}
      >
        <EmptyCart />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-white">Your Cart</Text>
        <Pressable onPress={clearCart}>
          <Text className="text-sm text-red-500">Clear All</Text>
        </Pressable>
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CartItemCard item={item} />}
      />

      {/* Bottom Summary */}
      <CartSummary onCheckout={handleCheckout} />
    </View>
  );
}
