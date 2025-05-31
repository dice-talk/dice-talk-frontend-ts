// src/components/Profile/GradientBackground.tsx
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native";

const { width, height } = Dimensions.get("window");

// props 타입에 style 추가
interface GradientBackgroundProps {
  children?: ReactNode;
  style?: ViewStyle; // ViewStyle을 사용
}

export default function GradientBackground({ children, style }: GradientBackgroundProps) {
  // 비율 기반으로 높이, 위치, 곡률 계산
  const gradientHeight = height * 0.4; // 38% (이미지 참고)
  const gradientWidth = width * 1;
  const borderRadius = width * 0.1; // 곡률도 비율로

  return (
    // 전달받은 style을 루트 View에 적용 (기존 styles.container와 병합)
    <View style={[styles.container, style]}>
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
    // position: "absolute", // 제거!
    // top: 0,               // 제거!
    // left: 0,              // 제거!
    // right: 0,             // 제거!
    alignItems: "center",
    // zIndex: 0,              // 제거!
    width: "100%", // 부모 컨테이너의 너비를 채우도록 변경 (기존엔 left,right=0 이었음)
  },
});
