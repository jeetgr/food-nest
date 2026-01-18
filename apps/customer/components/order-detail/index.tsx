import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { orpc } from "@/utils/orpc";

import { OrderInfo } from "./order-info";
import { OrderItems } from "./order-items";
import { StatusTimeline } from "./status-timeline";

export function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const orderQuery = useQuery(
    orpc.orders.getById.queryOptions({
      input: { id: id! },
      refetchInterval: ({ state }) => {
        const status = state.data?.status;

        if (status === "delivered" || status === "cancelled") {
          return false;
        }

        return 3000;
      },
    }),
  );

  const order = orderQuery.data;

  if (orderQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-semibold text-white">
          Order not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-2xl bg-orange-500 px-8 py-4"
        >
          <Text className="font-semibold text-white">Go Back</Text>
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
        <View>
          <Text className="text-xl font-bold text-white">Order Details</Text>
          <Text className="text-sm text-neutral-400">
            #{order.id.slice(-8).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Order Status */}
        <View className="px-4 pb-6">
          <Text className="mb-4 text-lg font-semibold text-white">
            Order Status
          </Text>
          <StatusTimeline currentStatus={order.status} />
        </View>

        <OrderInfo
          id={order.id}
          createdAt={order.createdAt}
          address={order.address}
          notes={order.notes}
          payment={order.payment}
          totalAmount={order.totalAmount}
        />

        <OrderItems items={order.items} />
      </ScrollView>
    </View>
  );
}
