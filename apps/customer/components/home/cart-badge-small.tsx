import { View, Text } from "react-native";

import { useCartStore } from "@/lib/cart-store";

export function CartBadgeSmall() {
  const itemCount = useCartStore((state) => state.getItemCount());

  if (itemCount === 0) return null;

  return (
    <View className="h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1">
      <Text className="text-[10px] font-bold text-white">
        {itemCount > 99 ? "99+" : itemCount}
      </Text>
    </View>
  );
}
