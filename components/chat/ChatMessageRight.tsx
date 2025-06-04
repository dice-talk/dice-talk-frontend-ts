import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessageProps {
  profileImage: string | React.FC<SvgProps>;   // 프로필 이미지 URL, 로컬 경로 또는 SVG 컴포넌트
  nickname: string;
  message: string;
  time: string;
  isConsecutive?: boolean; // 연속된 메시지인지 여부
  showTime?: boolean; // 시간을 표시할지 여부
  onPressProfile?: () => void;
}

const ChatMessageRight = ({
  profileImage,
  nickname,
  message,
  time,
  isConsecutive = false,
  showTime = true,
  onPressProfile,
}: ChatMessageProps) => {
  const ProfileImage = profileImage as React.FC<SvgProps>;
  const curThemeId = useHomeStore((state) => state.curThemeId);

  const bubbleColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const profileBorderColor = curThemeId === 2 ? "#6DA0E1" : "#F9BCC1";
  const nicknameColor = curThemeId === 2 ? "#5C5279" : "#F9BCC1";
  const timeColor = curThemeId === 2 ? "#5C5279" : "#A88B9D";
  const profileIconColor = curThemeId === 2 ? "#9FC9FF" : "#F9BCC1";
  
  return (
    <View style={[
      styles.container, 
      isConsecutive && styles.consecutiveContainer
    ]}>
      {/* 연속 메시지가 아닐 때 - 프로필, 닉네임, 메시지 표시 */}
      {!isConsecutive && (
        <>
          <View style={styles.messageWrapper}>
            <Text style={[styles.nickname, { color: nicknameColor }]}>{nickname}</Text>
            {/* 말풍선 박스와 시간 */}
            <View style={styles.bubbleContainer}>
              {showTime && <Text style={[styles.time, { color: timeColor }]}>{time}</Text>}
              <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
                <Text style={styles.message}>{message}</Text>
              </View>
            </View>
          </View>
          {typeof profileImage === 'string' ? (
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
        </>
      )}
      {/* 연속 메시지일 때는 메시지만 표시 */}
      {isConsecutive && (
        <View style={styles.consecutiveMessageWrapper}>
          <View style={styles.bubbleContainer}>
            {showTime && <Text style={[styles.time, { color: timeColor }]}>{time}</Text>}
            <View style={[styles.bubble, styles.consecutiveBubble, { backgroundColor: bubbleColor }]}>
              <Text style={styles.message}>{message}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ChatMessageRight;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: 0, // 패딩 제거하여 오른쪽으로 더 붙이기
    paddingRight: SCREEN_WIDTH * 0.01, // 오른쪽에만 약간의 패딩 추가
    justifyContent: "flex-end",
  },
  consecutiveContainer: {
    marginTop: SCREEN_HEIGHT * 0.001, // 연속 메시지일 때 간격 더 줄이기
  },
  profileImage: {
    width: SCREEN_WIDTH * 0.09,
    height: SCREEN_WIDTH * 0.09,
    borderRadius: SCREEN_WIDTH * 0.045,
    marginLeft: SCREEN_WIDTH * 0.01, // 이미지와 메시지 사이 간격 줄이기
    borderWidth: 1,
    borderColor: "#F9BCC1",
    overflow: 'hidden',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageWrapper: {
    maxWidth: SCREEN_WIDTH * 0.75,
    alignItems: "flex-end",
  },
  consecutiveMessageWrapper: {
    maxWidth: SCREEN_WIDTH * 0.75,
    marginRight: SCREEN_WIDTH * 0.1, // 프로필 이미지 공간 유지
  },
  nickname: {
    fontSize: SCREEN_WIDTH * 0.034,
    color: "#F9BCC1",
    marginBottom: SCREEN_HEIGHT * 0.002,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SCREEN_WIDTH * 0.015,
  },
  bubble: {
    backgroundColor: "#F9BCC1",
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.03,
    borderTopRightRadius: 0,
    maxWidth: SCREEN_WIDTH * 0.65, // 말풍선 최대 너비 증가
  },
  consecutiveBubble: {
    borderTopRightRadius: SCREEN_WIDTH * 0.03, // 연속 메시지는 모든 모서리 둥글게
  },
  message: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: "#ffffff",
  },
  time: {
    fontSize: SCREEN_WIDTH * 0.026,
    color: "#A88B9D",
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
}); 