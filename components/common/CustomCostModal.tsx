import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react'; // useEffect, useState 임포트
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from 'expo-router'; // useRouter 임포트

// SharedProfileStore에서 totalDice를 가져오기 위한 임포트 (경로는 실제 프로젝트 구조에 맞게 조정 필요)
import useSharedProfileStore from '@/zustand/stores/sharedProfileStore'; // ChatRoomStore 임포트
import useHomeStore from '@/zustand/stores/HomeStore'; // HomeStore 임포트

import InsufficientItemModal from './DiceRechargeModal'; // 다이스 부족 시 사용할 모달
import Toast from './Toast'; // 토스트 메시지 표시용 컴포넌트
import { recordDiceUsage, RecordDiceUsageParams } from '@/api/productApi'; // recordDiceUsage API 함수 임포트
import { forceDeleteChatRoomMember } from '@/api/ChatApi'; // forceDeleteChatRoomMember API 함수 임포트

interface CustomCostModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content?: string;
  diceCount?: number; // 이 prop은 스토어에 값이 없을 경우의 fallback으로 사용됩니다.
  textColor?: string;
  diceButtonColor?: string;
  cancelButtonColor?: string;
}

const CustomCostModal: React.FC<CustomCostModalProps> = ({
  visible,
  onClose,
  onConfirm: originalOnConfirm, // 내부 로직과의 충돌을 피하기 위해 이름 변경
  content = "하루에 1번 이상\n채팅방을 나가셨습니다.", // 기본 컨텐츠
  diceCount: propDiceCount = 7, // prop으로 받는 diceCount, 스토어 값 없을 시 기본값 7
  textColor = "#8A5A7A",
  diceButtonColor = "#D9B2D3",
  cancelButtonColor = "#A8A3C8"
}) => {
  // 모달 닫기 요청 처리
  const handleRequestClose = () => {
    onClose(); // 메인 CustomCostModal을 닫기 위한 prop
  };

  const router = useRouter();
  const totalDice = useSharedProfileStore((state) => state.totalDice); // Zustand 스토어에서 totalDice 가져오기

  const [
    isInsufficientDiceModalVisible,
    setIsInsufficientDiceModalVisible,
  ] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [actualDiceCount, setActualDiceCount] = useState(propDiceCount);
  const [actualItemId, setActualItemId] = useState<number>(0); // "exit" 아이템의 itemId를 저장할 상태

  // HomeStore에서 items 상태를 가져옵니다.
  const chatRoomItems = useHomeStore((state) => state.items); // HomeStore의 items를 사용하도록 변경

  useEffect(() => {
    if (visible) {
      // "exit" 아이템을 찾아 actualDiceCount와 actualItemId를 설정합니다.
      const targetItem = chatRoomItems?.find(item => item.itemName === "exit");
      if (targetItem && typeof targetItem.dicePrice === 'number') {
        setActualDiceCount(targetItem.dicePrice);
        setActualItemId(targetItem.itemId); // 찾은 아이템의 itemId 저장
      } else {
        // "exit" 아이템이 없거나 dicePrice가 유효하지 않으면 prop으로 받은 diceCount 또는 기본값을 사용합니다.
        console.warn('CustomCostModal: "exit" item not found in ChatRoomStore or invalid dicePrice. Falling back to propDiceCount.');
        setActualDiceCount(propDiceCount);
        setActualItemId(0); // 아이템을 찾지 못했으므로 itemId도 기본값 0으로 설정
      }
    }
    // 모달이 닫힐 때 actualDiceCount를 초기화하고 싶다면 여기에 로직 추가 가능
    // else {
    //   setActualDiceCount(propDiceCount);
    //   setActualItemId(0);
    // }
  }, [visible, chatRoomItems, propDiceCount]); // chatRoomItems와 propDiceCount도 의존성 배열에 포함

  const handleDiceButtonPress = async () => { // async 함수로 변경
    // 이제 itemForApi를 다시 찾을 필요 없이 useEffect에서 설정된 actualItemId를 사용합니다.
    if (actualDiceCount > totalDice) { // 실제 사용할 다이스 개수로 비교
      // 다이스 부족, 다이스 부족 모달 표시
      setIsInsufficientDiceModalVisible(true);
    } else {
      try {
        // API 호출에 필요한 파라미터 준비
        const params: RecordDiceUsageParams = {
          quantity: actualDiceCount, // useEffect에서 "exit" 아이템의 dicePrice 또는 fallback 값으로 설정됨
          info: " 나가기 아이템 사용", // 요청된 문자열 (앞에 공백 포함)
          itemId: actualItemId, // useEffect에서 설정된 "exit" 아이템의 itemId 사용
          // productId는 productApi.ts의 RecordDiceUsageParams에 정의되어 있지 않으므로 전달하지 않습니다.
        };

        console.log('🎲 다이스 사용 API 호출 파라미터:', params);
        const diceUsageResponse = await recordDiceUsage(params);
        console.log('✅ 다이스 사용 기록 응답:', diceUsageResponse);

        if (diceUsageResponse.status === 201) { // 상태 코드를 200에서 201로 변경
          console.log('✅ 다이스 사용 성공 (201). 강제 나가기 시도.');
          try {
            const forceExitStatus = await forceDeleteChatRoomMember();
            console.log('✅ 강제 나가기 API 응답 상태:', forceExitStatus);
            if (forceExitStatus >= 200 && forceExitStatus < 300) {
              // 강제 나가기 성공
              originalOnConfirm(); // 최종 성공 처리
            } else {
              // 강제 나가기 실패
              setToastMessage(`채팅방을 나가는 중 오류가 발생했습니다. (코드: ${forceExitStatus})`);
              setToastVisible(true);
            }
          } catch (forceExitError) {
            console.error("❌ 강제 나가기 API 호출 중 에러:", forceExitError);
            setToastMessage("채팅방을 나가는 중 문제가 발생했습니다.");
            setToastVisible(true);
          }
        } else {
          // 다이스 사용 API가 201이 아닌 다른 성공 코드(2xx) 또는 실패 코드를 반환한 경우
          setToastMessage(`아이템 사용 처리 중 예상치 못한 응답을 받았습니다. (코드: ${diceUsageResponse.status})`);
          setToastVisible(true);
        }

      } catch (error: any) { // error 타입을 any로 명시하거나 구체적인 에러 타입 사용
        console.error("❌ 다이스 사용 기록 또는 강제 나가기 중 실패:", error);
        // API 응답으로 409 (Conflict) 상태 코드를 받은 경우 (다이스 부족 등)
        if (error.response?.status === 409) {
          // 아이템 부족 모달(결제 유도 모달)을 표시합니다.
          setIsInsufficientDiceModalVisible(true);
        } else {
          // 그 외 다른 오류의 경우, 일반적인 실패 토스트 메시지를 표시합니다.
          setToastMessage("아이템 사용에 실패했습니다. 다시 시도해주세요.");
          setToastVisible(true);
        }
      }
    }
  };

  const handleGoToStore = () => {
    setIsInsufficientDiceModalVisible(false);
    router.push('/profile/ChargePage'); // ChargePage로 이동 (경로 확인 필요)
  };

  const handleInsufficientDiceModalClose = () => {
    // 다이스 부족 모달에서 "취소" 버튼 클릭 시
    setIsInsufficientDiceModalVisible(false);
    setToastMessage("나가기 횟수를 초과하여 결제가 필요합니다");
    onClose(); // 메인 CustomCostModal도 닫습니다.
    setToastVisible(true);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: textColor }]}>{content}</Text>
              <Text style={[styles.subMessageText, { color: textColor }]}>아이템을 사용하시겠습니까?</Text>
            </View>
            <View style={styles.spacer} />
            <Pressable
              style={[styles.diceButton, { backgroundColor: diceButtonColor }]}
              onPress={handleDiceButtonPress} // onPress 핸들러 업데이트
            >
              <View style={styles.diceButtonContent}>
                <Ionicons name="dice-outline" size={24} color="white" style={styles.diceIcon} />
                <Text style={styles.diceButtonText}>다이스 {actualDiceCount}개 사용</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: cancelButtonColor }]}
              onPress={onClose} // 이 버튼은 메인 모달의 "취소" 버튼입니다.
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </View>
      {/* 다이스가 부족할 때 표시될 모달 */}
      <InsufficientItemModal
        visible={isInsufficientDiceModalVisible}
        onClose={handleInsufficientDiceModalClose} // "취소" 액션
        onGoToStore={handleGoToStore} // "상점으로 이동하기" 액션
      />

      {/* 토스트 메시지 표시 */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </Modal>
  );
};

export default CustomCostModal;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.75,
    height: height * 0.35,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  messageContainer: {
    alignItems: "center",
    paddingTop: 20,
  },
  spacer: {
    flex: 1,
  },
  messageText: {
    fontSize: 18,
    color: "#8A5A7A",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 28,
  },
  subMessageText: {
    fontSize: 18,
    color: "#8A5A7A",
    marginBottom: 10,
  },
  diceButton: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#D9B2D3",
    borderRadius: 30,
    marginBottom: 10,
  },
  diceButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  diceIcon: {
    marginRight: 8,
  },
  diceButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#A8A3C8",
    borderRadius: 30,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
}); 