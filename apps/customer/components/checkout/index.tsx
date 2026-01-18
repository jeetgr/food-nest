import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { authClient } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";
import { orpc } from "@/utils/orpc";

import { AddressSection } from "./address-section";
import { CheckoutFooter } from "./footer";
import { OrderSummary } from "./order-summary";
import { PaymentSection } from "./payment-section";

export function Checkout() {
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [notes, setNotes] = useState("");

  const addressesQuery = useQuery({
    ...orpc.addresses.list.queryOptions(),
    enabled: !!session?.user,
  });

  const createOrderMutation = useMutation(
    orpc.orders.create.mutationOptions({
      onSuccess: (order) => {
        clearCart();
        router.replace(`/order/${order.id}`);
      },
      meta: {
        successMessage: "Order placed!",
        showSuccessAlert: true,
        invalidateQueries: [orpc.orders.listMine.key()],
      },
    }),
  );

  const addresses = useMemo(
    () => addressesQuery.data || [],
    [addressesQuery.data],
  );

  // Auto-select default address
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      setSelectedAddressId(defaultAddress?.id || addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Please select an address", {
        description: "You need to select a delivery address.",
      });
      return;
    }

    createOrderMutation.mutate({
      addressId: selectedAddressId,
      items: items.map((item) => ({
        foodId: item.id,
        quantity: item.quantity,
      })),
      notes: notes.trim() || undefined,
    });
  };

  if (items.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-neutral-950 px-6"
        style={{ paddingTop: insets.top }}
      >
        <Ionicons name="cart-outline" size={64} color="#525252" />
        <Text className="mt-4 text-xl font-semibold text-white">
          Your cart is empty
        </Text>
        <Pressable
          onPress={() => router.replace("/(drawer)/(tabs)")}
          className="mt-6 rounded-2xl bg-orange-500 px-8 py-4"
        >
          <Text className="font-semibold text-white">Browse Menu</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>
        <Text className="text-2xl font-bold text-white">Checkout</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <AddressSection
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={setSelectedAddressId}
          isLoading={addressesQuery.isLoading}
        />

        <OrderSummary items={items} />

        {/* Notes Input - Kept inline as it's simple state */}
        <View className="px-4 pb-6">
          <Text className="mb-3 text-lg font-semibold text-white">
            Special Instructions
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any special requests? (optional)"
            placeholderTextColor="#525252"
            multiline
            numberOfLines={3}
            className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-white"
            style={{ textAlignVertical: "top", minHeight: 80 }}
          />
        </View>

        <PaymentSection />
      </ScrollView>

      <CheckoutFooter
        total={total}
        onPlaceOrder={handlePlaceOrder}
        isPending={createOrderMutation.isPending}
        canPlaceOrder={!!selectedAddressId}
      />
    </View>
  );
}
