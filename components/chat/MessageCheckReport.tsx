import HanaSvg from '@/assets/images/chat/hana.svg';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// SVGProps와 호환되는 ProfileImageType 정의
type ProfileImageType = React.FC<any>;

// 신고 메시지 타입 정의
interface ReportMessage {
  id: number;
  profileImage: any;
  nickname: string;
  message: string;
  time: string;
  isChecked?: boolean;
  isConsecutive?: boolean; // 연속된 메시지인지 여부
  showTime?: boolean; // 시간을 표시할지 여부
}

interface MessageCheckReportProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  onCheckedChange?: (hasChecked: boolean) => void; // 체크 상태 변경 콜백
}

const MessageCheckReport: React.FC<MessageCheckReportProps> = ({ onConfirm, onCancel, onCheckedChange }) => {
  // 샘플 신고 메시지 데이터
  const [messages, setMessages] = useState<ReportMessage[]>([
    {
      id: 1,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "다들 어제 개봉한 펩시 vs 콜라 영화 보셨나요?",
      time: "오후 6:58",
      isChecked: false,
      isConsecutive: false,
      showTime: true
    },
    {
      id: 2,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "정말 재밌어서 추천드려요",
      time: "오후 6:58",
      isChecked: false,
      isConsecutive: true,
      showTime: true
    },
  ]);

  // 메시지 체크 상태 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    const hasCheckedMessage = messages.some(message => message.isChecked);
    if (onCheckedChange) {
      onCheckedChange(hasCheckedMessage);
    }
  }, [messages, onCheckedChange]);

  // 메시지 체크 상태 토글 함수
  const toggleCheck = (id: number) => {
    setMessages(
      messages.map(message => 
        message.id === id 
          ? { ...message, isChecked: !message.isChecked } 
          : message
      )
    );
  };

  // 각 메시지 렌더링 함수 - ChatMessageLeft와 유사하게 구현하되 체크박스 추가
  const renderMessage = (message: ReportMessage) => {
    const ProfileImage = message.profileImage as ProfileImageType;
    
    return (
      <View style={[
        styles.container, 
        message.isConsecutive && styles.consecutiveContainer
      ]} key={message.id}>
        {/* 체크 가능한 동그라미 */}
        <TouchableOpacity 
          style={styles.checkCircle} 
          onPress={() => toggleCheck(message.id)}
        >
          {message.isChecked ? (
            <Ionicons name="checkmark-circle" size={SCREEN_WIDTH * 0.07} color="#EF5A52" />
          ) : (
            <Ionicons name="ellipse-outline" size={SCREEN_WIDTH * 0.07} color="#EF5A52" />
          )}
        </TouchableOpacity>
        
        {/* 프로필 이미지와 닉네임 - 연속 메시지가 아닐 때만 표시 */}
        {!message.isConsecutive && (
          <>
            {typeof message.profileImage === 'string' ? (
              <Image source={{ uri: message.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImage}>
                <View style={styles.svgContainer}>
                  <ProfileImage width="60%" height="60%" />
                </View>
              </View>
            )}
            <View style={styles.messageWrapper}>
              <Text style={styles.nickname}>{message.nickname}</Text>

              {/* 말풍선 박스와 시간 */}
              <View style={styles.bubbleContainer}>
                <View style={styles.bubble}>
                  <Text style={styles.message}>{message.message}</Text>
                </View>
                {message.showTime && <Text style={styles.time}>{message.time}</Text>}
              </View>
            </View>
          </>
        )}

        {/* 연속 메시지일 때는 메시지만 표시 */}
        {message.isConsecutive && (
          <View style={styles.consecutiveMessageWrapper}>
            <View style={styles.bubbleContainer}>
              <View style={[styles.bubble, styles.consecutiveBubble]}>
                <Text style={styles.message}>{message.message}</Text>
              </View>
              {message.showTime && <Text style={styles.time}>{message.time}</Text>}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* 상단 타이틀과 메시지 목록 */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>신고할 메시지를 선택해주세요</Text>
        
        {/* 메시지 목록 */}
        <View style={styles.messagesContainer}>
          {messages.map(renderMessage)}
        </View>
      </View>
    </View>
  );
};

export default MessageCheckReport;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between', // 콘텐츠와 버튼 사이에 공간 분배
  },
  contentContainer: {
    flex: 1,
    padding: SCREEN_WIDTH * 0.02,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#984A78",
    marginBottom: 15,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1, // 나머지 공간 차지
  },
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
  checkCircle: {
    marginRight: SCREEN_WIDTH * 0.01,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    height: SCREEN_WIDTH * 0.09,
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
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  consecutiveMessageWrapper: {
    maxWidth: SCREEN_WIDTH * 0.7,
    marginLeft: SCREEN_WIDTH * 0.17, // 프로필 이미지와 체크박스 공간 유지
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
    maxWidth: SCREEN_WIDTH * 0.6,
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