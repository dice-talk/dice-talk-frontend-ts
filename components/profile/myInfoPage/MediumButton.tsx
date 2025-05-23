import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

// 🔹 GradientButton Props 타입 지정
type GradientButtonProps = {
  title: string;
  height : number,
  width : number,
  fontSize : number,
  size: 'max' | 'custom',
  onPress?: () => void;
  customStyle?: StyleProp<ViewStyle>;
};

export default function MediumButton({
  title,
  height,
  width,
  fontSize,
  size,
  onPress,
  customStyle,
}: GradientButtonProps) {
  // const screenWidth = Dimensions.get("window").width;
  // const buttonWidth = screenWidth * 0.79; // ✅ 화면의 85% 너비
  // const buttonHeight = 48; // ✅ 적당한 높이 (사용자가 깔끔하다고 느끼는 크기)

  const screenWidth = Dimensions.get("window").width;

  // size가 'max'일 경우 기본값 적용
  const buttonWidth = size === 'max' ? screenWidth * 0.85 : width;
  const buttonHeight = size === 'max' ? height * 0.06 : height;
  const buttonFontSize = size === 'max' ? 16 : fontSize;

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.buttonWrapper, { width: buttonWidth, height: buttonHeight }, customStyle]}
    > 
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, { width: '100%', height: '100%' }]}
      >
        <Text style={[styles.buttonText, { fontSize: buttonFontSize }]}>{title}</Text>
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
  },
});
