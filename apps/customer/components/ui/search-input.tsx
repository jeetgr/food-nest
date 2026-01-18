import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, TextInput, Pressable } from "react-native";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChangeText,
  placeholder = "Search...",
  className,
}: SearchInputProps) {
  return (
    <View
      className={`h-12 flex-row items-center rounded-2xl border border-neutral-800 bg-neutral-900 px-4 ${className}`}
    >
      <Ionicons name="search-outline" size={20} color="#737373" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#737373"
        className="mx-3 flex-1 text-base text-white"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")}>
          <Ionicons name="close-circle" size={18} color="#737373" />
        </Pressable>
      )}
    </View>
  );
}
