import { router } from "expo-router";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { authClient } from "@/lib/auth-client";
import { useCartStore } from "@/lib/cart-store";

import { ConfirmationModal } from "../ui/confirmation-modal";
import { MenuItem } from "./menu-item";
import { SignInPrompt } from "./sign-in-prompt";
import { UserInfoDetail } from "./user-info-detail";

export function Profile() {
  const insets = useSafeAreaInsets();
  const { data: session, isPending } = authClient.useSession();
  const [showSignOutModal, setShowSignOutModal] = React.useState(false);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleSignOut = async () => {
    await authClient.signOut();
    clearCart();
    toast.success("Signed out", {
      description: "You have been signed out successfully.",
    });
    router.replace("/welcome");
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">Loading...</Text>
      </View>
    );
  }

  if (!session?.user) {
    return (
      <View
        className="flex-1 bg-neutral-950"
        style={{ paddingTop: insets.top }}
      >
        <SignInPrompt />
      </View>
    );
  }

  const user = session.user;

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      <ConfirmationModal
        isVisible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDestructive
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-2 pb-6">
          <Text className="text-2xl font-bold text-white">Profile</Text>
        </View>

        {/* User Info */}
        <UserInfoDetail name={user.name} email={user.email} />

        {/* Menu Items */}
        <View className="gap-3 px-4">
          <MenuItem
            icon="location-outline"
            label="My Addresses"
            onPress={() => router.push("/addresses")}
          />
          <MenuItem
            icon="receipt-outline"
            label="Order History"
            onPress={() => router.push("/(drawer)/(tabs)/orders")}
          />
          {/* <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() =>
              toast.info("Coming soon!", {
                description: "Help section is under development.",
              })
            }
          /> */}
          <MenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() =>
              toast.info("FoodNest v1.0.0", {
                description: "Made with ❤️ for food lovers",
              })
            }
          />
        </View>

        {/* Sign Out */}
        <View className="mt-6 px-4 pb-8">
          <MenuItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={() => setShowSignOutModal(true)}
            danger
          />
        </View>
      </ScrollView>
    </View>
  );
}
