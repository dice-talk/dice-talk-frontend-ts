// src/components/Profile/GradientSeparator.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
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
    width: width * 0.9,             
    marginVertical: 12,
    alignSelf: 'center',     
    borderRadius: 1,
  }
});
