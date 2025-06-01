import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CancelModalProps {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const CancelModal: React.FC<CancelModalProps> = ({
  visible,
  onCancel,
  onDelete,
  message = "정말로 삭제하시겠습니까?",
  confirmText = "삭제",
  cancelText = "취소",
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={[styles.buttonText, styles.deleteButtonText]}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: windowWidth * 0.8, // 화면 너비의 80%
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Pretendard-Regular', // 폰트 적용 (프로젝트에 폰트 설정이 되어있어야 함)
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 버튼 사이 간격
    width: '100%', // 컨테이너 너비 최대로
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10, // 좌우 패딩 통일
    elevation: 2,
    minWidth: windowWidth * 0.3, // 버튼 최소 너비
    alignItems: 'center', // 텍스트 중앙 정렬
  },
  cancelButton: {
    backgroundColor: '#F3F4F6', // 취소 버튼 배경색
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#F87171', // 삭제 버튼 배경색 변경 (기존 #EF4444)
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium', // 폰트 적용
  },
  cancelButtonText: {
    color: '#4B5563', // 취소 버튼 텍스트 색상
  },
  deleteButtonText: {
    color: 'white', // 삭제 버튼 텍스트 색상
  },
});

export default CancelModal; 