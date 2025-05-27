import Dori from '@/assets/images/dice/dori.svg';
import Hana from '@/assets/images/dice/hana.svg';
import FriendLetterForm from '@/assets/images/event/friend_letterForm.svg';
import Signal from '@/assets/images/event/signal.svg';
import TextForm from '@/assets/images/event/textForm.svg';
import CircleProfile from '@/components/common/CircleProfile';
import { BlurView } from 'expo-blur';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width, height } = Dimensions.get("window");

type LoveArrowMatchProps = {
  isVisible: boolean;
  onClose: () => void;
  themeId?: number;
};

const LoveArrowMatch = ({ isVisible, onClose, themeId = 1 }: LoveArrowMatchProps) => {
  // 테마별 색상 설정
  const textColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const buttonColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const buttonBorderColor = themeId === 2 ? "#9FC9FF" : "#FFD6DD";
  
  // 테마별 프로필 색상 설정
  const profileColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const profileBorderColor = themeId === 2 ? "#9FC9FF" : "#FFD6DD";
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          <Image source={require('@/assets/images/event/heartBoardBase.png')} style={styles.image} />
          {themeId === 2 ? (
            <FriendLetterForm 
              style={styles.friendTextForm}
              width={width * 0.8}
              height={height * 0.1}
            />
          ) : (
            <TextForm 
              style={styles.textForm}
              width={width * 0.8}
              height={height * 0.1}
            />
          )}
          <Signal style={styles.signal} />
          <Text style={[styles.text, { color: textColor }]}>서로의 시그널이 통했습니다.{"\n"}이제 둘만의 채팅창으로 이동합니다.</Text>
          <TouchableOpacity style={[styles.moveButton, { backgroundColor: buttonColor, borderColor: buttonBorderColor }]} onPress={onClose}>
            <Text style={styles.moveButtonText}>이동하기</Text>
          </TouchableOpacity>
          <View style={styles.iconGroupLeft}>
            <CircleProfile 
              svgComponent={Hana}
              svgColor={profileColor}
              borderColor={profileBorderColor}
              size={width * 0.13}
            />
            <Text style={styles.iconLabel}>한가로운 하나</Text>
          </View>
          <View style={styles.iconGroupRight}>
            <CircleProfile 
              svgComponent={Dori}
              svgColor={profileColor}
              borderColor={profileBorderColor}
              size={width * 0.13}
            />
            <Text style={styles.iconLabel}>두 얼굴의 매력 두리</Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default LoveArrowMatch;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.95,
    height: height * 0.3,
    position: 'absolute',
  },
  textForm: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.1,
    top: height * 0.36,
  },
  friendTextForm: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.1,
    top: height * 0.36,
  }, 
  signal: {
    position: 'absolute',
    width: width * 0.4,
    height: height * 0.5,
    top: height * 0.27,
  },  
  text: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '300',
    top: height * -0.04,
    // marginTop: height * 0.05,
  },
  moveButton: {
    position: 'absolute',
    top: height * 0.65,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 25,
    borderWidth: 2,
  },
  moveButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  iconGroupLeft: {
    position: 'absolute',
    left: width * 0.12,
    top: height * 0.495,
    alignItems: 'center',
  },
  iconGroupRight: {
    position: 'absolute',
    right: width * 0.1,
    top: height * 0.495,
    alignItems: 'center',
  },
  iconLabel: {
    marginTop: 6,
    fontSize: 10,
    color: 'white',
    fontWeight: '400',
    textAlign: 'center',
  },
});