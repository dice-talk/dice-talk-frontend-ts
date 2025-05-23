import ChatExit from "@/assets/images/chat/chatExit.svg";
import ChatNoticeOnOff from "@/assets/images/chat/chatNoticeOnOff.svg";
import Silence from "@/assets/images/chat/silence.svg";
import Siren from "@/assets/images/chat/siren.svg";
import ExitCostModal from "@/components/chat/ExitCostModal";
import CustomCostModal from "@/components/common/CustomCostModal";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

const ChatFooter = () => {
  const router = useRouter();
  const [isSilenced, setIsSilenced] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [costModalVisible, setCostModalVisible] = useState(false);

  const handleExitPress = () => {
    // 첫 번째 모달만 열기
    setExitModalVisible(true);
  };

  const handleExitCancel = () => {
    // 첫 번째 모달만 닫기
    setExitModalVisible(false);
  };

  const handleExitConfirm = () => {
    // 첫 번째 모달 닫고 두 번째 모달 열기
    setExitModalVisible(false);
    setCostModalVisible(true);
  };

  const handleCostConfirm = () => {
    // 두 번째 모달 닫고 채팅방 나가기
    setCostModalVisible(false);
    router.push("/chat");
  };

  const handleCostCancel = () => {
    // 두 번째 모달만 닫기
    setCostModalVisible(false);
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

      {/* 채팅방 나가기 확인 모달 */}
      <ExitCostModal
        visible={exitModalVisible}
        onClose={handleExitCancel}
        onConfirm={handleExitConfirm}
      />

      {/* 다이스 사용 모달 */}
      <CustomCostModal
        visible={costModalVisible}
        onClose={handleCostCancel}
        onConfirm={handleCostConfirm}
        // content="하루에 2번 이상 \n채팅방을 나가셨습니다."
        diceCount={7}
      />
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