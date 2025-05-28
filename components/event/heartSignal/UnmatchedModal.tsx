import FriendLetterForm from '@/assets/images/event/friend_letterForm.svg';
import BoardBase from '@/assets/images/event/heartBoardBase.png';
import TextForm from '@/assets/images/event/textForm.svg';
import { BlurView } from "expo-blur";
import { useRouter } from 'expo-router';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface UnmatchedModalProps {
  visible: boolean;
  onClose: () => void;
  themeId?: number;
}

const UnmatchedModal = ({ visible, onClose, themeId = 1 }: UnmatchedModalProps) => {
  const router = useRouter();

  const handleGoToMain = () => {
    onClose(); // 모달 닫기
    router.push('/chat'); // ChatMain으로 이동
  };

  // themeId에 따른 색상 설정
  const textColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const buttonColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          <Image source={BoardBase} style={styles.boardBase} />
          
          {/* themeId에 따른 조건부 렌더링 */}
          {themeId === 2 ? (
            <View style={styles.friendTextForm}>
              <FriendLetterForm width="100%" height="100%" />
            </View>
          ) : (
            <TextForm style={styles.textForm} />
          )}
          
          <Text style={[styles.text, { color: textColor }]}>
            아쉽게도 시그널이 맞지 않았습니다.
          </Text>
          
          {/* 메인으로 이동 버튼 */}
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: buttonColor }]}
            onPress={handleGoToMain}
          >
            <Text style={styles.buttonText}>메인으로</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

export default UnmatchedModal;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardBase: {
    width: width * 0.9,
    height: height * 0.3,
  },
  textForm: {
    position: 'absolute',
    width: width * 0.9,
    height: height * 0.11,
    top: height * 0.42,
  },
  text: {
    fontSize: 14,
    fontWeight: "light",
    position: "absolute",
    top: height * 0.485,
    zIndex: 10,
  },
  mainButton: {
    position: 'absolute',
    bottom: height * 0.25,
    width: width * 0.6,
    height: height * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  friendTextForm: {
    position: 'absolute',
    top: height * 0.41,
    width: width * 0.9,
    height: height * 0.12,
  },
});