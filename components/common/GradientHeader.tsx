import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

type GradientHeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void; // 뒤로가기 버튼 커스텀 핸들러 추가
};

export default function GradientHeader({ title, showBackButton = true, onBackPress }: GradientHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress(); // 커스텀 핸들러가 있으면 실행
    } else {
      router.back(); // 없으면 기본 동작
    }
  };

  return (
        <LinearGradient
        colors={["rgba(178, 142, 248, 0.8)", "rgba(244, 118, 229, 0.8)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
        >
        {showBackButton ? (
          <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
              <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 40 }} />
        </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    width: width,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Pretendard",
    fontSize: 20,
    color: "#fff",
    letterSpacing: 0.5,
  },
});