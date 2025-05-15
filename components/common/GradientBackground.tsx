// src/components/Profile/GradientBackground.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function GradientBackground() {
  // 반원 높이는 전체 화면 높이의 약 35%로 설정
  const gradientHeight = height * 0.35;
  const gradientWidth = width * 1.2; // 너비는 화면보다 약간 넓게 설정 (반원 효과)

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(178, 142, 248, 0.55)", "rgba(244, 118, 229, 0.55)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { width: gradientWidth, height: gradientHeight }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 400, // 반원 효과
    borderBottomRightRadius: 400,
  },
});
