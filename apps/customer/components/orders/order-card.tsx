import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, Pressable } from "react-native";

interface OrderCardProps {
  order: {
    id: string;
    status: string;
    totalAmount: string;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      food: { name: string };
    }>;
  };
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "#fbbf24",
    bgColor: "bg-yellow-500/20",
    icon: "time-outline",
  },
  confirmed: {
    label: "Confirmed",
    color: "#3b82f6",
    bgColor: "bg-blue-500/20",
    icon: "checkmark-circle-outline",
  },
  preparing: {
    label: "Preparing",
    color: "#f97316",
    bgColor: "bg-orange-500/20",
    icon: "flame-outline",
  },
  ready: {
    label: "Ready",
    color: "#22c55e",
    bgColor: "bg-green-500/20",
    icon: "checkmark-done-outline",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "#8b5cf6",
    bgColor: "bg-purple-500/20",
    icon: "bicycle-outline",
  },
  delivered: {
    label: "Delivered",
    color: "#22c55e",
    bgColor: "bg-green-500/20",
    icon: "checkmark-circle",
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bgColor: "bg-red-500/20",
    icon: "close-circle-outline",
  },
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status as OrderStatus] || statusConfig.pending;
  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${config.bgColor}`}
    >
      <Ionicons name={config.icon as any} size={14} color={config.color} />
      <Text style={{ color: config.color }} className="text-xs font-medium">
        {config.label}
      </Text>
    </View>
  );
}

export function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemNames = order.items
    .slice(0, 2)
    .map((item) => `${item.quantity}x ${item.food.name}`)
    .join(", ");
  const moreItems =
    order.items.length > 2 ? ` +${order.items.length - 2} more` : "";

  return (
    <Pressable
      onPress={() => router.push(`/order/${order.id}`)}
      className="mb-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
    >
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-xs text-neutral-500">
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text className="mt-1 text-sm text-neutral-400">
            {formattedDate} at {formattedTime}
          </Text>
        </View>
        <OrderStatusBadge status={order.status as OrderStatus} />
      </View>

      <Text className="text-base text-white" numberOfLines={1}>
        {itemNames}
        {moreItems && <Text className="text-neutral-500">{moreItems}</Text>}
      </Text>

      <View className="mt-3 flex-row items-center justify-between border-t border-neutral-800 pt-3">
        <Text className="text-lg font-bold text-orange-500">
          ₹{order.totalAmount}
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm text-neutral-400">View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#a3a3a3" />
        </View>
      </View>
    </Pressable>
  );
}
