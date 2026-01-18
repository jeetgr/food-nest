import React from "react";
import { View, Text } from "react-native";

interface UserInfoDetailProps {
  name: string;
  email: string;
}

export function UserInfoDetail({ name, email }: UserInfoDetailProps) {
  return (
    <View className="mx-4 mb-6 items-center rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-orange-500">
        <Text className="text-3xl font-bold text-white">
          {name?.charAt(0).toUpperCase() || "U"}
        </Text>
      </View>
      <Text className="mb-1 text-xl font-semibold text-white">{name}</Text>
      <Text className="text-neutral-400">{email}</Text>
    </View>
  );
}
