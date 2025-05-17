import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

type GradientHeaderProps = {
  title: string;
};

export default function GradientHeader({ title }: GradientHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
        <LinearGradient
        colors={["rgba(178, 142, 248, 0.8)", "rgba(244, 118, 229, 0.8)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
        >
        <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        {/* 오른쪽에 공간 확보용 View (정렬용) */}
        <View style={{ width: 28 }} />
        </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    width: width,
    height: 56,
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
    fontFamily: "Pretendard-Bold",
    fontSize: 20,
    color: "#fff",
    letterSpacing: 0.5,
  },
});