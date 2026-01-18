import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { toast } from "sonner-native";

import { useCartStore } from "@/lib/cart-store";
import { orpc } from "@/utils/orpc";

import { AddToCartBar } from "./add-to-cart-bar";
import { FoodInfo } from "./food-info";
import { ImageHeader } from "./image-header";

export function FoodDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const foodQuery = useQuery(
    orpc.foods.getBySlug.queryOptions({
      input: { slug: slug! },
    }),
  );

  const food = foodQuery.data;

  const handleAddToCart = () => {
    if (!food) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
      });
    }

    toast.success("Added to cart!", {
      description: `${quantity}x ${food.name} added to your cart.`,
    });

    router.back();
  };

  if (foodQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!food) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-semibold text-white">
          Food not found
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
    <View className="flex-1 bg-neutral-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageHeader image={food.image} />
        <FoodInfo
          name={food.name}
          category={food.category.name}
          price={food.price}
          description={food.description}
          isAvailable={food.isAvailable}
        />
      </ScrollView>

      <AddToCartBar
        quantity={quantity}
        price={food.price}
        isAvailable={food.isAvailable}
        onIncrement={() => setQuantity(quantity + 1)}
        onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
        onAddToCart={handleAddToCart}
      />
    </View>
  );
}
