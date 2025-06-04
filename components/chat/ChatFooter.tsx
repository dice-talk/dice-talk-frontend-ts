import ChatExit from "@/assets/images/chat/chatExit.svg";
import ChatNoticeOnOff from "@/assets/images/chat/chatNoticeOnOff.svg";
import Silence from "@/assets/images/chat/silence.svg";
import Siren from "@/assets/images/chat/siren.svg";
import ExitCostModal from "@/components/chat/ExitCostModal";
import { getItemDetails } from "@/api/ItemApi"; // getItemDetails 임포트
import CustomCostModal from "@/components/common/CustomCostModal";

import { deleteChatRoomMember } from "@/api/ChatApi"; // API 함수 임포트
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import useAuthStore from "@/zustand/stores/authStore"; // 사용자 ID 가져오기
import useChatRoomStore from "@/zustand/stores/ChatRoomStore"; // 채팅방 ID 가져오기

import { useRouter } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

interface ChatFooterProps {
  onClose?: () => void;
}

const ChatFooter: React.FC<ChatFooterProps> = ({ onClose }) => {
  const chatRoomId = useChatRoomStore((state) => state.chatRoomId);
  const curThemeId = useHomeStore((state) => state.curThemeId);
  const router = useRouter();

  const iconColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = curThemeId === 2 ? "#6DA0E1" : "#D9B2D3";
  const textColor = curThemeId === 2 ? "#5C5279" : "#8A5A7A";
  
  const [isSilenced, setIsSilenced] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [costModalVisible, setCostModalVisible] = useState(false);
  // CustomCostModal에 전달할 상태 추가
  const [modalDiceCount, setModalDiceCount] = useState(7); // 기본값
  const [modalContent, setModalContent] = useState("하루에 2번 이상 \n채팅방을 나가셨습니다."); // 기본값


  const currentMemberId = useAuthStore((state) => state.memberId);
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId);

  useEffect(() => {
    if (costModalVisible) {
      const fetchItemCostDetails = async () => {
        // TODO: 실제 사용할 itemId를 결정하는 로직 필요. 여기서는 예시로 1을 사용합니다.
        const itemIdForCost = 1; 
        const itemDetails = await getItemDetails(itemIdForCost);
        if (itemDetails) {
          setModalDiceCount(itemDetails.price);
          setModalContent(itemDetails.description || "아이템을 사용하시겠습니까?"); // description이 없을 경우 기본값
        } else {
          // API 호출 실패 또는 데이터가 없을 경우 기본값 유지 또는 에러 처리
          console.warn(`아이템(ID: ${itemIdForCost}) 정보를 가져오지 못했습니다. CustomCostModal 기본값을 사용합니다.`);
        }
      };
      fetchItemCostDetails();
    }
  }, [costModalVisible]);

  const handleExitPress = useCallback(async () => {
    if (!currentChatRoomId || !currentMemberId) {
      console.error("ChatFooter: ChatRoom ID 또는 Member ID를 가져올 수 없습니다.");
      // 이 경우에도 모달을 띄우기 전에 사용자에게 알릴 수 있지만,
      // 우선 ExitCostModal을 띄우고, 확인 시점에 ID가 없으면 다시 한번 체크합니다.
      // 또는 여기서 바로 alert를 띄우고 return 할 수도 있습니다.
      // alert("채팅방 정보를 가져올 수 없어 나갈 수 없습니다.");
      // return;
    }
    // API 호출 없이 바로 ExitCostModal을 띄웁니다.

    setExitModalVisible(true);
  }, [currentChatRoomId, currentMemberId, setExitModalVisible]);

  const handleExitCancel = () => {
    setExitModalVisible(false);
  };


  const handleExitConfirm = useCallback(async () => {
    console.log("[DEBUG] handleExitConfirm: 함수 시작"); // <-- 추가된 로그 1
    setExitModalVisible(false); // ExitCostModal 닫기

    if (!currentChatRoomId || !currentMemberId) {
      console.error("ChatFooter (handleExitConfirm): ChatRoom ID 또는 Member ID를 가져올 수 없습니다.");
      console.log(`[DEBUG] currentChatRoomId: ${currentChatRoomId}, currentMemberId: ${currentMemberId}`); // <-- 추가된 로그 2
      alert("채팅방 정보를 가져올 수 없어 나갈 수 없습니다.");
      return;
    }

    console.log(`[DEBUG] handleExitConfirm: API 호출 직전. ChatRoomID: ${currentChatRoomId}, MemberID: ${currentMemberId}`); // <-- 추가된 로그 3

    try {
      const statusCode = await deleteChatRoomMember(currentChatRoomId, currentMemberId);
      console.log("[DEBUG] handleExitConfirm: API 호출 완료"); // <-- 추가된 로그 4
      console.log("ChatFooter - deleteChatRoomMember API 응답 코드:", statusCode); // <--- 응답 코드 확인용 로그
      if (statusCode === 409) {
        // 409 Conflict: 비용 발생 가능성으로 CustomCostModal 표시
        setCostModalVisible(true);
      } else if (statusCode >= 200 && statusCode < 300) {
        console.log('나가기 성공!!')
        // 성공적으로 나감 (2xx 응답)
        router.push("/chat");
      } else {
        // 기타 HTTP 오류 (409도 아니고 2xx도 아닌 경우)
        console.error(`ChatFooter: 채팅방 나가기 실패 - 상태 코드 ${statusCode}`);
        alert(`채팅방을 나가는 중 오류가 발생했습니다. (코드: ${statusCode})`);
      }
    } catch (error) {
      console.log("[DEBUG] handleExitConfirm: API 호출 중 catch 블록 실행"); // <-- 추가된 로그 5
      console.error("ChatFooter: deleteChatRoomMember API 호출 중 에러:", error);
      alert("채팅방을 나가는 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  }, [currentChatRoomId, currentMemberId, router, setCostModalVisible]);


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
        pathname: "/chat/report/[id]" as any,
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
        // themeId={themeId} // 임시 주석 처리 (ExitCostModalProps에 themeId 추가 필요)
      />

      {/* 다이스 사용 모달 */}
      <CustomCostModal
        visible={costModalVisible}
        onClose={handleCostCancel}
        onConfirm={handleCostConfirm}
        content={modalContent} // API에서 가져온 content로 변경
        diceCount={modalDiceCount} // API에서 가져온 price로 변경
        textColor={textColor}
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