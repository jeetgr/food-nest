import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { toast } from "sonner-native";
import z from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signUp.email(
          {
            name: value.name.trim(),
            email: value.email.trim().toLowerCase(),
            password: value.password,
          },
          {
            onSuccess: () => {
              toast.success("Account Created!", {
                description: "You can now explore the app.",
              });
              router.replace("/");
            },
            onError: (error) => {
              toast.error("Registration Failed", {
                description:
                  error.error.message ||
                  "Something went wrong. Please try again.",
              });
            },
          },
        );
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: "Registration failed. Please try again.",
        });
      }
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  return (
    <View className="flex-1 bg-neutral-950">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 48,
          }}
        >
          {/* Header Section */}
          <View className="mb-8 items-center">
            <View className="mb-6">
              <Logo size={80} />
            </View>
            <Text className="mb-2 text-3xl font-bold text-white">
              Create Account
            </Text>
            <Text className="text-center text-neutral-400">
              Join FoodNest and start ordering delicious food
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-5">
            {/* Name Input */}
            <form.Field name="name">
              {(field) => (
                <View className="gap-2">
                  <Text className="font-medium text-neutral-300">
                    Full Name
                  </Text>
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="John Doe"
                    placeholderTextColor="#525252"
                    autoCapitalize="words"
                    autoComplete="name"
                    className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-base text-white"
                  />
                  {field.state.meta.errors.map((error) => (
                    <Text key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </Text>
                  ))}
                </View>
              )}
            </form.Field>

            {/* Email Input */}
            <form.Field name="email">
              {(field) => (
                <View className="gap-2">
                  <Text className="font-medium text-neutral-300">Email</Text>
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="you@example.com"
                    placeholderTextColor="#525252"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-base text-white"
                  />
                  {field.state.meta.errors.map((error) => (
                    <Text key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </Text>
                  ))}
                </View>
              )}
            </form.Field>

            {/* Password Input */}
            <form.Field name="password">
              {(field) => (
                <View className="gap-2">
                  <Text className="font-medium text-neutral-300">Password</Text>
                  <View className="relative">
                    <TextInput
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      placeholder="••••••••"
                      placeholderTextColor="#525252"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password-new"
                      className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 pr-14 text-base text-white"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute top-0 right-4 bottom-0 justify-center"
                    >
                      <Text className="text-xl text-neutral-400">
                        {showPassword ? "🙈" : "👁️"}
                      </Text>
                    </Pressable>
                  </View>
                  {field.state.meta.errors.map((error) => (
                    <Text key={error?.message} className="text-sm text-red-500">
                      {error?.message}
                    </Text>
                  ))}
                  {/* Password Requirements */}
                  <View className="mt-1 flex-row items-center gap-2 px-1">
                    <View
                      className={`h-2 w-2 rounded-full ${
                        field.state.value.length >= 8
                          ? "bg-green-500"
                          : "bg-neutral-600"
                      }`}
                    />
                    <Text className="text-sm text-neutral-500">
                      At least 8 characters
                    </Text>
                  </View>
                </View>
              )}
            </form.Field>

            {/* Sign Up Button */}
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Pressable
                  onPress={() => form.handleSubmit()}
                  disabled={!canSubmit || isSubmitting}
                  className={`mt-4 h-14 items-center justify-center rounded-2xl ${
                    !canSubmit || isSubmitting
                      ? "bg-orange-500/50"
                      : "bg-orange-500 active:bg-orange-600"
                  }`}
                >
                  {isSubmitting ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="text-lg font-semibold text-white">
                        Creating account...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-semibold text-white">
                      Create Account
                    </Text>
                  )}
                </Pressable>
              )}
            </form.Subscribe>
          </View>

          {/* Footer */}
          <View className="mt-8 flex-row justify-center gap-1">
            <Text className="text-neutral-400">Already have an account?</Text>
            <Pressable onPress={() => router.push("/sign-in")}>
              <Text className="font-semibold text-orange-500">Sign In</Text>
            </Pressable>
          </View>

          {/* Terms */}
          <View className="mt-6 px-4">
            <Text className="text-center text-sm leading-5 text-neutral-500">
              By creating an account, you agree to our{" "}
              <Text className="text-orange-500">Terms of Service</Text> and{" "}
              <Text className="text-orange-500">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
