import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

import { EmptyOrders } from "./empty-orders";
import { OrderCard } from "./order-card";
import { SignInPrompt } from "./sign-in-prompt";

export function Orders() {
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();

  const ordersQuery = useQuery({
    ...orpc.orders.listMine.queryOptions(),
    enabled: !!session?.user,
  });

  if (!session?.user) {
    return (
      <View
        className="flex-1 bg-neutral-950"
        style={{ paddingTop: insets.top }}
      >
        <SignInPrompt />
      </View>
    );
  }

  const orders = ordersQuery.data || [];

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <Text className="text-2xl font-bold text-white">My Orders</Text>
      </View>

      {ordersQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={ordersQuery.isRefetching}
              onRefresh={() => ordersQuery.refetch()}
              tintColor="#f97316"
            />
          }
          renderItem={({ item }) => <OrderCard order={item} />}
        />
      )}
    </View>
  );
}
