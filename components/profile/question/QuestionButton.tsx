// src/components/profile/question/QuestionButton.tsx
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type ButtonType = "수정" | "삭제" | "확인" | "취소";

interface QuestionButtonProps {
  title: ButtonType;
  onPress: () => void;
  style?: ViewStyle;
}

export default function QuestionButton({
  title,
  onPress,
  style,
}: QuestionButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.buttonWrapper, style]}>
      <LinearGradient
        colors={["rgba(178, 142, 248, 0.4)", "rgba(244, 118, 229, 0.4)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    borderColor: "#B28EF8",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientButton: {
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
    height: 32,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: "#4B5563",
  },
});
