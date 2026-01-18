import { Ionicons } from "@expo/vector-icons";
import React, { ComponentProps } from "react";
import { View, Text, Pressable } from "react-native";

interface MenuItemProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
}

export function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
    >
      <View className="flex-row items-center gap-3">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${
            danger ? "bg-red-500/20" : "bg-orange-500/20"
          }`}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? "#ef4444" : "#f97316"}
          />
        </View>
        <Text className={`text-base ${danger ? "text-red-500" : "text-white"}`}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#525252" />
    </Pressable>
  );
}
