import React from "react";
import { View, Text, TextInput } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  placeholder: string;
  error?: string;
  keyboardType?: "default" | "phone-pad" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}

export function InputField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: InputFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-medium text-neutral-300">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#525252"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className="h-14 rounded-2xl border border-neutral-800 bg-neutral-900 px-4 text-base text-white"
      />
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
}
