import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react'; // useState 임포트
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from 'expo-router'; // useRouter 임포트

// SharedProfileStore에서 totalDice를 가져오기 위한 임포트 (경로는 실제 프로젝트 구조에 맞게 조정 필요)
import useSharedProfileStore from '@/zustand/stores/sharedProfileStore';

import InsufficientItemModal from './DiceRechargeModal'; // 다이스 부족 시 사용할 모달
import Toast from './Toast'; // 토스트 메시지 표시용 컴포넌트

interface CustomCostModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content?: string;
  diceCount?: number;
  textColor?: string;
  diceButtonColor?: string;
  cancelButtonColor?: string;
}

const CustomCostModal: React.FC<CustomCostModalProps> = ({
  visible,
  onClose,
  onConfirm: originalOnConfirm, // 내부 로직과의 충돌을 피하기 위해 이름 변경
  content = "하루에 1번 이상\n채팅방을 나가셨습니다.", // 기본 컨텐츠
  diceCount = 7,
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

  const handleDiceButtonPress = () => {
    if (diceCount > totalDice) {
      // 다이스 부족, 다이스 부족 모달 표시
      setIsInsufficientDiceModalVisible(true);
    } else {
      // 다이스 충분, 원래의 onConfirm 액션 실행
      originalOnConfirm();
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
                <Text style={styles.diceButtonText}>다이스 {diceCount}개 사용</Text>
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