import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface ExitCostModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  subMessage?: string;
  confirmButtonColor?: string;
  textColor?: string;
}

const ExitCostModal: React.FC<ExitCostModalProps> = ({
  visible,
  onClose,
  onConfirm,
  message = "하루에 최대 1번 무료로 채팅방을 \n 나갈 수 있습니다.",
  subMessage = "나가시겠습니까?",
  confirmButtonColor = "#D9B2D3",
  textColor = "#8A5A7A"
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
              <Text style={[styles.messageText, { color: textColor }]}>
                {message}
              </Text>
              <Text style={[styles.subMessageText, { color: textColor }]}>
                {subMessage}
              </Text>
            </View>
            <View style={styles.spacer} />
            <View style={styles.buttonContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.confirmButton, { backgroundColor: confirmButtonColor }]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExitCostModal;

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
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  button: {
    width: "48%",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E2E2E2",
  },
  confirmButton: {
    backgroundColor: "#D9B2D3",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});