import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getImageUrl } from "@/lib/get-image-url";

interface ImageHeaderProps {
  image: string;
}

export function ImageHeader({ image }: ImageHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => router.back()}
        className="absolute left-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80"
        style={{ top: insets.top + 8 }}
      >
        <Ionicons name="arrow-back" size={22} color="white" />
      </Pressable>

      <Image
        source={{ uri: getImageUrl(image) }}
        style={{ width: "100%", height: 300 }}
        contentFit="cover"
      />
    </>
  );
}
