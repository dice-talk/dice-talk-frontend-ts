import { attemptAutoLogin } from '@/api/authApi'; // 자동 로그인 함수 임포트
import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // Zustand 스토어 임포트
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// 앱 초기 스플래시 화면을 숨기지 않도록 설정
SplashScreen.preventAutoHideAsync();

// #############################################################################
// 앱 초기화 로직 (컴포넌트 외부 또는 최상단에서 한 번만 실행되도록 시도)
// #############################################################################
let appInitializationPromise: Promise<boolean> | null = null;

const initializeAppGlobally = async () => {
  console.log('initializeAppGlobally: 앱 전역 초기화 시작...');
  const { isAutoLoginAttempted, setIsAutoLoginAttempted } = useMemberInfoStore.getState();

  if (isAutoLoginAttempted) {
    console.log('initializeAppGlobally: 이미 자동 로그인 시도됨. 추가 실행 안 함.');
    // 이미 시도했다면, 이전 결과를 기다리거나 반환해야 할 수 있으나,
    // 여기서는 RootLayout의 useEffect에서 isAutoLoginAttempted 상태를 참조하므로,
    // 여기서 바로 반환해도 큰 문제는 없을 것으로 예상됨.
    // 다만, 로그인 성공 여부를 반환해야 한다면 이전 attemptAutoLogin의 결과를 알아야 함.
    // 현재 attemptAutoLogin은 로그인 성공 여부를 반환함.
    // 이 함수는 로그인 성공 여부 자체보다는 '초기화가 시작되었는가'에 초점.
    return useMemberInfoStore.getState().token ? true : false; // 단순히 현재 토큰 유무로 반환 (개선 여지 있음)
  }

  console.log('initializeAppGlobally: 자동 로그인 첫 시도.');
  // setIsAutoLoginAttempted(true); // attemptAutoLogin 내부에서 호출되므로 여기서 중복 호출 필요 없음
  const loginSuccess = await attemptAutoLogin(); // attemptAutoLogin 내부에서 isAutoLoginAttempted=true 설정
  console.log('initializeAppGlobally: attemptAutoLogin 결과:', loginSuccess);
  // isAppInitialized는 RootLayout에서 모든 조건 만족 시 설정
  return loginSuccess;
};

// 앱 로드 시 한 번만 이 함수를 호출하여 Promise를 생성
// RootLayout이 여러 번 마운트 되어도 이 Promise는 하나만 존재
if (!appInitializationPromise) {
  console.log('RootLayout Module Scope: appInitializationPromise 없음. initializeAppGlobally 호출하여 생성.');
  appInitializationPromise = initializeAppGlobally();
} else {
  console.log('RootLayout Module Scope: appInitializationPromise 이미 존재함.');
}
// #############################################################################

export default function RootLayout() {
  console.log('RootLayout: 컴포넌트 렌더링 시작.');

  // 폰트 로딩
  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "digital": require("../assets/fonts/digital-7.ttf"),
  });

  const router = useRouter();

  // Zustand 스토어에서 상태 구독
  const { 
    token, // 현재 로그인된 토큰 (자동 로그인 성공 시 여기에 값 존재)
    isAutoLoginAttempted, // 자동 로그인 시도 여부
    isAppInitialized,     // 앱 최종 준비 완료 여부
    setIsAppInitialized   // 앱 준비 완료 상태 변경 액션
  } = useMemberInfoStore();

  console.log(`RootLayout Render State: fontsLoaded=${fontsLoaded}, fontError=${!!fontError}, token=${!!token}, isAutoLoginAttempted=${isAutoLoginAttempted}, isAppInitialized=${isAppInitialized}`);

  useEffect(() => {
    console.log('RootLayout useEffect: 실행됨. Dependencies - [fontsLoaded, fontError, isAutoLoginAttempted, token, router, setIsAppInitialized]');
    
    // appInitializationPromise가 완료되기를 기다림 (선택적: 이미 위에서 호출했으므로 상태만 봐도 됨)
    // 하지만 상태 변화에 따른 반응이므로, 상태를 직접 보는 것이 더 React 스러움
    appInitializationPromise?.then(loginSuccessFromPromise => {
        console.log('RootLayout useEffect: appInitializationPromise 완료. loginSuccessFromPromise:', loginSuccessFromPromise);
        // 이 시점의 isAutoLoginAttempted는 true여야 함 (initializeAppGlobally에서 설정)
        // 이 시점의 token 상태는 initializeAppGlobally -> attemptAutoLogin을 통해 업데이트 되었을 수 있음

        if (fontsLoaded || fontError) { // 1. 폰트 로딩 완료 (또는 에러)
            console.log('RootLayout useEffect: 폰트 로딩 완료/에러 조건 충족.');
            if (isAutoLoginAttempted) { // 2. 자동 로그인 시도 완료
                console.log('RootLayout useEffect: 자동 로그인 시도 완료 조건 충족.');
                
                // 아직 앱 최종 준비가 안 되었다면, 라우팅 및 스플래시 처리
                if (!isAppInitialized) {
                    console.log('RootLayout useEffect: 앱 최종 준비 안됨. 라우팅 및 스플래시 처리 시작.');
                    if (token) { // Zustand 스토어의 토큰 유무로 최종 로그인 상태 판단
                        console.log('RootLayout useEffect: 토큰 존재. 홈으로 이동.');
                        router.replace('/(tabs)/home');
                    } else {
                        console.log('RootLayout useEffect: 토큰 없음. 로그인 화면으로 이동.');
                        router.replace('/(onBoard)');
                    }

                    SplashScreen.hideAsync().then(() => {
                        console.log('RootLayout useEffect: 스플래시 화면 숨김 완료.');
                        setIsAppInitialized(true); // 모든 준비 완료
                        console.log('RootLayout useEffect: isAppInitialized = true 설정 완료.');
                    }).catch(e => {
                        console.error('RootLayout useEffect: 스플래시 화면 숨기기 실패:', e);
                        setIsAppInitialized(true); // 실패해도 앱은 준비된 것으로 간주 (흰 화면 방지)
                        console.log('RootLayout useEffect: (스플래시 실패 시) isAppInitialized = true 설정 완료.');
                    });
                } else {
                    console.log('RootLayout useEffect: 앱 이미 최종 준비 완료됨 (isAppInitialized=true). 추가 작업 없음.');
                }
            } else {
                console.log('RootLayout useEffect: 자동 로그인 시도 아직 완료 안됨 (isAutoLoginAttempted=false). 대기.');
                // 이 경우는 initializeAppGlobally가 아직 isAutoLoginAttempted를 true로 못 바꾼 상황.
                // 또는 appInitializationPromise가 너무 빨리 resolve 된 경우 (이론상 가능성은 낮음)
            }
        } else {
            console.log('RootLayout useEffect: 폰트 로딩 아직 안됨. 대기.');
        }
    }).catch(error => {
        console.error("RootLayout useEffect: appInitializationPromise 처리 중 에러 발생", error);
        // 심각한 초기화 오류. 로그인 화면으로 보내고 앱 준비된 것으로 처리 (선택적)
        if (!isAppInitialized) {
            router.replace('/(onBoard)/Login');
            SplashScreen.hideAsync().finally(() => setIsAppInitialized(true));
        }
    });

    // useEffect의 클린업 함수는 여기서 특별히 할 일 없음
    return () => {
        console.log('RootLayout useEffect: 클린업 함수 실행.');
    };
    // 의존성 배열: 이 값들이 변경될 때마다 useEffect가 재실행
    // token: 자동 로그인 성공 후 변경
    // isAutoLoginAttempted: 자동 로그인 시도 후 변경
    // isAppInitialized: 모든 준비 완료 후 변경
}, [fontsLoaded, fontError, isAutoLoginAttempted, token, router, setIsAppInitialized, isAppInitialized]);


  // 1. 폰트가 로딩 중이면 아무것도 표시하지 않음 (스플래시 화면이 계속 보임)
  if (!fontsLoaded && !fontError) {
    console.log('Render: 폰트 로딩 중... (null 반환)');
    return null;
  }

  // 2. 폰트 로딩은 끝났지만, 앱이 최종적으로 준비되지 않았다면 아무것도 표시하지 않음
  if (!isAppInitialized) {
    console.log(`Render: 앱 최종 준비 안됨 (isAppInitialized=${isAppInitialized}). (null 반환)`);
    return null;
  }

  // 모든 준비가 완료되면 실제 앱 UI 렌더링
  console.log('Render: 앱 준비 완료! UI 렌더링.');
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        {/* <Stack.Screen name="(onBoard)" options={{ headerShown: false }} /> */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Loading" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
