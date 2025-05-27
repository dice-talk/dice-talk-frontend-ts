import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from "react-native";

interface InsufficientItemModalProps {
  visible: boolean;
  onClose: () => void;
  onGoToStore: () => void;
  textColor?: string;
  storeButtonColor?: string;
  cancelButtonColor?: string;
}

const InsufficientItemModal: React.FC<InsufficientItemModalProps> = ({
  visible,
  onClose,
  onGoToStore,
  textColor = "#8A5A7A",
  storeButtonColor = "#D9B2D3",
  cancelButtonColor = "#A8A3C8"
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
              <Text style={[styles.messageText, { color: textColor }]}>아이템이 부족합니다</Text>
              <Text style={[styles.subMessageText, { color: textColor }]}>충전하시겠습니까?</Text>
            </View>
            <View style={styles.spacer} />
            <Pressable
              style={[styles.storeButton, { backgroundColor: storeButtonColor }]}
              onPress={onGoToStore}
            >
              <View style={styles.storeButtonContent}>
                <Ionicons name="storefront-outline" size={24} color="white" style={styles.storeIcon} />
                <Text style={styles.storeButtonText}>상점으로 이동하기</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.cancelButton, { backgroundColor: cancelButtonColor }]}
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

export default InsufficientItemModal;

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
  storeButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#D9B2D3",
    borderRadius: 30,
    marginBottom: 10,
  },
  storeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  storeIcon: {
    marginRight: 8,
  },
  storeButtonText: {
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