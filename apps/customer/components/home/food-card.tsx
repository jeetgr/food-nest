import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useCartStore } from "@/lib/cart-store";
import { getImageUrl } from "@/lib/get-image-url";
import { ORPCClientOutputs } from "@/utils/orpc";

type Food = ORPCClientOutputs["foods"]["list"]["items"][number];

export function FoodCard({ food }: { food: Food }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
    });
  };

  return (
    <Pressable
      onPress={() => router.push(`/food/${food.slug}` as any)}
      className="mb-4 flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
    >
      <Image
        source={{ uri: getImageUrl(food.image) }}
        style={{ width: "100%", height: 120 }}
        contentFit="cover"
      />
      <View className="p-3">
        <Text
          className="mb-1 text-base font-semibold text-white"
          numberOfLines={1}
        >
          {food.name}
        </Text>
        {food.description && (
          <Text className="mb-2 text-xs text-neutral-400" numberOfLines={2}>
            {food.description}
          </Text>
        )}
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-orange-500">
            ₹{food.price}
          </Text>
          <Pressable
            onPress={handleAddToCart}
            className="h-8 w-8 items-center justify-center rounded-full bg-orange-500"
          >
            <Ionicons name="add" size={20} color="white" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}
