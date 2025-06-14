import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  confirmText = "확인",
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onConfirm} // Android 뒤로가기 버튼 처리
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={styles.confirmActionText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    alignItems: 'stretch', // 자식 요소들의 정렬을 내부에서 처리하도록 변경
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: windowWidth * 0.8, // 너비 약간 줄임
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'left', // 왼쪽 정렬
  },
  modalMessage: {
    marginBottom: 20,
    textAlign: 'left', // 왼쪽 정렬
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#000',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  confirmActionText: {
    color: '#B19ADE',
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});

export default AlertModal; 