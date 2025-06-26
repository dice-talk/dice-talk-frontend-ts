import LetterForm from '@/assets/images/event/LetterForm.svg';
import FriendLetterForm from '@/assets/images/event/friend_letterForm.svg';
import useEventMessageStore, { EventMessageData } from "@/zustand/stores/SecretMessageStore"; // EventMessageStore 및 타입 임포트
import { sendRoomEvent } from '@/api/EventApi'; // API 호출 함수 임포트
import axios from 'axios'; // isAxiosError 사용을 위해 임포트
import React, { useEffect, useRef, useState, useCallback } from "react";
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 이미지 경로
const LOVE_LETTER_IMAGES = [
  require('@/assets/images/event/love_letter_01.png'),
  require('@/assets/images/event/love_letter_02.png'),
  require('@/assets/images/event/love_letter_03.png'),
  require('@/assets/images/event/love_letter_04.png'),
  require('@/assets/images/event/love_letter_05.png'),
  require('@/assets/images/event/love_letter_06.png'),
];

const FRIEND_LETTER_IMAGES = [
  require('@/assets/images/event/friend_letter_01.png'),
  require('@/assets/images/event/friend_letter_02.png'),
  require('@/assets/images/event/friend_letter_03.png'),
  require('@/assets/images/event/friend_letter_04.png'),
  require('@/assets/images/event/friend_letter_05.png'),
  require('@/assets/images/event/friend_letter_06.png'),
];

interface EnvelopeAnimationProps {
  onAnimationComplete?: () => void;
  content?: React.ReactNode;
  autoPlay?: boolean;
  isReadOnly?: boolean; // 읽기 전용 모드 (받은 편지 보기)
  messages?: string[]; // 읽기 전용 모드일 때 표시할 메시지 배열
}

const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({
  onAnimationComplete,
  content,
  autoPlay = false,
  isReadOnly = false, // 기본값은 false (쓰기 모드)
  messages = [],    // 기본값은 빈 배열
}) => {
  const curThemeId = useHomeStore((state) => state.curThemeId);
  // 애니메이션 상태
  const [isOpen, setIsOpen] = useState(false);
  // 편지 내용 상태 추가
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [letterText, setLetterText] = useState('');
  
  // EventMessageStore에서 updateEventMessage 액션 가져오기
  const { updateEventMessage } = useEventMessageStore();

  // 테마에 따른 이미지 선택
  const LETTER_IMAGES = curThemeId === 2 ? FRIEND_LETTER_IMAGES : LOVE_LETTER_IMAGES;
  const mainLetterImage = curThemeId === 2 
    ? require('@/assets/images/event/friend_letter_main.png')
    : require('@/assets/images/event/love_event_write.png');

  // 테마별 색상 설정
  const placeholderColor = curThemeId === 2 ? "#6DA0E1" : "#F9BCC1";
  const textColor = curThemeId === 2 ? "#6DA0E1" : "#F9BCC1";
  const sendButtonColor = curThemeId === 2 ? "#6DA0E1" : "#FEBFC8";
  const sendButtonBorderColor = curThemeId === 2 ? "#6DA0E1" : "#FFD9DF";

  // 메인 편지 애니메이션 값
  const letterOffset = useRef(new Animated.Value(0)).current;
  const letterScale = useRef(new Animated.Value(0.6)).current;
  const letterOpacity = useRef(new Animated.Value(0)).current;
  const letterFormOpacity = useRef(new Animated.Value(0)).current;
  const letterTextOpacity = useRef(new Animated.Value(0)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;
  
  // 쌓여있는 편지들 애니메이션 값 (아래로 조금씩 쌓이게)
  const stackedLetters = useRef(
    LETTER_IMAGES.map((_, index) => ({
      opacity: new Animated.Value(0),
      position: new Animated.ValueXY({
        x: 0,
        y: index * -10, // 편지가 아래로 조금씩 쌓이게
      }),
      rotation: new Animated.Value(index * 2 - 5), // 회전도 살짝 차이 나게
      scale: new Animated.Value(0.8),
    }))
  ).current;
  
  // 편지 내용이 있는지 확인하는 함수
  const isLetterValid = () => {
    return letterText.trim().length > 0;
  };
  
  // 애니메이션 실행
  const playAnimation = () => {
    if (isOpen) return;
    
    setIsOpen(true);
    
    // 쌓인 편지들이 하나씩 나타나는 애니메이션
    const stackedLettersAnimations = stackedLetters.map((letter, index) => {
      return Animated.sequence([
        // 지연 시간 (첫 번째 편지는 바로 시작)
        Animated.delay(index * 300),
        // 편지 등장 (동시에 일어날 애니메이션들)
        Animated.parallel([
          // 투명도 변화
          Animated.timing(letter.opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          // 크기 변화
          Animated.timing(letter.scale, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]),
      ]);
    });
    
    // 메인 편지 애니메이션 (마지막 편지가 나타난 후 실행)
    const mainLetterAnimation = Animated.sequence([
      // 마지막 편지가 나타난 후 약간의 대기 시간
      Animated.delay(stackedLetters.length * 300 + 500),
      
      // 메인 편지 등장
      Animated.parallel([
        // 편지 위로 이동 - 중앙에 오도록 조정
        Animated.timing(letterOffset, {
          toValue: 0, // 중앙으로 오도록 0으로 조정
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        // 편지 확대
        Animated.timing(letterScale, {
          toValue: 1.2, // 적절한 크기로 조정
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        // 편지 나타남
        Animated.timing(letterOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(letterFormOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(letterTextOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);
    
    // 모든 애니메이션 병렬 실행 (쌓인 편지들 + 메인 편지)
    Animated.parallel([
      ...stackedLettersAnimations,
      mainLetterAnimation,
    ]).start(() => {
      // 애니메이션 완료 콜백을 보내기 버튼을 클릭할 때만 호출하도록 변경
      // onAnimationComplete 콜백은 보내기 버튼 클릭 시 호출될 것임
      console.log('편지 애니메이션 완료!');
    });
  };
  
  // isReadOnly가 true이거나 autoPlay가 true면 자동으로 애니메이션 시작
  useEffect(() => {
    if (isReadOnly) {
      // isReadOnly가 true이면 지연 없이 바로 애니메이션 시작
      // playAnimation 함수 내부에 이미 isOpen 상태를 체크하는 로직이 있음
      playAnimation();
    } else if (autoPlay) {
      // isReadOnly가 false이고 autoPlay가 true이면 기존 로직대로 500ms 지연 후 시작
      const timer = setTimeout(() => {
        playAnimation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isReadOnly, autoPlay]); // isReadOnly 또는 autoPlay 값이 변경될 때 이 효과를 다시 실행
  
  // isReadOnly 또는 messages prop 변경 시 currentMessageIndex 초기화
  useEffect(() => {
    if (isReadOnly) {
      setCurrentMessageIndex(0);
    }
  }, [isReadOnly, messages]);

  // 보내기 버튼 클릭 핸들러
  const handleSendPress = async () => {
    if (!isLetterValid()) {
      // Toast.show({ type: 'info', text1: '알림', text2: '메시지를 입력해주세요.' });
      console.log("메시지를 입력해주세요."); // 실제 토스트 메시지로 대체하세요.
      return;
    }

    // 1. Zustand 스토어에 메시지 업데이트
    updateEventMessage({ message: letterText });
    // 스토어 업데이트 후 상태 확인
    console.log("📬 EventMessageStore 상태 업데이트 후:", useEventMessageStore.getState());

    // 스토어에서 최신 상태 가져오기
    const currentState = useEventMessageStore.getState();

    // currentEventMessage가 null이거나, 필수 ID들이 없는 경우를 더 안전하게 확인
    // API 호출에 필요한 모든 필드가 있는지 확인하는 것이 좋습니다.
    if (!currentState.currentEventMessage ||
        currentState.currentEventMessage.senderId === undefined || currentState.currentEventMessage.senderId === null || currentState.currentEventMessage.senderId === 0 ||
        currentState.currentEventMessage.receiverId === undefined || currentState.currentEventMessage.receiverId === null || currentState.currentEventMessage.receiverId === 0 ||
        currentState.currentEventMessage.eventId === undefined || currentState.currentEventMessage.eventId === null ||
        currentState.currentEventMessage.chatRoomId === undefined || currentState.currentEventMessage.chatRoomId === null ||
        currentState.currentEventMessage.roomEventType === undefined || currentState.currentEventMessage.roomEventType === ''
    ) {
      console.error("fromId 또는 toId가 스토어에 없거나 유효하지 않습니다. 룸 이벤트를 보낼 수 없습니다.");
      // Toast.show({ type: 'error', text1: '오류', text2: '메시지 전송에 필요한 사용자 정보가 없습니다.' });
      console.log("메시지 전송에 필요한 사용자 정보가 없습니다."); // 실제 토스트 메시지로 대체하세요.
      // API 호출을 건너뛰더라도 애니메이션 완료 처리는 수행
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
      return;
    }

    try {
      // 2. API 호출 (sendRoomEvent)
      const apiResponse = await sendRoomEvent(currentState.currentEventMessage); // 스토어에서 가져온 EventMessageData 객체를 인자로 전달
    } catch (error) {
      console.error("시크릿 메시지 전송 API 호출 중 오류 발생:", error);
      // Toast.show({ type: 'error', text1: '오류', text2: '시크릿 메시지 전송에 실패했습니다. 다시 시도해주세요.' });
      console.log("시크릿 메시지 전송에 실패했습니다. 다시 시도해주세요."); // 실제 토스트 메시지로 대체하세요.
      if (axios.isAxiosError(error) && error.response) {
        console.error("API 오류 상세:", error.response.data, error.response.status);
      }
    }

    // 4. 애니메이션 완료 처리 (페이드 아웃 후 onAnimationComplete 콜백 호출)
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };
  
  // 읽기 전용 모드: 이전 메시지 보기
  const handlePreviousMessage = useCallback(() => {
    setCurrentMessageIndex(prevIndex => Math.max(0, prevIndex - 1));
  }, []);

  // 읽기 전용 모드: 다음 메시지 보기
  const handleNextMessage = useCallback(() => {
    setCurrentMessageIndex(prevIndex => Math.min(messages.length - 1, prevIndex + 1));
  }, [messages.length]);

  // 읽기 전용 모드: 확인 버튼 클릭 핸들러
  const handleReadOnlyConfirm = useCallback(() => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
      // 상태 초기화 (필요한 경우)
      setIsOpen(false);
      setCurrentMessageIndex(0);
      // letterOffset, letterScale 등 애니메이션 값들도 초기화할 수 있음
      // playAnimation()이 다시 호출될 때를 대비
    });
  }, [onAnimationComplete, containerOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Pressable onPress={playAnimation} disabled={isOpen}>
        <View style={styles.animationContainer}>
          {/* 쌓여있는 편지들 (이미지로 표현) */}
          {stackedLetters.map((letter, index) => (
            <Animated.View
              key={`letter-${index}`}
              style={[
                styles.stackedLetterContainer,
                {
                  opacity: letter.opacity,
                  zIndex: index + 1,
                  transform: [
                    { translateX: letter.position.x },
                    { translateY: letter.position.y },
                    { rotate: letter.rotation.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg']
                    })},
                    { scale: letter.scale },
                  ],
                },
              ]}
            >
              <Image
                source={LETTER_IMAGES[index]}
                style={styles.letterImage}
                resizeMode="contain"
              />
            </Animated.View>
          ))}
          
          {/* 메인 편지 (이미지와 LetterForm 함께) */}
          <Animated.View
            style={[
              styles.mainLetter,
              {
                opacity: letterOpacity,
                transform: [
                  { translateY: letterOffset },
                  { scale: letterScale }
                ],
              },
            ]}
          >
                        <View style={curThemeId === 2 ? styles.friendLetterImageWrapper : styles.mainLetterImageWrapper}>
              <Image
                source={mainLetterImage}
                style={curThemeId === 2 ? styles.friendLetterImage : styles.mainLetterImage}
                resizeMode="contain"
              />
            </View>
            {curThemeId === 2 ? (
              <Animated.View style={[styles.friendLetterSvgWrapper, { opacity: letterFormOpacity }]}>
                <FriendLetterForm width="100%" height="100%" />
              
              </Animated.View>
            ) : ( // curThemeId === 1 (love)
            <Animated.View style={[styles.mainLetterSvgWrapper, { opacity: letterFormOpacity }]}>
              <LetterForm width="100%" height="100%" />
            </Animated.View>
            )}

            {/* Content Area: TextInput or ReadOnly Message + Nav */}
            <Animated.View style={[
              curThemeId === 2 ? styles.friendLetterInputWrapper : styles.letterInputWrapper,
              { opacity: letterTextOpacity }
            ]}>
              {isReadOnly ? (
                <View style={styles.readOnlyMessageDisplayArea}>
                  <View style={styles.messageScrollView}>
                    <Text style={[
                      curThemeId === 2 ? styles.friendReceivedMessageText : styles.receivedMessageText,
                      { color: textColor }
                    ]}
                    numberOfLines={6} // 여러 줄 표시, 필요시 ScrollView로 변경 가능
                    ellipsizeMode="tail"
                    >
                      {(messages && messages.length > 0 && messages[currentMessageIndex]) || "메시지를 불러올 수 없습니다."}
                    </Text>
                  </View>
                  {messages && messages.length > 1 && (
                    <View style={styles.navigationButtonsContainer}>
                      <TouchableOpacity onPress={handlePreviousMessage} disabled={currentMessageIndex === 0} style={[styles.navButton, currentMessageIndex === 0 && styles.navButtonDisabled]}>
                        <Text style={styles.navButtonText}>이전</Text>
                      </TouchableOpacity>
                      <Text style={styles.messageCounterText}>{`${currentMessageIndex + 1} / ${messages.length}`}</Text>
                      <TouchableOpacity onPress={handleNextMessage} disabled={currentMessageIndex === messages.length - 1} style={[styles.navButton, currentMessageIndex === messages.length - 1 && styles.navButtonDisabled]}>
                        <Text style={styles.navButtonText}>다음</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : ( // 쓰기 모드
                  <TextInput
                    style={[curThemeId === 2 ? styles.friendLetterInput : styles.letterInput, { color: textColor }]}
                    placeholder="마음에 드는 상대에게 보낼 내용을 작성하세요"
                    placeholderTextColor={placeholderColor}
                    value={letterText}
                    onChangeText={setLetterText}
                    multiline
                    maxLength={150} // 예시: 최대 글자 수 제한
                  />
              )}
            </Animated.View>

            {/* Bottom Button Area: Send or Confirm */}
            <Animated.View style={[styles.sendButtonWrapper, { opacity: letterTextOpacity }]}>
              {isReadOnly ? (
                // 읽기 전용 모드일 때 "확인" 버튼
                  <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: sendButtonColor, borderColor: sendButtonBorderColor }]}
                    onPress={handleReadOnlyConfirm}
                  >
                    <Text style={[styles.sendButtonText]}>확인</Text>
                  </TouchableOpacity>
              ) : (
                // 쓰기 모드일 때 "보내기" 버튼
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: sendButtonColor, borderColor: sendButtonBorderColor },
                    !isLetterValid() && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendPress}
                  disabled={!isLetterValid()}
                >
                  <Text style={[styles.sendButtonText, !isLetterValid() && styles.sendButtonTextDisabled]}>보내기</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: "center",
    justifyContent: "center",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    top: 0,
    left: 0,
    zIndex: 100,
  },
  animationContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
  },
  stackedLetterContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 3,
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  letterImage: {
    width: '110%',
    height: '110%',
  },
  mainLetter: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.6,
    aspectRatio: 0.7,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    top: SCREEN_WIDTH * 0.45,
  },
  mainLetterImageWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1,
    height: SCREEN_WIDTH * 2,
    left: -SCREEN_WIDTH * 0.19,
    top: SCREEN_WIDTH * -0.8,
    zIndex: 0,
  },
  mainLetterImage: {
    width: '100%',
    height: '100%',
  },
  friendLetterImageWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 2.2,
    left: -SCREEN_WIDTH * 0.29,
    top: SCREEN_WIDTH * -0.8,
    zIndex: 0,
  },
  friendLetterImage: {
    width: '100%',
    height: '100%',
  },
  mainLetterSvgWrapper: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    zIndex: 1,
    top: SCREEN_WIDTH * -0.07,
  },
  friendLetterSvgWrapper: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    zIndex: 1,
    top: SCREEN_WIDTH * -0.06,
  },
  letterInputWrapper: {
    position: 'absolute',
    width: '100%',
    top: SCREEN_WIDTH * 0.29,
    zIndex: 200,
    // bottom: SCREEN_WIDTH * 0.2,
  },
  letterInput: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontSize: 11,
    height: SCREEN_HEIGHT * 0.12,
    textAlignVertical: 'top',

  },
  friendLetterInputWrapper: {
    position: 'absolute',
    width: '100%',
    top: SCREEN_WIDTH * 0.29,
    zIndex: 200,
  },
  friendLetterInput: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 11,
    height: SCREEN_HEIGHT * 0.12,
    textAlignVertical: 'top',
  },
  receivedMessageText: { // 받은 메시지 텍스트 스타일
    fontSize: 11,
    marginBottom: 4, // 메시지 간 간격
    lineHeight: 16,
    textAlign: 'center', // 메시지 중앙 정렬
  },
  friendReceivedMessageText: { // 친구 테마 받은 메시지 텍스트 스타일
    fontSize: 11,
    marginBottom: 4,
    lineHeight: 16,
    textAlign: 'center', // 메시지 중앙 정렬
  },
  sendButtonWrapper: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_HEIGHT * 0.04,
    alignItems: 'center',
    zIndex: 200,
  },
  sendButton: {
    backgroundColor: '#FEBFC8',
    paddingHorizontal: 60,
    paddingVertical: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD9DF',
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
    borderColor: '#D0D0D0',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sendButtonTextDisabled: {
    color: '#A0A0A0',
  },
  // 읽기 전용 모드 스타일
  readOnlyMessageDisplayArea: {
    flex: 1, // 부모(letterInputWrapper)의 공간을 채움
    justifyContent: 'space-between', // 메시지와 네비게이션 버튼 공간 분배
    paddingVertical: 4, // TextInput과 유사한 패딩
    paddingHorizontal: 12,
  },
  messageScrollView: {
    flex: 1, // 가능한 많은 공간 차지
    maxHeight: SCREEN_HEIGHT * 0.08, // TextInput 높이보다 약간 작게 설정하여 네비게이션 공간 확보
  },
  navigationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.005, // 메시지 영역과 약간의 간격
    height: SCREEN_HEIGHT * 0.03, // 네비게이션 버튼 높이
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    // backgroundColor: '#f0f0f0', // 버튼 배경색 (테마에 맞게 조정 가능)
    // borderRadius: 5,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 10,
    color: '#333', // 버튼 텍스트 색상 (테마에 맞게 조정 가능)
    fontWeight: '500',
  },
  messageCounterText: {
    fontSize: 10,
    color: '#555', // 카운터 텍스트 색상 (테마에 맞게 조정 가능)
  },
  // confirmButtonReadOnly: { // sendButton 스타일 재활용 가능
  //   backgroundColor: '#FEBFC8', // sendButton과 동일하게
  //   paddingHorizontal: 60,
  //   paddingVertical: 3,
  //   borderRadius: 30,
  //   borderWidth: 2,
  //   borderColor: '#FFD9DF', // sendButton과 동일하게
  // },
});

export default EnvelopeAnimation; 