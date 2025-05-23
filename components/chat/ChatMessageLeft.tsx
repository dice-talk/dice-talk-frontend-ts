import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessageProps {
  profileImage: string | React.FC<SvgProps>;   // 프로필 이미지 URL, 로컬 경로 또는 SVG 컴포넌트
  nickname: string;
  message: string;
  time: string;
  isConsecutive?: boolean; // 연속된 메시지인지 여부
  showTime?: boolean; // 시간을 표시할지 여부
}

const ChatMessageLeft = ({ 
  profileImage, 
  nickname, 
  message, 
  time, 
  isConsecutive = false,
  showTime = true
}: ChatMessageProps) => {
  const ProfileImage = profileImage as React.FC<SvgProps>;
  
  return (
    <View style={[
      styles.container, 
      isConsecutive && styles.consecutiveContainer
    ]}>
      {/* 프로필 이미지와 닉네임 - 연속 메시지가 아닐 때만 표시 */}
      {!isConsecutive && (
        <>
          {typeof profileImage === 'string' ? (
      <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImage}>
              <View style={styles.svgContainer}>
                <ProfileImage width="60%" height="60%" />
              </View>
            </View>
          )}
      <View style={styles.messageWrapper}>
        <Text style={styles.nickname}>{nickname}</Text>

            {/* 말풍선 박스와 시간 */}
            <View style={styles.bubbleContainer}>
        <View style={styles.bubble}>
          <Text style={styles.message}>{message}</Text>
        </View>
              {showTime && <Text style={styles.time}>{time}</Text>}
            </View>
          </View>
        </>
      )}

      {/* 연속 메시지일 때는 메시지만 표시 */}
      {isConsecutive && (
        <View style={styles.consecutiveMessageWrapper}>
          <View style={styles.bubbleContainer}>
            <View style={[styles.bubble, styles.consecutiveBubble]}>
              <Text style={styles.message}>{message}</Text>
            </View>
            {showTime && <Text style={styles.time}>{time}</Text>}
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
    color: "#984A78",
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
    color: "#A88B9D",
    marginBottom: SCREEN_HEIGHT * 0.005,
  },
});