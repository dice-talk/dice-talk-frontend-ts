import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import useChat from '@/utils/useChat';
import Logo from '@/assets/images/login/logo_icon.svg';
import { getChatRoomInfo } from '@/api/ChatApi'; // getChatRoomInfo 임포트
import { router } from 'expo-router';
import useHomeStore from '@/zustand/stores/HomeStore'; // HomeStore 임포트 (actions 접근 위해)
import useChatOptionStore from '@/zustand/stores/ChatOptionStore'; // ChatOptionStore 임포트

export default function LoadingScreen() {
  console.log('--- LoadingScreen Component Render Start ---');

  const { client, isConnected, joinQueue, queueStatus } = useChat(undefined, [], { autoConnect: true });
  const [matchingStatusMessage, setMatchingStatusMessage] = useState('✨ 매칭 상대를 찾고 있어요...');

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;

  const { setChatRoomId: setHomeChatRoomId } = useHomeStore((state) => state.actions);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const handleMatchingSuccess = async (matchedChatRoomId: number) => {
      setMatchingStatusMessage('매칭 성공! 채팅방 정보를 가져오는 중...');
      // 1. HomeStore에 chatRoomId 설정
      setHomeChatRoomId(matchedChatRoomId);

      try {
        // 2. ChatOptionStore에서 themeId 가져오기
        const themeIdFromOptionStore = useChatOptionStore.getState().themeId;

        // 3. getChatRoomInfo 호출하여 ChatRoomStore 업데이트 (ChatRoom 진입에 필요)
        //    이 함수는 HomeStore의 chatRoomId를 사용하며, ChatRoomStore를 채웁니다.
        //    반환되는 roomDetails는 ChatRoomStore가 잘 채워졌는지 확인하는 용도로 사용할 수 있습니다.
        const roomDetails = await getChatRoomInfo();

        if (roomDetails && themeIdFromOptionStore !== null && themeIdFromOptionStore !== undefined) {
          setMatchingStatusMessage('채팅방 정보 로드 완료! 이동합니다...');
          router.replace({
            pathname: '/chat/ChatRoom', // ChatRoom.tsx 파일의 경로
            params: {
              chatRoomId: String(matchedChatRoomId),
              themeId: String(themeIdFromOptionStore), // ChatOptionStore에서 가져온 themeId 사용
            },
          });
        } else {
          console.error(
            '[LoadingScreen] 채팅방 상세 정보 로드 실패 또는 ChatOptionStore에 themeId가 없습니다.',
            { roomDetails, themeIdFromOptionStore }
          );
          setMatchingStatusMessage('채팅방 정보를 준비하는데 실패했습니다. 홈으로 이동합니다.');
          router.replace('/(tabs)/home');
        }
      } catch (error) {
        console.error('[LoadingScreen] getChatRoomInfo 호출 중 오류 발생:', error);
        setMatchingStatusMessage('채팅방 정보를 가져오는 중 오류가 발생했습니다. 홈으로 이동합니다.');
        router.replace('/(tabs)/home');
      }
    };

    if (isConnected && client) {
      console.log('[LoadingScreen] WebSocket 연결됨, 대기열 등록…');
      joinQueue();
      setMatchingStatusMessage('✨ 매칭 상대를 찾고 있어요...');
      subscription = client.subscribe('/sub/matching/status', (frame) => {
        const data = JSON.parse(frame.body);
        
        if (data.type === 'MATCHED' && data.chatRoomId) {
          console.log('[LoadingScreen] 매칭 완료:', data.chatRoomId);
          handleMatchingSuccess(data.chatRoomId);
        }
      });
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        console.log('[LoadingScreen] Unsubscribed from /sub/matching/status');
      }
    };
  }, [client, isConnected, joinQueue, setHomeChatRoomId]); // 의존성 배열에 setHomeChatRoomId 추가

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(textColorAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(textColorAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [rotateAnim, textColorAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const animatedTextColor = textColorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#F9A8D4', '#8B5CF6', '#60A5FA'],
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: '#8B5CF6', marginTop: -50 }]}>대기실</Text>
           {/* 실시간 대기열 인원·참여자 표시 */}
     <Text style={{ fontSize: 16, marginBottom: 4 }}>
       현재 대기열 인원: {queueStatus.count}명
     </Text>
     <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
       ({queueStatus.participants.join(', ')})
     </Text>
      <View style={styles.circleContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg height="280" width="280" viewBox="0 0 280 280">
            <Defs>
              <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#8B5CF6" stopOpacity="1" />
                <Stop offset="1" stopColor="#EC4899" stopOpacity="1" />
              </SvgGradient>
            </Defs>
            <Circle
              cx="140"
              cy="140"
              r="130"
              stroke="url(#grad)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
        <View style={styles.logoContainer}>
          <Logo width={180} height={180} />
        </View>
      </View>
      <Animated.Text style={[styles.messageText, { color: animatedTextColor }]}>  
        {matchingStatusMessage}
      </Animated.Text>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  circleContainer: ViewStyle;
  logoContainer: ViewStyle;
  messageText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  circleContainer: {
    position: 'relative',
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 16,
    marginTop: 40,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});