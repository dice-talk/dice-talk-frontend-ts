import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

// 🔹 GradientButton Props 타입 (height, width, fontSize, size를 optional로 변경)
interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  customStyle?: StyleProp<ViewStyle>;
  height?: number;
  width?: number;
  fontSize?: number;
  size?: 'max' | 'custom';
}

export default function MediumButton(props: GradientButtonProps) {
  const { title, onPress, customStyle, height, width, fontSize, size } = props;
  const screenWidth = Dimensions.get("window").width;

  // 기본값 정의
  const defaultHeight = 48;
  const defaultWidth = screenWidth * 0.85;
  const defaultFontSize = 16;

  let finalHeight: number;
  let finalWidth: number;
  let finalFontSize: number;

  if (size === 'max') {
    // size가 'max'로 명시되면 항상 기본 크기 사용
    finalHeight = defaultHeight;
    finalWidth = defaultWidth;
    finalFontSize = defaultFontSize;
  } else if (size === 'custom') {
    // size가 'custom'이면 제공된 값 우선, 없으면 기본값
    finalHeight = height ?? defaultHeight;
    finalWidth = width ?? defaultWidth;
    finalFontSize = fontSize ?? defaultFontSize;
  } else {
    // size prop이 제공되지 않은 경우 (undefined)
    // height, width, fontSize가 제공되면 해당 값 사용, 아니면 기본값 사용
    finalHeight = height ?? defaultHeight;
    finalWidth = width ?? defaultWidth;
    finalFontSize = fontSize ?? defaultFontSize;
  }

  return (
    <Pressable 
      onPress={onPress} 
      style={[styles.buttonWrapper, { width: finalWidth, height: finalHeight }, customStyle]}
    > 
      <LinearGradient
        colors={["#B28EF8", "#F476E5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, { width: '100%', height: '100%' }]}
      >
        <Text style={[styles.buttonText, { fontSize: finalFontSize }]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: "center",
    marginTop: 24, 
  },
  button: {
    borderRadius: 24, 
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Pretendard-Bold",
  },
});
