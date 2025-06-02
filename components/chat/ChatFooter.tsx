import ChatExit from "@/assets/images/chat/chatExit.svg";
import ChatNoticeOnOff from "@/assets/images/chat/chatNoticeOnOff.svg";
import Silence from "@/assets/images/chat/silence.svg";
import Siren from "@/assets/images/chat/siren.svg";
import ExitCostModal from "@/components/chat/ExitCostModal";
import CustomCostModal from "@/components/common/CustomCostModal";
import useChatRoomStore from "@/zustand/stores/ChatRoomStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

interface ChatFooterProps {
  onClose?: () => void;
}

const ChatFooter: React.FC<ChatFooterProps> = ({ onClose }) => {
  const chatRoomId = useChatRoomStore((state) => state.chatRoomId);
  const themeId = useChatRoomStore((state) => state.themeId) || 1;
  const router = useRouter();

  const iconColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = themeId === 2 ? "#6DA0E1" : "#D9B2D3";
  const textColor = themeId === 2 ? "#5C5279" : "#8A5A7A";
  
  const [isSilenced, setIsSilenced] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [costModalVisible, setCostModalVisible] = useState(false);

  const handleExitPress = () => {
    setExitModalVisible(true);
  };

  const handleExitCancel = () => {
    setExitModalVisible(false);
  };

  const handleExitConfirm = () => {
    setExitModalVisible(false);
    setCostModalVisible(true);
  };

  const handleCostConfirm = () => {
    setCostModalVisible(false);
    router.push("/(tabs)/chat");
  };

  const handleCostCancel = () => {
    setCostModalVisible(false);
  };

  const toggleSilence = () => {
    setIsSilenced(!isSilenced);
  };

  const handleSirenPress = () => {
    if (onClose) {
      onClose();
    }
    if (chatRoomId) {
      router.push({
        pathname: "/chat/report/[id]",
        params: { id: chatRoomId.toString() },
      });
    } else {
      console.warn("ChatRoom ID not found, cannot navigate to report page.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Pressable 
          style={styles.leftContainer} 
          onPress={handleExitPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
      <ChatExit color={iconColor} />
        </Pressable>
        <View style={styles.rightContainer}>
          <Pressable 
            onPress={toggleSilence}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSilenced ? <Silence color={iconColor} /> : <ChatNoticeOnOff color={iconColor} />}
          </Pressable>
          <Pressable 
            onPress={handleSirenPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Siren color={iconColor} />
          </Pressable>
        </View>
      </View>

      {/* 채팅방 나가기 확인 모달 */}
      <ExitCostModal
        visible={exitModalVisible}
        onClose={handleExitCancel}
        onConfirm={handleExitConfirm}
        confirmButtonColor={confirmButtonColor}
        textColor={textColor}
        // themeId={themeId} // 임시 주석 처리 (ExitCostModalProps에 themeId 추가 필요)
      />

      {/* 다이스 사용 모달 */}
      <CustomCostModal
        visible={costModalVisible}
        onClose={handleCostCancel}
        onConfirm={handleCostConfirm}
        diceCount={7}
        textColor={textColor}
        diceButtonColor={confirmButtonColor}
        cancelButtonColor={confirmButtonColor}
        // themeId={themeId} // 임시 주석 처리 (CustomCostModalProps에 themeId 추가 필요)
      />
    </View>
  );
};

export default ChatFooter;

const { height, width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
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
    padding: 5,
    marginTop: -height * 0.025,
  },
  rightContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: width * 0.05,
    marginTop: -height * 0.025,
  }
});