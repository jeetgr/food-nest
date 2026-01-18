import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ORPCClientOutputs } from "@/utils/orpc";

type Address = ORPCClientOutputs["addresses"]["list"][number];

interface AddressCardProps {
  address: Address;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({
  address,
  onSetDefault,
  onDelete,
}: AddressCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <ConfirmationModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete(address.id)}
        title="Delete Address"
        message={`Are you sure you want to delete "${address.label}"?`}
        confirmText="Delete"
        isDestructive
      />
      <View className="mb-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-full bg-orange-500/20 px-3 py-1">
              <Text className="text-sm font-medium text-orange-500">
                {address.label}
              </Text>
            </View>
            {address.isDefault && (
              <View className="rounded-full bg-green-500/20 px-2 py-0.5">
                <Text className="text-xs font-medium text-green-500">
                  Default
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowDeleteModal(true)}
              className="h-8 w-8 items-center justify-center rounded-full bg-red-500/20"
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </Pressable>
          </View>
        </View>

        <Text className="mb-1 text-base text-white">{address.street}</Text>
        <Text className="mb-1 text-sm text-neutral-400">
          {address.city}, {address.state} {address.postalCode}
        </Text>
        <Text className="text-sm text-neutral-500">{address.phone}</Text>

        {!address.isDefault && (
          <Pressable
            onPress={() => onSetDefault(address.id)}
            className="mt-3 self-start rounded-full border border-orange-500 px-4 py-2"
          >
            <Text className="text-sm font-medium text-orange-500">
              Set as Default
            </Text>
          </Pressable>
        )}
      </View>
    </>
  );
}
