// src/components/Profile/ProfileHeader.tsx
import Dice from "@/assets/images/profile/dice.svg";
import { Ionicons } from '@expo/vector-icons';
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import GradientLine from "../common/GradientLine";

type ProfileHeaderProps = {
  nickname: string;
  profileImage: string;
  diceCount: number;
  isInChat: boolean;
};

const PROFILE_SIZE = 100;

export default function ProfileHeader({
  nickname,
  profileImage,
  diceCount,
  isInChat,
}: ProfileHeaderProps) {
  const windowWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: profileImage || "/assets/icons/profile.svg" }} style={styles.profileImage} />
      </View>
      <Text style={styles.nickname}>세침한 세찌{/*{nickname}*/}</Text>
      {/*{isInChat ? ( */}
      <View style={styles.statusRow}>
        <Ionicons name="chatbubbles-outline" size={18} color="rgba(0, 0, 0, 0.5)" />
          <Text style={styles.statusText}>채팅 참여중</Text>
        </View>
      {/*) : (
        <View style={styles.statusRow} />
      )}*/}
      <View style={{ width: windowWidth - 32, alignSelf: "center", marginTop: 4 }}>
        <GradientLine />
      </View>
      <View style={styles.diceCountContainer}>
        <View style={styles.diceCountRow}>
          <Text style={styles.diceCount}>My Dice</Text>
          <Dice />
        </View>
        <Text style={styles.diceCount}>{diceCount}개</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 0,
    marginTop: -100,
    width: "100%",
  },
  profileImageContainer: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    backgroundColor: "#F9F9FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#B19ADE",
  },
  profileImage: {
    width: PROFILE_SIZE - 8,
    height: PROFILE_SIZE - 8,
    borderRadius: (PROFILE_SIZE - 8) / 2,
  },
  nickname: {
    fontFamily: "Pretendard-Bold",
    fontSize: 18,
    color: "#7d7d7d",
    marginTop: 4,
    textAlign: "center",
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    marginTop: 8,
    minHeight: 22,
  },
  statusText: {
    fontFamily: "Pretendard",
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
    marginLeft: 8,
    fontWeight: '600',
  },
  diceCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 양쪽으로 균등하게 배치
    width: "75%", // 너비를 지정하여 가운데 정렬
    marginBottom: 16,
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
});
