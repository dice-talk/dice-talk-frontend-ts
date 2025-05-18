import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";

// 🔹 GradientButton Props 타입 지정
type GradientButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function MediumButton({
  title,
  onPress,
}: GradientButtonProps) {
  const screenWidth = Dimensions.get("window").width;
  const buttonWidth = screenWidth * 0.79; // ✅ 화면의 85% 너비
  const buttonHeight = 48; // ✅ 적당한 높이 (사용자가 깔끔하다고 느끼는 크기)

  return (
    <Pressable onPress={onPress} style={[styles.buttonWrapper, { width: buttonWidth, height: buttonHeight }]}> 
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, { width: buttonWidth, height: buttonHeight }]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: "center", // ✅ 중앙 정렬
    marginTop: 24, // ✅ 간격 조정
  },
  button: {
    borderRadius: 24, // ✅ 둥근 모서리
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Pretendard-Bold",
    fontSize: 16, // ✅ 적당한 텍스트 크기
  },
});
