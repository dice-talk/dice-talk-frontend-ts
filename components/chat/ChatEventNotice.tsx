// components/chat/ChatEventNotice.tsx
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const ChatEventNotice = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/chat/sidebarEvent01.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>다음 이벤트까지: 12:23:43</Text>
      </View>
      <View style={styles.bottomLine} />
    </View>
  );
};

export default ChatEventNotice;

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  image: {
    width: width * 0.2,
    height: height * 0.215,
    aspectRatio: 2,
    alignSelf: "center",
  },
  noticeBox: {
    width: width * 0.7,
    height: height * 0.05,
    backgroundColor: "#F3D4EE",
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
  },
  noticeText: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    backgroundColor: "#F3D4EE",
    marginTop: 7,
  },
});