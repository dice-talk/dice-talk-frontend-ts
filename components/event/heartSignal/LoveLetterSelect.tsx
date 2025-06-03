import { useState, useMemo, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore"; // SharedProfileStore 임포트
import SelectableOption from "./SelectableOption";
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore 임포트 (경로 가정)
import useEventMessageStore from "@/zustand/stores/SecretMessageStore"; // EventMessageStore 임포트
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 임포트

// SVG 파일 import
import DaoSvg from '@/assets/images/dice/dao.svg';
import DoriSvg from '@/assets/images/dice/dori.svg'; // 두리 SVG 추가
import HanaSvg from '@/assets/images/dice/hana.svg';
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from '@/assets/images/dice/sezzi.svg';
import YukdaengSvg from '@/assets/images/dice/yukdaeng.svg';

// 조건에 따라 표시될 여성 캐릭터 옵션
const FEMALE_TARGET_OPTIONS = [
  { label: "한가로운 하나", svgComponent: HanaSvg }, // memberId 제거
  { label: "세침한 세찌", svgComponent: SezziSvg },   // memberId 제거
  { label: "단호한데 다정한 다오", svgComponent: DaoSvg }, // memberId 제거
];

// 조건에 따라 표시될 남성 캐릭터 옵션
const MALE_TARGET_OPTIONS = [
  { label: "두 얼굴의 매력 두리", svgComponent: DoriSvg },    // memberId 제거
  { label: "네모지만 부드러운 네몽", svgComponent: NemoSvg },    // memberId 제거
  { label: "육감적인 직감파 육댕", svgComponent: YukdaengSvg }, // memberId 제거
];

// 남성 캐릭터 옵션을 보여줄 트리거가 되는 닉네임 목록
const TRIGGER_NICKNAMES = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];

interface LoveLetterSelectProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIndex: number) => void;
  themeId?: number;
}

const LoveLetterSelect: React.FC<LoveLetterSelectProps> = ({
  visible,
  onClose,
  onConfirm,
  themeId = 1,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // SharedProfileStore에서 nickname 가져오기
  const nickname = useSharedProfileStore((state) => state.nickname);
  const authMemberId = useAuthStore((state) => state.memberId); // AuthStore에서 memberId 가져오기
  const { setCurrentEventMessage } = useEventMessageStore((state) => state); // updateEventMessage 대신 setCurrentEventMessage 사용
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId); // ChatRoomStore에서 chatRoomId 가져오기
  const chatParts = useChatRoomStore((state) => state.chatParts); // ChatRoomStore에서 chatParts 가져오기

  // 옵션 목록 결정 로직 수정
  const baseOptions = useMemo(() => {
    if (themeId === 2) {
      // themeId가 2이면 모든 캐릭터 옵션을 합쳐서 반환
      return [...FEMALE_TARGET_OPTIONS, ...MALE_TARGET_OPTIONS];
    }
    // themeId가 2가 아닐 경우, 기존 로직 (닉네임 기반으로 성별 그룹 결정)
    if (nickname && TRIGGER_NICKNAMES.includes(nickname)) {
      return MALE_TARGET_OPTIONS;
    }
    return FEMALE_TARGET_OPTIONS;
  }, [nickname, themeId]); // themeId를 의존성 배열에 추가

  // 자신의 닉네임이 있다면 목록에서 제외
  const optionsToDisplay = useMemo(() => {
    console.log("[LoveLetterSelect] nickname prop:", nickname);
    if (nickname) { // nickname prop이 존재하면 해당 닉네임 제외
      const filtered = baseOptions.filter(option => {
        const isMatch = option.label === nickname;
        console.log(`[LoveLetterSelect] Comparing: option.label="${option.label}" vs nickname="${nickname}". Match: ${isMatch}`);
        return !isMatch; // 일치하지 않는 것만 포함 (즉, 일치하는 것은 제외)
      });
      console.log("[LoveLetterSelect] baseOptions:", baseOptions);
      console.log("[LoveLetterSelect] filteredOptions:", filtered);
      return filtered;
    }
    console.log("[LoveLetterSelect] nickname not provided or falsy, returning baseOptions.");
    return baseOptions;
  }, [baseOptions, nickname]);


  // 테마별 색상 설정
  const containerBorderColor = themeId === 2 ? "#9FC9FF" : "#FAD4DC";
  const dividerColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = themeId === 2 ? "#9FC9FF" : "#FEBFC8";
  const confirmButtonBorderColor = themeId === 2 ? "#6DA0E1" : "#FFD9DF";
  const textColor = themeId === 2 ? "#879FC0" : "#A45C73";
  const radioColor = themeId === 2 ? "#879FC0" : "#D6A0B1";
  const checkmarkColor = themeId === 2 ? "#879FC0" : "#E04C65";
  // SVG 색상 결정 로직 수정
  let svgColor: string;
  let selectedSvgColor: string;

  if (themeId === 2) {
    svgColor = "#9FC9FF";
    selectedSvgColor = "#9FC9FF";
  } else {
    const shouldUseSpecialNicknameColor = nickname && TRIGGER_NICKNAMES.includes(nickname);
    svgColor = shouldUseSpecialNicknameColor ? "#9FC9FF" : "#F9BCC1";
    selectedSvgColor = shouldUseSpecialNicknameColor ? "#9FC9FF" : "#F9BCC1";
  }

  useEffect(() => {
    // 옵션 목록이 변경되면 선택 상태 초기화
    setSelectedIndex(null);
  }, [optionsToDisplay]);

  // 선택 토글 처리 함수
  const handleToggleSelection = (index: number) => {
    // 이미 선택된 항목을 다시 클릭하면 선택 취소
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      // 다른 항목을 선택하면 해당 항목으로 선택 변경
      setSelectedIndex(index);
    }
  };

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      const selectedOption = optionsToDisplay[selectedIndex];
      // ChatRoomStore의 chatParts에서 선택된 캐릭터의 memberId 찾기
      const selectedParticipant = chatParts.find(
        (participant: ChatParticipant) => participant.nickname === selectedOption.label
      );

      if (selectedParticipant && selectedParticipant.memberId && authMemberId && currentChatRoomId) {
        // setCurrentEventMessage를 사용하여 전체 EventMessageData 객체를 설정합니다.
        setCurrentEventMessage({
          senderId: authMemberId,
          receiverId: selectedParticipant.memberId, // ChatRoomStore에서 가져온 memberId 사용
          chatRoomId: currentChatRoomId, // 현재 채팅방 ID 설정
          eventId: 1, // eventId를 1로 설정
          roomEventType: "PICK_MESSAGE", // roomEventType을 "PICK_MESSAGE"으로 설정
          message: "", // 초기 메시지는 비워둡니다. EventMessageData 인터페이스에 따라 필수입니다.
        });
        console.log(
          `선택된 사용자 memberId: ${selectedParticipant.memberId}, chatRoomId: ${currentChatRoomId}, eventId: 1, roomEventType: PICK_MESSAGE`
        );
        onConfirm(selectedIndex); // 기존 onConfirm 로직 호출
      } else {
        console.warn(
          `선택된 옵션(${selectedOption.label})에 해당하는 참가자를 chatParts에서 찾을 수 없거나, memberId, authMemberId 또는 chatRoomId가 유효하지 않습니다.`
        );
        onClose(); // 문제가 있으면 모달만 닫기
      }
    } else {
      // 아무것도 선택하지 않았다면 모달창만 닫기
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
    <View style={[styles.container, { borderColor: containerBorderColor }]}>
      <Text style={styles.title}>당신의 비밀 메세지를 받을{'\n'}사람을 선택해주세요</Text>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {optionsToDisplay.map((option, index) => (
        <SelectableOption
          key={index}
          label={option.label}
              svgComponent={option.svgComponent}
          selected={selectedIndex === index}
              onPress={() => handleToggleSelection(index)}
          svgColor={svgColor}
          selectedSvgColor={selectedSvgColor}
          textColor={textColor}
          radioColor={radioColor}
          checkmarkColor={checkmarkColor}
        />
      ))}
        </View>
      <View style={styles.confirmButtonWrapper}>
          <Pressable style={[styles.confirmButton, { backgroundColor: confirmButtonColor, borderColor: confirmButtonBorderColor }]} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default LoveLetterSelect;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  container: {
    width: '90%',
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 5,
    borderColor: "#FAD4DC",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F9BCC1",
    marginBottom: 20,
  },
  confirmButtonWrapper: {
    marginTop: 16,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  confirmButton: {
    backgroundColor: '#FEBFC8',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD9DF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});