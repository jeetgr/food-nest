import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressSectionProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (id: string) => void;
  isLoading: boolean;
}

function AddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className={`mb-3 rounded-2xl border p-4 ${
        isSelected
          ? "border-orange-500 bg-orange-500/10"
          : "border-neutral-800 bg-neutral-900"
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="mb-2 flex-row items-center gap-2">
            <View
              className={`rounded-full px-2 py-0.5 ${
                isSelected ? "bg-orange-500" : "bg-neutral-700"
              }`}
            >
              <Text className="text-xs font-medium text-white">
                {address.label}
              </Text>
            </View>
            {address.isDefault && (
              <Text className="text-xs text-neutral-500">Default</Text>
            )}
          </View>
          <Text className="mb-1 text-base text-white">{address.street}</Text>
          <Text className="text-sm text-neutral-400">
            {address.city}, {address.state} {address.postalCode}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500">{address.phone}</Text>
        </View>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            isSelected
              ? "border-orange-500 bg-orange-500"
              : "border-neutral-600"
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
        </View>
      </View>
    </Pressable>
  );
}

export function AddressSection({
  addresses,
  selectedAddressId,
  onSelectAddress,
  isLoading,
}: AddressSectionProps) {
  return (
    <View className="px-4 pb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">
          Delivery Address
        </Text>
        <Pressable onPress={() => router.push("/address-form")}>
          <Text className="text-sm font-medium text-orange-500">+ Add New</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#f97316" />
      ) : addresses.length === 0 ? (
        <Pressable
          onPress={() => router.push("/address-form")}
          className="items-center rounded-2xl border border-dashed border-neutral-700 py-8"
        >
          <Ionicons name="add-circle-outline" size={40} color="#f97316" />
          <Text className="mt-2 text-neutral-400">Add your first address</Text>
        </Pressable>
      ) : (
        addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            isSelected={selectedAddressId === address.id}
            onSelect={() => onSelectAddress(address.id)}
          />
        ))
      )}
    </View>
  );
}
