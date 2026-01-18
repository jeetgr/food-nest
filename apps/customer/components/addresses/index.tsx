import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { orpc } from "@/utils/orpc";

import { AddressCard } from "./card";
import { EmptyAddresses } from "./empty";

export function Addresses() {
  const insets = useSafeAreaInsets();

  const addressesQuery = useQuery(orpc.addresses.list.queryOptions());

  const setDefaultMutation = useMutation(
    orpc.addresses.setDefault.mutationOptions({
      meta: {
        successMessage: "Default address updated",
        showSuccessAlert: true,
        invalidateQueries: [orpc.addresses.list.key()],
      },
    }),
  );

  const deleteMutation = useMutation(
    orpc.addresses.delete.mutationOptions({
      meta: {
        successMessage: "Address deleted",
        showSuccessAlert: true,
        invalidateQueries: [orpc.addresses.list.key()],
      },
    }),
  );

  const addresses = addressesQuery.data || [];

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </Pressable>
          <Text className="text-2xl font-bold text-white">My Addresses</Text>
        </View>
        <Pressable
          onPress={() => router.push("/address-form")}
          className="h-10 w-10 items-center justify-center rounded-full bg-orange-500"
        >
          <Ionicons name="add" size={22} color="white" />
        </Pressable>
      </View>

      {addressesQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : addresses.length === 0 ? (
        <EmptyAddresses />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={addressesQuery.isRefetching}
              onRefresh={() => addressesQuery.refetch()}
              tintColor="#f97316"
            />
          }
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              onSetDefault={(id) => setDefaultMutation.mutate({ id })}
              onDelete={(id) => deleteMutation.mutate({ id })}
            />
          )}
        />
      )}
    </View>
  );
}
