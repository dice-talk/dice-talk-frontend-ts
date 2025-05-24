import CountdownTimer from "@/components/common/CountdownTimer";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface ChatEventNoticeProps {
  icon?: React.FC<SvgProps>;
  title?: string;
  initialHours?: number;
  initialMinutes?: number;
  noticeText?: string;
  backgroundColor?: string;
}

const ChatEventNotice = ({
  icon: Icon,
  title = "큐피드의 짝대기",
  initialHours = 12,
  initialMinutes = 45,
  noticeText = "다음 이벤트까지",
  backgroundColor = "#F3D4EE"
}: ChatEventNoticeProps) => {
  // 시간을 초로 변환 (초기값)
  const initialSeconds = initialHours * 60 * 60 + initialMinutes * 60;
  
  // 시간 형식을 00:00:00 형태로 변환
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  // 현재 시간에서 초기 시간을 뺀 값을 초기값으로 설정
  const [remainingTime, setRemainingTime] = useState(initialSeconds);

  useEffect(() => {
    // 초기값 설정
    setRemainingTime(initialSeconds);
    
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          // 타이머가 끝나면 다시 초기값으로 리셋
          return initialSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [initialSeconds]);

  // 남은 시간 계산
  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {Icon ? (
          <View style={styles.svgContainer}>
            <Icon width="100%" height="100%" />
          </View>
        ) : (
          <Image
            source={require("@/assets/images/chat/sidebarEvent01.png")}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.overlay} />
        <View style={styles.timerContainer}>
          <Text style={styles.title}>{title}</Text>
          <CountdownTimer 
            initialSeconds={remainingTime}
            fontSize={28}
            color="#ffffff"
          />
        </View>
      </View>
      <View style={[styles.noticeBox, { backgroundColor }]}>
        <Text style={styles.noticeText}>
          {noticeText}: {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </Text>
      </View>
      <View style={[styles.bottomLine, { backgroundColor }]} />
    </View>
  );
};

export default ChatEventNotice;

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.215,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60, 60, 60, 0.7)', // 어두운 회색 반투명 오버레이
  },
  timerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  noticeBox: {
    width: width * 0.7,
    height: height * 0.05,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: "center",
  },
  noticeText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    marginTop: height * 0.015,
  },
});