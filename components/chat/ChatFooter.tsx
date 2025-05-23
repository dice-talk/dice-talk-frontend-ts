import ChatExit from "@/assets/images/chat/chatExit.svg";
import ChatNoticeOnOff from "@/assets/images/chat/chatNoticeOnOff.svg";
import Silence from "@/assets/images/chat/silence.svg";
import Siren from "@/assets/images/chat/siren.svg";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

const ChatFooter = () => {
  const router = useRouter();
  const [isSilenced, setIsSilenced] = useState(false);

  const handleExitPress = () => {
    router.push("/chat");
  };

  const toggleSilence = () => {
    setIsSilenced(!isSilenced);
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Pressable 
          style={styles.leftContainer} 
          onPress={handleExitPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChatExit />
        </Pressable>
        <View style={styles.rightContainer}>
          <Pressable 
            onPress={toggleSilence}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSilenced ? <Silence /> : <ChatNoticeOnOff />}
          </Pressable>
          <Siren />
        </View>
      </View>
    </View>
  );
};

export default ChatFooter;

const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flexDirection: "column", // 명시적으로 세로 방향 설정
    alignItems: "center",    
    width: width * 0.8,
    
  },
  subContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width * 0.8,
    paddingHorizontal: 20,
  },
  leftContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5, // 터치 영역 확장
    // marginTop: -height * 0.03, // SVG를 위로 살짝 올림
  },
  rightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: width * 0.05,
    // marginTop: -height * 0.03, // 양쪽 다 올릴 경우
  }
});