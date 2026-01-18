import { useForm } from "@tanstack/react-form";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { toast } from "sonner-native";
import z from "zod";

import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { syncCartWithServer } from "@/lib/cart-store";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await authClient.signIn.email(
          {
            email: value.email.trim().toLowerCase(),
            password: value.password,
          },
          {
            onSuccess: async () => {
              await syncCartWithServer();
              toast.success("Welcome back!", {
                description: "You have signed in successfully.",
              });
              router.replace("/");
            },
            onError: (error) => {
              toast.error("Sign In Failed", {
                description:
                  error.error.message || "Invalid email or password.",
              });
            },
          },
        );
      } catch (error) {
        console.error(error);
        toast.error("Error", {
          description: "Sign in failed. Please try again.",
        });
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
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
          {/* Header */}
          <View className="mb-10 items-center">
            <Logo size={80} />
            <Text className="mt-6 text-3xl font-bold text-white">
              Welcome Back
            </Text>
            <Text className="mt-2 text-center text-neutral-400">
              Sign in to continue ordering your favorite food
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            <form.Field name="email">
              {(field) => (
                <View className="gap-2">
                  <Text className="text-neutral-300">Email</Text>
                  <TextInput
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="you@example.com"
                    placeholderTextColor="#525252"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-white"
                  />
                  {field.state.meta.errors.map((e) => (
                    <Text key={e?.message} className="text-sm text-red-500">
                      {e?.message}
                    </Text>
                  ))}
                </View>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-neutral-300">Password</Text>
                    <Pressable>
                      <Text className="text-sm text-orange-500">
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </View>

                  <View className="relative">
                    <TextInput
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      placeholder="••••••••"
                      placeholderTextColor="#525252"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 pr-14 text-white"
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      className="absolute top-0 right-4 bottom-0 justify-center"
                    >
                      <Text className="text-xl text-neutral-400">
                        {showPassword ? "🙈" : "👁️"}
                      </Text>
                    </Pressable>
                  </View>

                  {field.state.meta.errors.map((e) => (
                    <Text key={e?.message} className="text-sm text-red-500">
                      {e?.message}
                    </Text>
                  ))}
                </View>
              )}
            </form.Field>

            {/* Submit */}
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
                      : "bg-orange-500"
                  }`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-lg font-semibold text-white">
                      Sign In
                    </Text>
                  )}
                </Pressable>
              )}
            </form.Subscribe>
          </View>

          {/* Footer */}
          <View className="mt-10">
            <View className="my-8 flex-row items-center">
              <View className="h-px flex-1 bg-neutral-800" />
              <Text className="px-4 text-neutral-500">or continue as</Text>
              <View className="h-px flex-1 bg-neutral-800" />
            </View>

            <Pressable
              onPress={() => router.replace("/")}
              className="h-14 items-center justify-center rounded-2xl border border-neutral-700"
            >
              <Text className="text-lg font-semibold text-neutral-300">
                Continue as Guest
              </Text>
            </Pressable>

            <View className="mt-8 flex-row justify-center gap-1">
              <Text className="text-neutral-400">Don't have an account?</Text>
              <Pressable onPress={() => router.push("/sign-up")}>
                <Text className="font-semibold text-orange-500">Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
