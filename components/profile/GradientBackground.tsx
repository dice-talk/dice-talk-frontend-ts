// src/components/Profile/GradientBackground.tsx
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

export default function GradientBackground({ children }: { children?: ReactNode }) {
  // 비율 기반으로 높이, 위치, 곡률 계산
  const gradientHeight = height * 0.4; // 38% (이미지 참고)
  const gradientWidth = width * 1;
  const borderRadius = width * 0.1; // 곡률도 비율로

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(178, 142, 248, 0.55)", "rgba(244, 118, 229, 0.55)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: gradientWidth,
          height: gradientHeight,
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View>{children}</View>
      </LinearGradient>
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
    zIndex: 0,
  },
});
