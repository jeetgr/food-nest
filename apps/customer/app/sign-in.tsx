import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInScreen() {
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
        <SignInForm />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
