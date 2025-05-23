import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface CustomCostModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  content?: string;
  diceCount?: number;
}

const CustomCostModal: React.FC<CustomCostModalProps> = ({
  visible,
  onClose,
  onConfirm,
  content = "하루에 2번 이상\n채팅방을 나가셨습니다.",
  diceCount = 7
}) => {
  // 모달 닫기 요청 처리
  const handleRequestClose = () => {
    onClose();
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
              <Text style={styles.messageText}>{content}</Text>
              <Text style={styles.subMessageText}>아이템을 사용하시겠습니까?</Text>
            </View>
            <View style={styles.spacer} />
            <Pressable
              style={styles.diceButton}
              onPress={onConfirm}
            >
              <View style={styles.diceButtonContent}>
                <Ionicons name="dice-outline" size={24} color="white" style={styles.diceIcon} />
                <Text style={styles.diceButtonText}>다이스 {diceCount}개 사용</Text>
              </View>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </View>
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
    paddingVertical: 15,
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
    paddingVertical: 15,
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