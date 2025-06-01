import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface ChatProfileProps {
  profileImage: React.FC<SvgProps>;
  nickname: string;
  onClose: () => void;
  themeId?: number;
}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const ChatProfile: React.FC<ChatProfileProps> = ({ profileImage: ProfileImage, nickname, onClose, themeId = 1 }) => {
  // 특정 닉네임 목록
  const specialNicknames = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];

  let profileBorderColor = themeId === 2 ? "#9FC9FF" : "#D9B9D9";
  let iconColor = themeId === 2 ? "#9FC9FF" : "#A98BD4";
  let underlineColor = themeId === 2 ? "#9FC9FF" : "#A98BD4";
  let profileIconColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";

  // 요청된 조건: themeId가 1이고, 닉네임이 specialNicknames에 포함될 경우
  if (themeId === 1 && specialNicknames.includes(nickname)) {
    profileBorderColor = "#9FC9FF";
    iconColor = "#9FC9FF";
    underlineColor = "#9FC9FF";
    profileIconColor = "#9FC9FF";
  }
  
  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={iconColor} />
        </TouchableOpacity>
        <View style={[styles.circleBorder, { borderColor: profileBorderColor }]}>
            <ProfileImage 
              width={width * 0.15} 
              height={width * 0.15} 
              color={profileIconColor}
            />
        </View>
        <Text style={styles.nickname}>{nickname}</Text>
        <View style={[styles.underline, { backgroundColor: underlineColor }]} />
      </View>
    </View>
  );
};

export default ChatProfile;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    zIndex: 5,
  },
  modal: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 90,
    paddingHorizontal: 20,
    zIndex: 6,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  circleBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "#D9B9D9",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#96C8FA",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#79B8F5",
  },
  nickname: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
  },
  underline: {
    marginTop: 4,
    width: width * 0.5,
    height: 1,
    backgroundColor: "#A98BD4",
  },
});