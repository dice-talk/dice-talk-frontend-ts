// src/components/Profile/ProfileHeader.tsx
import Dice from "@/assets/images/profile/dice.svg";
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import GradientButton from "../common/GradientButton";
import GradientLine from "../common/GradientLine";

type ProfileHeaderProps = {
  nickname: string;
  profileImage: string;
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
  return (
    <View style={[styles.container, { marginTop: height * 0.12 }]}> {/* 비율로 위치 조정 */}
      <View style={[styles.profileImageContainer, { width: PROFILE_SIZE, height: PROFILE_SIZE, borderRadius: PROFILE_SIZE / 2 }]}> 
        <Image source={{ uri: profileImage || "/assets/icons/profile.svg" }} style={[styles.profileImage, { width: PROFILE_SIZE - 8, height: PROFILE_SIZE - 8, borderRadius: (PROFILE_SIZE - 8) / 2 }]} />
      </View>
      <Text style={styles.nickname}> {nickname} </Text>
      {isInChat ? (
      <View style={styles.statusRow}>
        <Ionicons name="chatbubbles-outline" size={18} color="rgba(0, 0, 0, 0.5)" />
          <Text style={styles.statusText}>채팅 참여중</Text>
        </View>
      ) : (
        <View style={styles.statusRow} />
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
