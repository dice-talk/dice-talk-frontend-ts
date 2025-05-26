import { useRouter } from "expo-router";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

// 👉 아이콘은 SVG 또는 PNG로 대체 가능
import BackIcon from "@/assets/images/chat/backArrow.svg";
import MenuIcon from "@/assets/images/chat/sideBarButton.svg";

interface ChatHeaderProps {
  title: string;
  onToggleSidebar?: () => void;
  fontColor?: string;
  backgroundColor?: string;
  themeId?: number;
}

export default function ChatHeader({
  title,
  onToggleSidebar,
  fontColor = "#A45C73",             // 기본값
  backgroundColor = "#ffffff",      // 기본값
  themeId = 1,
}: ChatHeaderProps) {
  const router = useRouter();
  const backIconColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  
  // 테마에 따른 제목과 색상 설정
  const displayTitle = themeId === 2 ? "다이스 프렌즈" : title;
  const displayFontColor = themeId === 2 ? "#5C5279" : fontColor;
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Pressable onPress={() => router.back()}>
        <BackIcon width={28} height={28} color={backIconColor} />
      </Pressable>
      <Text style={[styles.title, { color: displayFontColor }]}>{displayTitle}</Text>
      <Pressable onPress={onToggleSidebar}>
        <MenuIcon width={28} height={28} color={backIconColor} />
      </Pressable>
    </View>
  );
}
const { height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    height: height * 0.07,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ffffff", // 필요시 이 부분도 props로 받을 수 있음
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
});