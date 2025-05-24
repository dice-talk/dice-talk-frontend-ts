import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Easing, Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import LetterForm from '../../assets/images/event/LetterForm.svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// 이미지 경로
const LETTER_IMAGES = [
  require('../../assets/images/event/love_letter_01.png'),
  require('../../assets/images/event/love_letter_02.png'),
  require('../../assets/images/event/love_letter_03.png'),
  require('../../assets/images/event/love_letter_04.png'),
  require('../../assets/images/event/love_letter_05.png'),
  require('../../assets/images/event/love_letter_06.png'),
];

interface EnvelopeAnimationProps {
  onAnimationComplete?: () => void;
  content?: React.ReactNode;
  autoPlay?: boolean;
}

const EnvelopeAnimation: React.FC<EnvelopeAnimationProps> = ({
  onAnimationComplete,
  content,
  autoPlay = false,
}) => {
  // 애니메이션 상태
  const [isOpen, setIsOpen] = useState(false);
  // 편지 내용 상태 추가
  const [letterText, setLetterText] = useState('');
  
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
  
  // autoPlay가 true면 자동으로 애니메이션 시작
  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        playAnimation();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // 보내기 버튼 클릭 핸들러
  const handleSendPress = () => {
    // 보내기 버튼 클릭 시 페이드 아웃 애니메이션 후 콜백 호출
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      // 여기서 onAnimationComplete 콜백을 호출하여 부모 컴포넌트에 완료를 알림
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };
  
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
            <View style={styles.mainLetterImageWrapper}>
              <Image
                source={require('../../assets/images/event/love_event_write.png')}
                style={styles.mainLetterImage}
                resizeMode="contain"
              />
            </View>
            <Animated.View style={[styles.mainLetterSvgWrapper, { opacity: letterFormOpacity }]}>
              <LetterForm width="100%" height="100%" />
            </Animated.View>
            <Animated.View style={[styles.letterInputWrapper, { opacity: letterTextOpacity }]}>
              <TextInput
                style={styles.letterInput}
                placeholder="마음에 드는 상대에게 보낼 내용을 작성해주세요"
                placeholderTextColor="#F9BCC1"
                value={letterText}
                onChangeText={setLetterText}
                multiline
              />
            </Animated.View>
            <Animated.View style={[styles.sendButtonWrapper, { opacity: letterTextOpacity }]}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !isLetterValid() && styles.sendButtonDisabled
                ]}
                onPress={handleSendPress}
                disabled={!isLetterValid()}
              >
                <Text style={[
                  styles.sendButtonText,
                  !isLetterValid() && styles.sendButtonTextDisabled
                ]}>보내기</Text>
              </TouchableOpacity>
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
  },
  mainLetterImageWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    left: -SCREEN_WIDTH * 0.135,
    zIndex: 0,
  },
  mainLetterImage: {
    width: '100%',
    height: '100%',
  },
  mainLetterSvgWrapper: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    zIndex: 1,
    top: SCREEN_WIDTH * 0.15,
  },
  letterInputWrapper: {
    position: 'absolute',
    width: '90%',
    top: SCREEN_WIDTH * 0.52,
    zIndex: 200,
  },
  letterInput: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 10,
    color: '#F9BCC1',
    height: SCREEN_HEIGHT * 0.1,
    textAlignVertical: 'top',
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
});

export default EnvelopeAnimation; 