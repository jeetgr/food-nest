import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="restaurant-outline" size={64} color="#525252" />
      <Text className="mt-4 text-lg text-neutral-400">No items available</Text>
      <Text className="mt-1 text-sm text-neutral-500">
        Check back later for delicious food!
      </Text>
    </View>
  );
}
