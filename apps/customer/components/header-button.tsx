import FontAwesome from "@expo/vector-icons/FontAwesome";
import { forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export const HeaderButton = forwardRef<View, { onPress?: () => void }>(
  ({ onPress }, ref) => {
    const theme = {
      background: "#0a0a0a",
      card: "#0a0a0a",
      border: "#262626",
      primary: "#f97316",
      text: "#fafafa",
      notification: "#ef4444",
    };

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: pressed ? theme.background : theme.card,
          },
        ]}
      >
        {({ pressed }) => (
          <FontAwesome
            name="info-circle"
            size={20}
            color={theme.text}
            style={{
              opacity: pressed ? 0.7 : 1,
            }}
          />
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
});
