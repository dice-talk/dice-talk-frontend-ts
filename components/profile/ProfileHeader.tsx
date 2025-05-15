// src/components/Profile/ProfileHeader.tsx
import Dice from "@/assets/images/profile/dice.svg";
import GradientLine from "@/components/common/GradientLine";
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, View } from "react-native";

type ProfileHeaderProps = {
  nickname: string;
  profileImage: string;
  diceCount: number;
  isInChat: boolean;
};

export default function ProfileHeader({
  nickname,
  profileImage,
  diceCount,
  isInChat,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
      <Image source={{ uri: profileImage || "/assets/icons/profile.svg" }} style={styles.profileImage} />
      </View>
      <Text style={styles.nickname}>{nickname}</Text>
      {isInChat && (
        <View style={styles.statusRow}>
          <Ionicons name="chatbubbles-outline" size={18} color="#B28EF8" style={{ marginRight: 2 }} />
          <Ionicons name="ellipsis-horizontal-outline" size={13} color="#B28EF8" style={{ position: 'absolute', left: 13, top: 7 }} />
          <Text style={styles.statusText}>채팅 참여중</Text>
        </View>
      )}
      <GradientLine />
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
    paddingVertical: 16,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F9F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  nickname: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
    minHeight: 22,
  },
  statusText: {
    fontSize: 14,
    color: '#B28EF8',
    marginLeft: 22,
    fontWeight: '600',
  },
  diceCountContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 8,
    gap: 180,
  },
  diceCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  diceCount: {
    fontSize: 16,
    marginTop: 4,
  },
});
