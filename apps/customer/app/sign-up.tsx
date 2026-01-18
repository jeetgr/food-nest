import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      className="flex-1 bg-neutral-950"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SignUpForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
