import { Stack } from "expo-router";

export default function DrawerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="food/[slug]"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="order/[id]"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="addresses"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="address-form"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
