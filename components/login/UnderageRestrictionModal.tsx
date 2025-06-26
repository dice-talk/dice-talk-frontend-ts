import MediumButton from '@/components/profile/myInfoPage/MediumButton';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface UnderageRestrictionModalProps {
  visible: boolean;
  onGoLogin: () => void; // 로그인 화면으로 돌아가는 함수
}

const UnderageRestrictionModal: React.FC<UnderageRestrictionModalProps> = ({ visible, onGoLogin }) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onGoLogin} // Android back button 동작 시 로그인 화면으로
    >
      <BlurView intensity={10} style={StyleSheet.absoluteFill}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LinearGradient
              colors={['#B28EF8', '#F476E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.iconContainer}
            >
              <Ionicons name="sad-outline" size={50} color="white" />
            </LinearGradient>
            <Text style={styles.modalText}>미성년자는 가입이 불가능합니다</Text>
            
            <View style={styles.buttonContainer}>
              <MediumButton
                title="로그인 화면으로"
                onPress={onGoLogin}
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 25,
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
    width: 85, // 아이콘 크기에 맞춰 조정
    height: 85,
    borderRadius: 20, // 이미지처럼 둥근 사각형
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalText: {
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold', // 폰트 적용 (설치 필요)
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
  },
  customButton: { 
    marginTop: 10,
    width: '100%', // 버튼 너비를 모달에 꽉 채움
  },
});

export default UnderageRestrictionModal; 