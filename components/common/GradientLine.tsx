// src/components/Profile/GradientSeparator.tsx
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

export default function GradientLine() {
  return (
    <LinearGradient
      colors={["#B28EF8", "#F476E5"]}
      style={styles.separator}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
    marginVertical: 12,
  },
});
