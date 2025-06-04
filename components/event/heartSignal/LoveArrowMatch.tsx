import FriendLetterForm from '@/assets/images/event/friend_letterForm.svg';
import Signal from '@/assets/images/event/signal.svg';
import TextForm from '@/assets/images/event/textForm.svg';
import CircleProfile from '@/components/common/CircleProfile';
import { BlurView } from 'expo-blur';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from 'react-native-svg';

const { width, height } = Dimensions.get("window");

export interface ProfileInfo { // 'export' 추가
  nickname: string;
  SvgComponent: React.FC<SvgProps>;
}

// 닉네임에 따른 아이콘 색상 매핑 (ResultLoveArrow의 좌/우 그룹 색상 기준)
const nicknameToIconColorMap: Record<string, string> = {
  "한가로운 하나": "#9FC9FF", // 여성 그룹 색상
  "세침한 세찌": "#9FC9FF",   // 여성 그룹 색상
  "단호한데 다정한 다오": "#9FC9FF", // 여성 그룹 색상
  "두 얼굴의 매력 두리": "#F9BCC1",    // 남성 그룹 색상
  "네모지만 부드러운 네몽": "#F9BCC1",    // 남성 그룹 색상
  "육감적인 직감파 육땡": "#F9BCC1", // 남성 그룹 색상
};
type LoveArrowMatchProps = {
  isVisible: boolean;
  onClose: () => void;
  themeId?: number;
  myProfile?: ProfileInfo;      // 본인 프로필 정보
  partnerProfile?: ProfileInfo; // 매칭된 상대 프로필 정보
};

const LoveArrowMatch = ({ isVisible, onClose, themeId = 1, myProfile, partnerProfile }: LoveArrowMatchProps) => {
  // 테마별 색상 설정
  const textColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const buttonColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const buttonBorderColor = themeId === 2 ? "#9FC9FF" : "#FFD6DD";
  // 테마별 프로필 아이콘 SVG 기본 색상 설정 (nicknameToIconColorMap에 없을 경우 사용)
  const profileColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  // themeId가 2일 때의 기본 프로필 테두리 색상
  const defaultProfileBorderColorForTheme2 = "#9FC9FF";

  if (!myProfile || !partnerProfile) return null; // 또는 로딩/에러 상태 표시

  // 각 프로필의 아이콘 색상 결정
  const myIconColor = nicknameToIconColorMap[myProfile.nickname] || profileColor; // 맵에 없으면 테마 기본색 사용
  const partnerIconColor = nicknameToIconColorMap[partnerProfile.nickname] || profileColor; // 맵에 없으면 테마 기본색 사용

  // 각 프로필의 테두리 색상 결정
  let myProfileBorderColor: string;
  let partnerProfileBorderColor: string;

  myProfileBorderColor = themeId === 2 ? defaultProfileBorderColorForTheme2 : myIconColor;
  partnerProfileBorderColor = themeId === 2 ? defaultProfileBorderColorForTheme2 : partnerIconColor;

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
          {myProfile && (
            <View style={styles.iconGroupLeft}>
              <CircleProfile
                svgComponent={myProfile.SvgComponent}
                svgColor={myIconColor} // 결정된 아이콘 색상 적용
                borderColor={myProfileBorderColor} // 결정된 테두리 색상 적용
                backgroundColor="white" // 배경색 흰색으로 지정
                size={width * 0.13}
              />
              <Text style={styles.iconLabel}>{myProfile.nickname}</Text>
            </View>
          )}
          {partnerProfile && (
            <View style={styles.iconGroupRight}>
              <CircleProfile
                svgComponent={partnerProfile.SvgComponent}
                svgColor={partnerIconColor} // 결정된 아이콘 색상 적용
                borderColor={partnerProfileBorderColor} // 결정된 테두리 색상 적용
                backgroundColor="white" // 배경색 흰색으로 지정
                size={width * 0.13}
              />
              <Text style={styles.iconLabel}>{partnerProfile.nickname}</Text>
            </View>
          )}
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
    top: height * 0.38,
  },
  friendTextForm: {
    position: 'absolute',
    width: width * 0.8,
    height: height * 0.1,
    top: height * 0.38,
  }, 
  signal: {
    position: 'absolute',
    width: width * 0.4,
    height: height * 0.5,
    top: height * 0.27,
  },  
  text: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '300',
    top: height * -0.047,
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