// components/chat/ChatEventNotice.tsx
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const ChatEventNotice = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // 12시간을 초로 변환
    let totalSeconds = 12 * 60 * 60;
    
    const timer = setInterval(() => {
      if (totalSeconds <= 0) {
        // 타이머가 끝나면 다시 12시간으로 리셋
        totalSeconds = 12 * 60 * 60;
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setTimeLeft({ hours, minutes, seconds });
      totalSeconds -= 1;
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 시간 형식을 00:00:00 형태로 변환
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/chat/sidebarEvent01.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.noticeBox}>
        <Text style={styles.noticeText}>
          다음 이벤트까지: {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
        </Text>
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
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    backgroundColor: "#F3D4EE",
    marginTop: height * 0.015,
  },
});