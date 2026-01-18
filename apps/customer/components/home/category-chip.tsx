import { Text } from "react-native";
import { Pressable } from "react-native";

import { ORPCClientOutputs } from "@/utils/orpc";

type Category = ORPCClientOutputs["categories"]["list"]["items"][number];

export function CategoryChip({
  category,
  isActive,
  onPress,
}: {
  category: Category | { id: "all"; name: string };
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-2 rounded-full px-5 py-2.5 ${
        isActive ? "bg-orange-500" : "border border-neutral-700 bg-neutral-900"
      }`}
    >
      <Text
        className={`font-medium ${
          isActive ? "text-white" : "text-neutral-300"
        }`}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}
