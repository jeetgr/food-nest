import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text } from "react-native";

interface OrderInfoProps {
  id: string;
  createdAt: Date;
  address?: {
    label: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  } | null;
  notes?: string | null;
  payment?: {
    method: string;
    status: string;
  } | null;
  totalAmount: string;
}

export function OrderInfo({
  createdAt,
  address,
  notes,
  payment,
  totalAmount,
}: OrderInfoProps) {
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View>
      {/* Delivery Address */}
      {address && (
        <View className="px-4 pb-6">
          <Text className="mb-3 text-lg font-semibold text-white">
            Delivery Address
          </Text>
          <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <View className="mb-2 flex-row items-center gap-2">
              <Ionicons name="location-outline" size={18} color="#f97316" />
              <Text className="font-medium text-orange-500">
                {address.label}
              </Text>
            </View>
            <Text className="text-white">{address.street}</Text>
            <Text className="text-neutral-400">
              {address.city}, {address.state} {address.postalCode}
            </Text>
            <Text className="mt-1 text-neutral-500">{address.phone}</Text>
          </View>
        </View>
      )}

      {/* Special Instructions */}
      {notes && (
        <View className="px-4 pb-6">
          <Text className="mb-3 text-lg font-semibold text-white">
            Special Instructions
          </Text>
          <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <Text className="text-neutral-300">{notes}</Text>
          </View>
        </View>
      )}

      {/* Order Summary */}
      <View className="px-4 pb-6">
        <Text className="mb-4 text-lg font-semibold text-white">
          Order Summary
        </Text>
        <View className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <View className="mb-2 flex-row justify-between">
            <Text className="text-neutral-400">Order Date</Text>
            <Text className="text-white">{formattedDate}</Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-neutral-400">Order Time</Text>
            <Text className="text-white">{formattedTime}</Text>
          </View>
          <View className="mb-2 flex-row justify-between">
            <Text className="text-neutral-400">Payment Method</Text>
            <Text className="text-white">
              {payment?.method === "cod"
                ? "Cash on Delivery"
                : payment?.method || "N/A"}
            </Text>
          </View>
          <View className="my-3 h-px bg-neutral-800" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-semibold text-white">Total</Text>
            <Text className="text-lg font-bold text-orange-500">
              ₹{totalAmount}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
