import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { View, Text } from "react-native";

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
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ComponentProps<typeof Ionicons>["name"];
  }
> = {
  pending: {
    label: "Order Pending",
    color: "#fbbf24",
    bgColor: "bg-yellow-500/20",
    icon: "time-outline",
  },
  confirmed: {
    label: "Order Confirmed",
    color: "#3b82f6",
    bgColor: "bg-blue-500/20",
    icon: "checkmark-circle-outline",
  },
  preparing: {
    label: "Preparing Your Food",
    color: "#f97316",
    bgColor: "bg-orange-500/20",
    icon: "flame-outline",
  },
  ready: {
    label: "Ready for Pickup",
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

const statusOrder: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export function StatusTimeline({
  currentStatus,
}: {
  currentStatus: OrderStatus;
}) {
  if (currentStatus === "cancelled") {
    return (
      <View className="items-center rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
        <Ionicons name="close-circle" size={48} color="#ef4444" />
        <Text className="mt-2 text-lg font-semibold text-red-500">
          Order Cancelled
        </Text>
      </View>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);
  const currentStatusConfig = statusConfig[currentStatus];
  // Use the color of the current status for the timeline if available, otherwise orange
  const activeColor = currentStatusConfig?.color || "#f97316";

  return (
    <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      {statusOrder.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[status];

        // This is the color for this specific step's icon/text if active
        // But the user asked: "on which status it has it will show the whole time color currently it just orange"
        // This interprets as: If status is 'delivered' (green), the whole timeline 'active' parts should be green.
        // If status is 'confirmed' (blue), the active parts should be blue.

        // So for the filled circles and lines, we use activeColor.

        return (
          <View key={status} className="flex-row">
            {/* Timeline Line */}
            <View className="items-center">
              <View
                className={`h-8 w-8 items-center justify-center rounded-full`}
                style={{
                  backgroundColor: isCompleted ? activeColor : "#404040", // neutral-700
                }}
              >
                <Ionicons
                  name={isCompleted ? "checkmark" : config.icon}
                  size={16}
                  color={isCompleted ? "white" : "#525252"}
                />
              </View>
              {index < statusOrder.length - 1 && (
                <View
                  className={`h-10 w-0.5`}
                  style={{
                    backgroundColor:
                      index < currentIndex ? activeColor : "#404040",
                  }}
                />
              )}
            </View>

            {/* Status Text */}
            <View className="ml-4 flex-1 pb-4">
              <Text
                className="text-base font-medium"
                style={{
                  color: isCurrent
                    ? activeColor
                    : isCompleted
                      ? "white"
                      : "#737373", // neutral-500
                }}
              >
                {config.label}
              </Text>
              {isCurrent && (
                <Text className="mt-1 text-sm text-neutral-400">
                  Current Status
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
