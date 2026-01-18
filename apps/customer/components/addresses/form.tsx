import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

import { orpc } from "@/utils/orpc";

import { InputField } from "./input";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  street: z.string().min(1, "Street address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  isDefault: z.boolean(),
});

export function AddressForm() {
  const insets = useSafeAreaInsets();

  const createMutation = useMutation(
    orpc.addresses.create.mutationOptions({
      onSuccess: () => {
        router.back();
      },
      meta: {
        successMessage: "Address added!",
        showSuccessAlert: true,
        invalidateQueries: [orpc.addresses.list.key()],
      },
    }),
  );

  const form = useForm({
    defaultValues: {
      label: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      isDefault: false,
    },
    onSubmit: async ({ value }) => {
      createMutation.mutate(value);
    },
    validators: {
      onSubmit: addressSchema,
    },
  });

  return (
    <View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-neutral-900"
        >
          <Ionicons name="close" size={22} color="white" />
        </Pressable>
        <Text className="text-xl font-bold text-white">Add Address</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 40,
          }}
        >
          {/* Label */}
          <form.Field name="label">
            {(field) => (
              <InputField
                label="Label"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Home, Work, etc."
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* Street */}
          <form.Field name="street">
            {(field) => (
              <InputField
                label="Street Address"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="123 Main St, Apt 4B"
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* City */}
          <form.Field name="city">
            {(field) => (
              <InputField
                label="City"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Mumbai"
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* State */}
          <form.Field name="state">
            {(field) => (
              <InputField
                label="State"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Maharashtra"
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* Postal Code */}
          <form.Field name="postalCode">
            {(field) => (
              <InputField
                label="Postal Code"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="400001"
                keyboardType="numeric"
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* Phone */}
          <form.Field name="phone">
            {(field) => (
              <InputField
                label="Phone Number"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
                error={field.state.meta.errors[0]?.message}
              />
            )}
          </form.Field>

          {/* Is Default */}
          <form.Field name="isDefault">
            {(field) => (
              <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <View>
                  <Text className="text-base font-medium text-white">
                    Set as default address
                  </Text>
                  <Text className="text-sm text-neutral-400">
                    Use this address by default for delivery
                  </Text>
                </View>
                <Switch
                  value={field.state.value}
                  onValueChange={field.handleChange}
                  trackColor={{ false: "#404040", true: "#f97316" }}
                  thumbColor="white"
                />
              </View>
            )}
          </form.Field>

          {/* Submit Button */}
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Pressable
                onPress={() => form.handleSubmit()}
                disabled={
                  !canSubmit || isSubmitting || createMutation.isPending
                }
                className={`items-center rounded-2xl py-4 ${
                  !canSubmit || isSubmitting || createMutation.isPending
                    ? "bg-orange-500/50"
                    : "bg-orange-500 active:bg-orange-600"
                }`}
              >
                {isSubmitting || createMutation.isPending ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-lg font-semibold text-white">
                      Saving...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-lg font-semibold text-white">
                    Save Address
                  </Text>
                )}
              </Pressable>
            )}
          </form.Subscribe>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
