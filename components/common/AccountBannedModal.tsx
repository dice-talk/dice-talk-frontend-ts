import { Ionicons } from '@expo/vector-icons'; // 경고 아이콘용
import { useRouter } from 'expo-router'; // useRouter 임포트
import React from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AccountBannedModalProps {
  isVisible: boolean;
  onConfirm: () => void;
}

const { width, height } = Dimensions.get('window');

const AccountBannedModal: React.FC<AccountBannedModalProps> = ({ isVisible, onConfirm }) => {
  const router = useRouter();

  const handleConfirmPress = () => {
    onConfirm(); // 기존 onConfirm (모달 닫기 등) 실행
    router.replace('/(onBoard)'); // (onBoard)/index로 이동
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={() => {}} // Android 뒤로가기 버튼 처리 (여기서는 닫히지 않도록)
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Ionicons name="warning" size={width * 0.15} color="#FFC107" style={styles.icon} />
          <Text style={styles.titleText}>이 계정은 금칙어 사용으로 인해</Text>
          <Text style={styles.titleText}>영구 정지되었습니다.</Text>
          <Text style={styles.messageText}>문의 사항이 있으면 고객센터로</Text>
          <Text style={styles.messageText}>연락하세요</Text>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPress} activeOpacity={0.8}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85, // 화면 너비의 85%
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 30, // 상하 패딩
    paddingHorizontal: 25, // 좌우 패딩
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 17, // 기본 텍스트보다 약간 크게
    fontFamily: 'Pretendard-SemiBold',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24, // 줄간격
  },
  messageText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#555555',
    textAlign: 'center',
    marginTop: 12, // 제목과의 간격
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: '#F26B6B', // 이미지의 주황색 계열 버튼 색상
    borderRadius: 25, // 타원형 버튼
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 30, // 메시지와의 간격
    minWidth: width * 0.35, // 버튼 최소 너비
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
});

export default AccountBannedModal; 