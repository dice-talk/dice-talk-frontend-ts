// 컬러 SVG import
import { sendRoomEvent } from "@/api/EventApi"; // sendRoomEvent 임포트
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg"; // 이미 존재
import HanaSvg from "@/assets/images/dice/hana.svg";
import NemoSvg from "@/assets/images/dice/nemo.svg";
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import FriendLetterForm from "@/assets/images/event/friend_letterForm.svg";
import LetterForm from "@/assets/images/event/LetterForm.svg";
import CustomCostModal from "@/components/common/CustomCostModal"; // CustomCostModal 임포트
import InsufficientItemModal from "@/components/common/DiceRechargeModal"; // InsufficientItemModal 임포트
import ToastMessage from "@/components/common/ToastMessage"; // 이미 존재
import useArrowEventStore from "@/zustand/stores/ArrowEventStore"; // ArrowEventStore 임포트
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore 임포트
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 및 ChatParticipant 임포트
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import { EventMessageData } from "@/zustand/stores/SecretMessageStore"; // EventMessageData 타입 임포트
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore"; // SharedProfileStore 임포트
import { useMemo, useState } from "react";
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface LoveArrowProps {
  visible: boolean;
  onClose: () => void;
  remainingCount: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CharacterInfo {
  name: string;
  ColoredSvgComponent: React.FC<SvgProps>;
}

// 모든 캐릭터 옵션을 미리 정의 (닉네임과 SVG 매핑용)
const ALL_CHARACTERS_MAP: Record<string, React.FC<SvgProps>> = {
  "한가로운 하나": HanaSvg,
  "세침한 세찌": SezziSvg,
  "단호한데 다정한 다오": DaoSvg,
  "두 얼굴의 매력 두리": DoriSvg,
  "네모지만 부드러운 네몽": NemoSvg,
  "육감적인 직감파 육댕": YukdaengSvg, // '육댕'이 아닌 '육땡'으로 가정 (다른 파일들과 일관성)
};

const FEMALE_CHARACTERS_DEFAULT: CharacterInfo[] = [
  { name: "한가로운 하나", ColoredSvgComponent: HanaSvg },
  { name: "세침한 세찌", ColoredSvgComponent: SezziSvg },
  { name: "단호한데 다정한 다오", ColoredSvgComponent: DaoSvg },
];
const MALE_CHARACTERS_DEFAULT: CharacterInfo[] = [
  { name: "두 얼굴의 매력 두리", ColoredSvgComponent: DoriSvg },
  { name: "네모지만 부드러운 네몽", ColoredSvgComponent: NemoSvg },
  { name: "육감적인 직감파 육땡", ColoredSvgComponent: YukdaengSvg }, // '육댕'이 아닌 '육땡'으로 가정
];

// LoveLetterSelect.tsx와 동일한 트리거 닉네임 목록
const TRIGGER_NICKNAMES = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];

const LoveArrow: React.FC<LoveArrowProps> = ({ visible, onClose }) => {
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showCustomCostModal, setShowCustomCostModal] = useState(false);
  const [showInsufficientItemModal, setShowInsufficientItemModal] = useState(false);
  // 스토어 훅 사용
  const chatParts = useChatRoomStore((state) => state.chatParts);
  const currentAuthMemberId = useAuthStore((state) => state.memberId);
  const setArrowEventDetails = useArrowEventStore((state) => state.setArrowEventDetails);
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId);
  const roomEvents = useChatRoomStore((state) => state.roomEvents);
  const curThemeId = useHomeStore((state) => state.curThemeId); // HomeStore에서 curThemeId 가져오기
  const currentUserNickname = useSharedProfileStore((state) => state.nickname); // 현재 사용자 닉네임

  const unselectedColor = "#FFFFFF";

  const selectedColor = useMemo(() => {
    if (curThemeId === 2) {
      return "#9FC9FF"; // 친구 테마일 경우 통일된 색상
    }
    // 현재 사용자가 TRIGGER_NICKNAMES (여성 캐릭터 그룹)에 포함되면,
    // 상대방은 MALE_CHARACTERS_DEFAULT (남성 캐릭터 그룹)가 되므로, 남성 캐릭터 그룹 색상 사용
    if (currentUserNickname && TRIGGER_NICKNAMES.includes(currentUserNickname)) {
      return "#FEBFC8"; // 남성 캐릭터 그룹(테마1)에 대한 선택 색상을 #FEBFC8로 변경
    }
    // 그렇지 않으면 상대방은 FEMALE_CHARACTERS_DEFAULT (여성 캐릭터 그룹), 여성 캐릭터 그룹 색상 사용
    return "#9FC9FF"; // 여성 캐릭터 그룹에 대한 선택 색상
  }, [curThemeId, currentUserNickname]);
  // 테마별 UI 색상 설정
  const titleColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = curThemeId === 2 ? "#9FC9FF" : "#FEBFC8";
  const confirmButtonBorderColor = curThemeId === 2 ? "#9FC9FF" : "#FFD9DF";

  const characters: CharacterInfo[] = useMemo(() => {
    if (curThemeId === 2) {
      if (!chatParts || chatParts.length === 0 || !currentAuthMemberId) {
        return [];
      }
      return chatParts
        .filter(participant => participant.memberId !== currentAuthMemberId)
        .map(participant => {
          const SvgComponent = ALL_CHARACTERS_MAP[participant.nickname];
          return SvgComponent 
            ? { name: participant.nickname, ColoredSvgComponent: SvgComponent }
            : null;
        })
        .filter(Boolean) as CharacterInfo[]; // null 값 제거 및 타입 단언
    } else {
      // curThemeId가 2가 아닐 경우, 현재 사용자 닉네임에 따라 상대방 캐릭터 목록 결정
      if (currentUserNickname && TRIGGER_NICKNAMES.includes(currentUserNickname)) {
        return MALE_CHARACTERS_DEFAULT;
      }
      return FEMALE_CHARACTERS_DEFAULT;
    }
  }, [curThemeId, chatParts, currentAuthMemberId, currentUserNickname]);

  const handleSelectCharacter = (index: number) => {
    setSelectedCharacterIndex(index === selectedCharacterIndex ? null : index);
  };

  const handleConfirm = async () => { // async로 변경
    if (selectedCharacterIndex !== null) {
      // ChatRoomStore의 roomEvents에서 사용자가 이미 PICK 이벤트를 보냈는지 확인
      if (currentAuthMemberId && currentChatRoomId) {
        const userAlreadyPicked = roomEvents.some(
          event => event.senderId === currentAuthMemberId && event.roomEventType === "PICK" // roomEventType이 "PICK"인 이벤트 확인
        );

        if (userAlreadyPicked) {
          console.log("이미 PICK 이벤트를 보냈습니다. CustomCostModal을 표시합니다.");
          setShowCustomCostModal(true); // 내부 상태를 통해 CustomCostModal 표시
          return; // 이후 로직 실행 중단
        }
      }

      // 기존 선택 로직
      const selectedCharacter = characters[selectedCharacterIndex];
      const targetParticipant = chatParts.find(
        (participant: ChatParticipant) => participant.nickname === selectedCharacter.name
      );

      if (targetParticipant && targetParticipant.memberId && currentAuthMemberId && currentChatRoomId) {
        // API로 전송할 데이터 객체 (EventMessageData 타입)
        const eventDetailsForApi: EventMessageData = {
          receiverId: targetParticipant.memberId,
          senderId: currentAuthMemberId,
          chatRoomId: currentChatRoomId,
          eventId: 2, // 요청하신대로 하드코딩
          roomEventType: "PICK", // 요청하신대로 하드코딩
          message: null, // message 필드를 null로 설정
        };

        // ArrowEventStore 업데이트 (message 필드는 ArrowEventStore의 상태에 없으므로 제외하고 전달)
        setArrowEventDetails({
          receiverId: eventDetailsForApi.receiverId,
          senderId: eventDetailsForApi.senderId,
          chatRoomId: eventDetailsForApi.chatRoomId,
          eventId: eventDetailsForApi.eventId,
          roomEventType: eventDetailsForApi.roomEventType,
        });
        console.log(`ArrowEventStore 업데이트: receiverId=${eventDetailsForApi.receiverId}, senderId=${eventDetailsForApi.senderId}, chatRoomId=${eventDetailsForApi.chatRoomId}, eventId=${eventDetailsForApi.eventId}, roomEventType=${eventDetailsForApi.roomEventType}`);
        
        try {
          await sendRoomEvent(eventDetailsForApi); // 수정된 sendRoomEvent 호출하여 API로 데이터 전송
          console.log("LoveArrow 이벤트 전송 성공");
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
            onClose();
          }, 1500);
        } catch (error) {
          console.error("LoveArrow 이벤트 전송 실패:", error);
          // 사용자에게 오류 알림 (예: 다른 Toast 메시지)
          onClose(); // 오류 발생 시에도 모달은 닫음
        }
      } else {
        console.warn(
          `선택된 캐릭터(${selectedCharacter.name})의 정보를 찾을 수 없거나, 현재 사용자 ID 또는 채팅방 ID가 없습니다.`
        );
        // 사용자에게 오류 알림 (예: Toast 메시지)
        onClose(); // 오류 발생 시에도 모달은 닫음
      }
    } else {
      // 선택된 캐릭터가 없을 경우
      console.log("선택된 캐릭터가 없습니다.");
      onClose();
    }
  };

  // CustomCostModal 핸들러
  const handleCustomCostConfirm = () => {
    setShowCustomCostModal(false);
    setShowInsufficientItemModal(true); // 아이템 부족 모달 표시
  };

  const handleCustomCostCancel = () => {
    setShowCustomCostModal(false);
  };

  // InsufficientItemModal 핸들러
  const handleGoToStore = () => {
    setShowInsufficientItemModal(false);
    // TODO: 상점 페이지로 이동하는 로직 추가
    console.log('상점으로 이동');
  };

  const handleInsufficientItemCancel = () => {
    setShowInsufficientItemModal(false);
  };
  const width = SCREEN_WIDTH * 0.95;
  const height = SCREEN_WIDTH * 0.95;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* LoveArrow 모달 내용 */}
      {!showCustomCostModal && !showInsufficientItemModal && (
        <View style={styles.modalOverlay}>
          <Image 
            source={require('@/assets/images/event/heartBoardBase.png')}
            resizeMode={curThemeId !== 2 ? "contain" : "stretch"}
            style={curThemeId !== 2 ? styles.heartboardImage : styles.friendBoardImage}
          />
          <Text style={[curThemeId !== 2 ? styles.title : styles.titleFriends, { color: titleColor }]}>좀 더 대화하고 싶은 상대를 선택해주세요</Text>
            {curThemeId === 2 ? (
              <FriendLetterForm width={width * 0.5} height={height * 0.25} style={{position: 'absolute', top: SCREEN_HEIGHT * 0.35, zIndex: 3}} />
            ) : (
              <LetterForm width={width * 0.45} height={height * 0.25} style={{position: 'absolute', top: SCREEN_HEIGHT * 0.375, zIndex: 3}} />
            )}
          <View style={styles.charactersWrapper}>
            <View style={styles.charactersContainer}>
              {characters.map((character, index) => {
                const isSelected = selectedCharacterIndex === index;
                const SvgComponent = character.ColoredSvgComponent; // themeId prop 제거
                const svgColor = isSelected ? selectedColor : unselectedColor;
                return (
                  <TouchableOpacity
                    key={index}
                    style={curThemeId !==2 ? styles.characterItem : styles.characterItemFreinds}
                    onPress={() => handleSelectCharacter(index)}
                  >
                    <SvgComponent 
                      width={35} 
                      height={35} 
                      style={styles.characterIcon} 
                      color={svgColor}
                    />
                    <Text style={styles.characterName}>{character.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={curThemeId !== 2 ? styles.remainingCountRow : styles.remainingCountRowFriends}>
              <Text style={styles.remainingCount}>첫번째 선택은 무료입니다. 신중한 선택을 해주세요</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              curThemeId !== 2 ? styles.confirmButton : styles.confirmButtonFreinds,
              { backgroundColor: confirmButtonColor, borderColor: confirmButtonBorderColor }, // themeId prop 제거
              selectedCharacterIndex === null && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={selectedCharacterIndex === null}
          >
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
          <ToastMessage message="선택이 완료되었습니다" visible={showToast} />
        </View>
      )}
      {/* CustomCostModal (LoveArrow 모달 위에 표시될 수 있도록 조건부 렌더링) */}
      <CustomCostModal
        visible={showCustomCostModal}
        onClose={handleCustomCostCancel}
        onConfirm={handleCustomCostConfirm}
        content="이벤트 수정은 아이템이 필요합니다"
        diceCount={5}
        textColor={curThemeId === 2 ? "#5C5279" : "#8A5A7A"}
        diceButtonColor={curThemeId === 2 ? "#9FC9FF" : "#D9B2D3"}
        cancelButtonColor={curThemeId === 2 ? "#B8B8B8" : "#A8A3C8"}
      />
      {/* InsufficientItemModal (LoveArrow 모달 위에 표시될 수 있도록 조건부 렌더링) */}
      <InsufficientItemModal
        visible={showInsufficientItemModal}
        onClose={handleInsufficientItemCancel}
        onGoToStore={handleGoToStore}
        textColor={curThemeId === 2 ? "#5C5279" : "#8A5A7A"}
        storeButtonColor={curThemeId === 2 ? "#9FC9FF" : "#D9B2D3"}
        cancelButtonColor={curThemeId === 2 ? "#B8B8B8" : "#A8A3C8"}
      />
    </Modal>
  );
};

export default LoveArrow;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "relative",
  },
  title: {
    fontSize: 12,
    fontWeight: "light",
    textAlign: "center",
    zIndex: 2,
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.44,
  },
  titleFriends: {
    fontSize: 12,
    fontWeight: "light",
    textAlign: "center",
    zIndex: 2,
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.42,
  },
  heartboardImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    marginBottom: -20,
  },
  charactersWrapper: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.47,
    zIndex: 3,
    alignItems: 'center',
    width: '100%',
  },
  charactersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SCREEN_WIDTH * 0.85,
    flexWrap: "nowrap", // prevent wrapping to next line
    gap: 0, // remove any additional spacing
  },
  characterItem: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 15,
    width: SCREEN_WIDTH * 0.28, // slightly smaller width to fit 3 items
  },
  characterIcon: {
    marginTop: 5,
    marginBottom: 3,
  },
  characterName: {
    marginTop: 5,
    fontSize: 10,
    color: "white",
    textAlign: "center",
  },
  confirmButton: {
    paddingVertical: 5,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    zIndex: 3,
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  remainingCount: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
  },
  remainingCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 8,
    gap: 8,
  },
  toastContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 10,
  },
  toastText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
  characterItemFreinds: {
    alignItems: "center",
    width: SCREEN_WIDTH * 0.3, // 일반 테마와 동일하게 너비 증가
    paddingVertical: 2,
  },
  friendBoardImage: {
    width: SCREEN_WIDTH * 0.98,
    height: SCREEN_HEIGHT * 0.43,
    marginBottom: -40,
  },
  confirmButtonFreinds: {
    paddingVertical: 5,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    zIndex: 3,
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.18,
  },
  remainingCountRowFriends: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    top: SCREEN_HEIGHT * 0.015,
    gap: 8,
  },
  
});