// src/components/Profile/ProfileHeader.tsx
import Dice from "@/assets/images/profile/dice.svg";
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";
import GradientButton from "../common/GradientButton";
import GradientLine from "../common/GradientLine";

// 기본 프로필 이미지 (ProfileScreen에서도 사용하는 것과 동일한 로직 또는 값을 공유하는 것이 좋음)
// 여기서는 일단 ProfileScreen에서 defaultProfileImage를 넘겨준다고 가정하지 않고, 자체적으로 정의합니다.
// 만약 ProfileScreen의 defaultProfileImage를 props로 받는다면 이 부분은 필요 없습니다.
const fallbackDefaultImage = require("@/assets/images/profile/profile_default.png");

type ProfileHeaderProps = {
  nickname: string;
  profileImage: ImageSourcePropType | string | null | undefined; // 타입을 더 유연하게 변경
  diceCount: number;
  isInChat: boolean;
  mode?: "profile" | "myInfo" | "question";
};

const { width, height } = Dimensions.get("window");
const PROFILE_SIZE = height * 0.12; // 화면 높이의 12%로 프로필 원 크기 지정

export default function ProfileHeader({
  nickname,
  profileImage,
  diceCount,
  isInChat,
  mode = "profile",
}: ProfileHeaderProps) {

  let imageSourceToUse: ImageSourcePropType = fallbackDefaultImage; // 기본값으로 fallback 설정

  if (profileImage) {
    if (typeof profileImage === 'string') {
      // URL 문자열인 경우 (http로 시작하는지 간단히 확인)
      if (profileImage.startsWith('http')) {
        imageSourceToUse = { uri: profileImage };
      } else {
        // http로 시작하지 않는 문자열은 잘못된 값으로 간주, fallback 사용
        // 또는 특정 로컬 경로 규칙이 있다면 여기서 처리
        console.warn("ProfileHeader: Received string profileImage that is not a URI:", profileImage);
        imageSourceToUse = fallbackDefaultImage;
      }
    } else if (typeof profileImage === 'number') {
      // require()의 결과인 경우 (숫자 ID)
      imageSourceToUse = profileImage;
    } else if (typeof profileImage === 'object' && profileImage !== null && 'uri' in profileImage) {
      // { uri: '...' } 형태의 객체인 경우
      imageSourceToUse = profileImage;
    }
    // 다른 ImageSourcePropType의 복잡한 형태 (예: 배열)는 여기서 추가 처리 가능
  }
  
  // console.log("ProfileHeader - nickname:", nickname, "profileImage prop:", profileImage, " resolved imageSourceToUse:", imageSourceToUse);

  return (
    <View style={[styles.container, { marginTop: height * 0.12 }]}> {/* 비율로 위치 조정 */}
      <View style={[styles.profileImageContainer, { width: PROFILE_SIZE, height: PROFILE_SIZE, borderRadius: PROFILE_SIZE / 2 }]}> 
        <Image 
          source={imageSourceToUse} 
          style={[styles.profileImage, { width: PROFILE_SIZE - 8, height: PROFILE_SIZE - 8, borderRadius: (PROFILE_SIZE - 8) / 2 }]} 
          onError={(e) => console.log("ProfileHeader Image Error:", e.nativeEvent.error, "Source was:", imageSourceToUse)}
        />
      </View>
      <Text style={styles.nickname}> {String(nickname || "").trim()} </Text>
      {isInChat ? (
      <View style={styles.statusRow}>
        <Ionicons name="chatbubbles-outline" size={18} color="rgba(0, 0, 0, 0.5)" />
          <Text style={styles.statusText}>채팅 참여중</Text>
        </View>
      ) : (
        null
      )}
      <View style={{ width: width * 0.9, alignSelf: "center", marginTop: 0 }}>
        <GradientLine />
      </View>
      {mode === "profile" && (
        <View style={[styles.diceCountContainer, { marginBottom: height * 0.06, width: width * 0.75 }]}> 
          <View style={[styles.diceCountRow]}>
            <Text style={styles.diceCount}>My Dice</Text>
            <Dice />
          </View>
          <Text style={[styles.diceCount]}>{diceCount}개</Text>
        </View>
      )}
      {mode === "myInfo" && (
        <View style={styles.statusRow} />
      )}
      {mode === "question" && (
        <View style={styles.buttonRow}>
          <GradientButton title="1:1 문의하기" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    width: width * 0.9,
  },
  profileImageContainer: {
    backgroundColor: "#F9F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B19ADE",
  },
  profileImage: {},
  nickname: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: "#7d7d7d",
    marginTop: height * 0.01,
    textAlign: "center",
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginTop: height * 0.01,
    minHeight: 22,
  },
  statusText: {
    fontFamily: "Pretendard-Bold",
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
    marginLeft: 8,
    fontWeight: '600',
  },
  diceCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diceCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diceCount: {
    fontFamily: "Pretendard",
    fontSize: 16,
    color: "#7d7d7d",
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "90%",
    marginTop: 8,
  },
  editText: {
    fontFamily: "Pretendard-Bold",
    color: "#B19ADE",
    fontSize: 15,
    marginLeft: 4,
  },
  buttonRow: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 32,
  },
});
