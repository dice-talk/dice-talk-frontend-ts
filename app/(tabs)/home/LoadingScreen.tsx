import { useRouter } from 'expo-router'; // expo-router의 useRouter로 변경
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';
// Logo 컴포넌트의 상대 경로는 LoadingScreen.tsx 파일 위치에 따라 조정 필요
// 예: assets 폴더가 프로젝트 루트에 있다면 ../../../assets/images/login/logo_icon.svg
import Logo from '@/assets/images/login/logo_icon.svg';

interface LoadingProps {
  waitingCount?: number; // URL 파라미터 또는 props로 받을 수 있음
}

export default function LoadingScreen() {
  const router = useRouter(); // useRouter 사용
  // waitingCount를 URL 파라미터로 받으려면 useLocalSearchParams 사용 가능
  // const { waitingCount = 1 } = useLocalSearchParams<LoadingScreenProps>();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;
  const [joined, setJoined] = useState<boolean>(false);

  // waitingCount prop을 직접 받거나, searchParams에서 가져오도록 수정 가능
  // 이 예제에서는 props로 받는다고 가정하고, 기본값을 설정합니다.
  // 실제 사용 시 OptionPageAge에서 파라미터로 넘겨주거나, 여기서 useLocalSearchParams로 받아야 합니다.
  const waitingCountProp: LoadingProps['waitingCount'] = 1; // 임시 기본값

  useEffect(() => {
    Animated.parallel([
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(textColorAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(textColorAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, [rotateAnim, textColorAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const textColorOutputRange: string[] = ['#F9A8D4', '#8B5CF6', '#60A5FA'];
  const animatedTextColor = textColorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: textColorOutputRange,
  });

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: '#8B5CF6', marginTop: -50 }]}>대기실</Text>
      <View style={styles.circleContainer}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg height="280" width="280" viewBox="0 0 280 280">
            <Defs>
              <SvgGradient id='grad' x1='0' y1='0' x2='1' y2='1'>
                <Stop offset='0' stopColor='#8B5CF6' stopOpacity='1' />
                <Stop offset='1' stopColor='#EC4899' stopOpacity='1' />
              </SvgGradient>
            </Defs>
            <Circle
              cx='140'
              cy='140'
              r='130'
              stroke='url(#grad)'
              strokeWidth='10'
              strokeLinecap='round'
              fill='none'
            />
          </Svg>
        </Animated.View>
        <View style={styles.logoContainer}>
          {/* Logo 컴포넌트의 width, height prop 타입이 SvgProps를 따르는지 확인 필요 */}
          <Logo width={180} height={180} />
        </View>
      </View>
        <Animated.Text style={[styles.messageAfterJoin, { color: animatedTextColor }]}>
          ✨ 누군가 마음을 열 준비를 하고 있어요
        </Animated.Text>
      <Animated.Text style={[styles.waitingCountText, { color: animatedTextColor }]}>
        현재 {waitingCountProp}명이 기다리고 있어요
      </Animated.Text>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  circleContainer: ViewStyle;
  logoContainer: ViewStyle;
  joinButton: ViewStyle;
  gradient: ViewStyle;
  buttonText: TextStyle;
  messageAfterJoin: TextStyle;
  waitingCountText: TextStyle; // 스타일 이름 변경
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
  joinButton: {
    width: 200,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 40,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  messageAfterJoin: {
    fontSize: 16,
    marginTop: 40,
    fontWeight: '600',
  },
  waitingCountText: { // 스타일 이름 waitingCount -> waitingCountText로 변경 (상태 변수명과 충돌 방지)
    fontSize: 14,
    marginTop: 10,
    fontWeight: '500',
  },
}); 