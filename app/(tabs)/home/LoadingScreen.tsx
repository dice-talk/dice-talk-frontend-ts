import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import useChat from '@/utils/useChat';
import Logo from '@/assets/images/login/logo_icon.svg';
import useHomeStore from '@/zustand/stores/HomeStore';
import { router } from 'expo-router';

export default function LoadingScreen() {
  console.log('--- LoadingScreen Component Render Start ---');

  const { client, isConnected, joinQueue } = useChat(undefined, [], { autoConnect: true });
  const [matchingStatusMessage, setMatchingStatusMessage] = useState('✨ 매칭 상대를 찾고 있어요...');

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;

  const setHomeChatRoomId = useHomeStore((state) => state.actions.setChatRoomId);

  useEffect(() => {
    if (isConnected && client) {
      console.log('[LoadingScreen] WebSocket 연결됨, 대기열 등록…');
      joinQueue();
      setMatchingStatusMessage('✨ 매칭 상대를 찾고 있어요...');

      const subscription = client.subscribe('/sub/matching/status', (frame) => {
        const data = JSON.parse(frame.body);
        if (data.type === 'MATCHED') {
          console.log('[LoadingScreen] 매칭 완료:', data.chatRoomId);
          setHomeChatRoomId(data.chatRoomId);
          setMatchingStatusMessage('매칭 성공! 홈으로 이동합니다...');
          router.replace('/(tabs)/home');
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [client, isConnected, joinQueue, setHomeChatRoomId]);

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
