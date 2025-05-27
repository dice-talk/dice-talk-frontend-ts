import MediumButton from '@/components/profile/myInfoPage/MediumButton'; // 경로 확인
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface QuestionSuccessModalProps {
  visible: boolean;
  onClose: () => void; // 모달을 닫는 함수 (필요 시 사용)
  onGoHome: () => void; // 첫 화면으로 돌아가는 함수
}

const QuestionSuccessModal: React.FC<QuestionSuccessModalProps> = ({ visible, onClose, onGoHome }) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose} // Android back button
    >
      <BlurView intensity={10} style={StyleSheet.absoluteFill}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.iconContainer}>
              <Ionicons name="send-outline" size={44} color="#B28EF8" />
            </View>
            <Text style={styles.modalText}>문의 등록에 성공했습니다.</Text>
            <View style={{height: 16}}/>
            <Text style={styles.modalSubText}>답변은 이메일로 보내드리겠습니다. {`\n`} 3~5일 내에 답변 드리겠습니다.</Text>

            <View style={styles.buttonContainer}>
              <MediumButton
                title="첫 화면으로 돌아가기"
                onPress={onGoHome}
                // 버튼 스타일을 MediumButton 내부에서 조정하거나, 여기서 추가 스타일을 적용할 수 있습니다.
                customStyle={styles.customButton}
              />
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(178, 142, 248, 0.2)', // 연한 보라색 배경
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalText: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  modalSubText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%', // 버튼 너비를 모달에 맞춤
  },
  customButton: { // MediumButton 스타일을 오버라이드하거나 추가할 필요가 있다면
    marginTop: 10,
    width: '70%',
  },
});

export default QuestionSuccessModal; 