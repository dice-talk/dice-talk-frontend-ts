import { deleteMember } from '@/api/memberApi';
//import { useAnonymousStore } from '@/zustand/stores/anonymous';
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AccountExitModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  deleteReason: string;
}

const AccountExitModal = ({ visible, onCancel, onConfirm, deleteReason }: AccountExitModalProps) => {
  // const { memberId } = useAnonymousStore();

  const handleDeleteMember = async () => {
    try {
      if (true) {
        await deleteMember(deleteReason);
        console.log('✅ 회원 탈퇴 성공:', deleteReason);
        onConfirm();
      }
    } catch (error) {
      console.error('🚨 회원 탈퇴 실패:', error);
      // 에러가 발생해도 onConfirm을 호출하여 모달을 닫고 다음 단계로 진행
      onConfirm();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* 제목 */}
          <Text style={styles.title}>정말</Text>
          <Text style={styles.subtitle}>탈퇴 하시겠습니까?</Text>
          
          {/* 구분선 */}
          <View style={styles.dividerContainer}>
            <LinearGradient
              colors={["#B28EF8", "#F476E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.leftDivider}
            />
          </View>
          
          {/* 설명 텍스트 */}
          <Text style={styles.description}>
            우리의 추억을 잊지 말아주세요😭
          </Text>
          
          {/* 버튼 영역 */}
          <View style={styles.buttonContainer}>
            <Pressable onPress={onCancel} style={styles.cancelButtonWrapper}>
              <View style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </View>
            </Pressable>
            
            <Pressable onPress={handleDeleteMember} style={styles.confirmButtonWrapper}>
              <LinearGradient
                colors={["#B28EF8", "#F476E5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>탈퇴하기</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalView: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 30,
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 3,
    marginBottom: 30,
    gap: 20,
  },
  leftDivider: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  rightDivider: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 15,
  },
  cancelButtonWrapper: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    color: "#888888",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonWrapper: {
    flex: 1,
  },
  confirmButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AccountExitModal;
