import { Text, View, StyleSheet } from "react-native";

import { Container } from "@/components/container";

export default function Modal() {
  return (
    <Container>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: "#fafafa" }]}>Modal</Text>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
