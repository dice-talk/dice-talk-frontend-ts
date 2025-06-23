import useChatNotificationStore from "@/zustand/stores/chatNotificationStore";
import { Dimensions, StyleSheet, View } from "react-native";
import FooterButton from "./FooterButton";

type FooterProps = {
    currentTab: string;
    onTabPress: (tabName: string) => void;
  };

export default function Footer({ currentTab, onTabPress }: FooterProps) {
  const { hasUnread } = useChatNotificationStore();
//   const segments = useSegments();
//   const currentTab = segments?.[segments.length - 1] ?? "home";
   const screenHeight = Dimensions.get("window").height; // ✅ 기기 높이
   const footerHeight = screenHeight * 0.1; // ✅ 높이의 10%

  return (
    <View style={[styles.footer, { height: footerHeight }]}>
      <FooterButton name="home" active={currentTab === "home"} onPress={() => onTabPress("home")} />
      <FooterButton name="history" active={currentTab === "history"} onPress={() => onTabPress("history")} />
      <FooterButton name="chat" active={currentTab === "chat"} onPress={() => onTabPress("chat")} hasNotification={hasUnread} />
      <FooterButton name="profile" active={currentTab === "profile"} onPress={() => onTabPress("profile")} />
      <FooterButton name="plus" active={currentTab === "plus"} onPress={() => onTabPress("plus")} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#ffffff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row", // ✅ 가로 정렬
    justifyContent: "space-around", // ✅ 아이콘 간격 균일
    alignItems: "center", // ✅ 수직 중앙 정렬
  },
});