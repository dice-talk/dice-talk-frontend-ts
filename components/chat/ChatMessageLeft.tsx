import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// 시스템 프로필 기본 이미지 import
import profileDefault from "@/assets/images/profile/profile_default.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// SVGProps와 호환되는 ProfileImageType 정의
type ProfileImageType = React.FC<any>;

interface ChatMessageProps {
  profileImage: string | ProfileImageType;   // 프로필 이미지 URL, 로컬 경로 또는 SVG 컴포넌트
  nickname: string;
  message: string;
  time: string;
  isConsecutive?: boolean; // 연속된 메시지인지 여부
  showTime?: boolean; // 시간을 표시할지 여부
  onPressProfile?: () => void;
}

const ChatMessageLeft = ({ 
  profileImage, 
  nickname, 
  message, 
  time, 
  isConsecutive = false,
  showTime = true,
  onPressProfile,
}: ChatMessageProps) => {
  const ProfileImage = profileImage as ProfileImageType;
  const curThemeId = useHomeStore((state) => state.curThemeId);
  
  // 특정 닉네임 목록
  const specialNicknames = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];

  let nicknameColor = curThemeId === 2 ? "#5C5279" : "#984A78";
  let timeColor = curThemeId === 2 ? "#5C5279" : "#A88B9D";
  let bubbleColor = curThemeId === 2 ? "#B8C5E0" : "#DEBBDF";
  let profileBorderColor = curThemeId === 2 ? "#9FC9FF" : "#D4B6D4";
  let profileIconColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";

  // 요청된 조건: themeId가 1이고, 닉네임이 specialNicknames에 포함될 경우
  if (curThemeId === 1 && specialNicknames.includes(nickname)) {
    profileBorderColor = "#9FC9FF";
    profileIconColor = "#9FC9FF";
  }

  // 시스템 닉네임일 때는 profile_default.png 사용
  const isSystem = nickname === "시스템";

  return (
    <View style={[
      styles.container, 
      isConsecutive && styles.consecutiveContainer
    ]}>
      {/* 프로필 이미지와 닉네임 - 연속 메시지가 아닐 때만 표시 */}
      {!isConsecutive && (
        <>
          {isSystem ? (
            <Image source={profileDefault} style={[styles.profileImage, { borderColor: profileBorderColor }]} />
          ) : typeof profileImage === 'string' ? (
            <Image source={{ uri: profileImage }} style={[styles.profileImage, { borderColor: profileBorderColor }]} />
          ) : (
            <TouchableOpacity onPress={onPressProfile}>
              <View style={[styles.profileImage, { borderColor: profileBorderColor }]}>
                <View style={styles.svgContainer}>
                  <ProfileImage width="60%" height="60%" color={profileIconColor} />
                </View>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.messageWrapper}>
            <Text style={[styles.nickname, { color: nicknameColor }]}>{nickname}</Text>

            {/* 말풍선 박스와 시간 */}
            <View style={styles.bubbleContainer}>
              <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
                <Text style={styles.message}>{message}</Text>
              </View>
              {showTime && <Text style={[styles.time, { color: timeColor }]}>{time}</Text>}
            </View>
          </View>
        </>
      )}

      {/* 연속 메시지일 때는 메시지만 표시 */}
      {isConsecutive && (
        <View style={styles.consecutiveMessageWrapper}>
          <View style={styles.bubbleContainer}>
            <View style={[styles.bubble, styles.consecutiveBubble, { backgroundColor: bubbleColor }]}>
              <Text style={styles.message}>{message}</Text>
            </View>
            {showTime && <Text style={[styles.time, { color: timeColor }]}>{time}</Text>}
          </View>
        </View>
      )}
    </View>
  );
};

export default ChatMessageLeft;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: 0, // 패딩 제거하여 왼쪽으로 더 붙이기
    paddingLeft: SCREEN_WIDTH * 0.01, // 왼쪽에만 약간의 패딩 추가
    position: "relative",
    zIndex: 1,
  },
  consecutiveContainer: {
    marginTop: SCREEN_HEIGHT * 0.001, // 연속 메시지일 때 간격 더 줄이기
  },
  profileImage: {
    width: SCREEN_WIDTH * 0.09,
    height: SCREEN_WIDTH * 0.09,
    borderRadius: SCREEN_WIDTH * 0.045,
    marginRight: SCREEN_WIDTH * 0.01, // 이미지와 메시지 사이 간격 줄이기
    borderWidth: 1,
    borderColor: "#D4B6D4",
    overflow: 'hidden',
    zIndex: 2,
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageWrapper: {
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  consecutiveMessageWrapper: {
    maxWidth: SCREEN_WIDTH * 0.75,
    marginLeft: SCREEN_WIDTH * 0.1, // 프로필 이미지 공간 유지
  },
  nickname: {
    fontSize: SCREEN_WIDTH * 0.034,
    marginBottom: SCREEN_HEIGHT * 0.002,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SCREEN_WIDTH * 0.015,
  },
  bubble: {
    backgroundColor: "#DEBBDF",
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.03,
    borderTopLeftRadius: 0,
    maxWidth: SCREEN_WIDTH * 0.65, // 말풍선 최대 너비 증가
  },
  consecutiveBubble: {
    borderTopLeftRadius: SCREEN_WIDTH * 0.03, // 연속 메시지는 모든 모서리 둥글게
  },
  message: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: "#ffffff",
  },
  time: {
    fontSize: SCREEN_WIDTH * 0.026,
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
});