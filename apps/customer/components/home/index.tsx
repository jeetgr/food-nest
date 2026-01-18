import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchInput } from "@/components/ui/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

import { CartBadgeSmall } from "./cart-badge-small";
import { CategoryChip } from "./category-chip";
import { EmptyState } from "./empty-state";
import { FoodCard } from "./food-card";

export function Home() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500);

  const { data: session } = authClient.useSession();

  const categoriesQuery = useQuery(
    orpc.categories.list.queryOptions({
      input: { all: true },
    }),
  );

  const foodsQuery = useQuery(
    orpc.foods.list.queryOptions({
      input: {
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        query: debouncedQuery || undefined,
        onlyAvailable: true,
        limit: 50,
      },
    }),
  );

  const isLoading = categoriesQuery.isLoading || foodsQuery.isLoading;
  const isRefreshing = categoriesQuery.isRefetching || foodsQuery.isRefetching;

  const handleRefresh = () => {
    void categoriesQuery.refetch();
    void foodsQuery.refetch();
  };

  const categories = categoriesQuery.data?.items || [];
  const foods = foodsQuery.data?.items || [];

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-4 pt-2 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-white">FoodNest</Text>
            </View>
            <Text className="text-sm text-neutral-400">
              {session?.user
                ? `Hi, ${session.user.name.split(" ")[0]}! 👋`
                : "Fresh & Delicious Food"}
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push("/(drawer)/(tabs)/profile" as any)}
              className="h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
            >
              <Ionicons name="person-outline" size={20} color="#a3a3a3" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/cart" as any)}
              className="relative h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
            >
              <Ionicons name="cart-outline" size={22} color="#f97316" />
              <View className="absolute -top-1 -right-1">
                <CartBadgeSmall />
              </View>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mb-6 px-4">
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for burger, pizza..."
        />
      </View>

      {/* Categories */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          <CategoryChip
            category={{ id: "all", name: "All" }}
            isActive={selectedCategory === "all"}
            onPress={() => setSelectedCategory("all")}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              isActive={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Food Grid */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : foods.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
            />
          }
          renderItem={({ item }) => <FoodCard food={item} />}
        />
      )}
    </View>
  );
}
