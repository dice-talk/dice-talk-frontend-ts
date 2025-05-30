import { attemptAutoLogin } from '@/api/authApi'; // 자동 로그인 함수 임포트
// import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // 기존 스토어 임포트 제거
import useAuthStore from '@/zustand/stores/authStore'; // 새로운 authStore 임포트
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
  // Zustand 스토어에서 직접 getter를 사용하는 대신, 스토어 액션을 통해 상태를 변경하고,
  // 컴포넌트 내에서 구독을 통해 상태 변화에 반응하는 것이 일반적입니다.
  // 여기서는 attemptAutoLogin을 호출하고 그 결과를 반환하는 데 집중합니다.
  // isAutoLoginAttempted 상태는 attemptAutoLogin 내부 및 authStore에서 관리됩니다.
  
  // 자동 로그인을 시도하기 전에 authStore의 isAutoLoginAttempted 상태를 확인하여 중복 실행 방지 (선택적 강화)
  // 다만, appInitializationPromise 자체가 한 번만 실행되도록 하므로 이중 방어임.
  if (useAuthStore.getState().isAutoLoginAttempted && appInitializationPromise) {
    console.log('initializeAppGlobally: 이미 자동 로그인 시도됨 또는 진행 중. 현재 토큰 상태 반환.');
    return useAuthStore.getState().accessToken ? true : false;
  }

  console.log('initializeAppGlobally: 자동 로그인 첫 시도 또는 Promise 재생성.');
  const loginSuccess = await attemptAutoLogin(); // attemptAutoLogin은 내부에서 isAutoLoginAttempted=true 설정
  console.log('initializeAppGlobally: attemptAutoLogin 결과:', loginSuccess);
  return loginSuccess;
};

if (!appInitializationPromise) {
  console.log('RootLayout Module Scope: appInitializationPromise 없음. initializeAppGlobally 호출하여 생성.');
  appInitializationPromise = initializeAppGlobally();
} else {
  console.log('RootLayout Module Scope: appInitializationPromise 이미 존재함. (핫 리로드 등으로 인해 재실행될 수 있음)');
  // 핫 리로드 시 이전 Promise가 완료되지 않았을 수 있으므로, 상태를 보고 다시 실행할지 결정할 수 있습니다.
  // 예를 들어, authStore의 isAutoLoginAttempted가 false이면 다시 시도할 수 있습니다.
  if (!useAuthStore.getState().isAutoLoginAttempted) {
    console.log('RootLayout Module Scope: isAutoLoginAttempted가 false이므로 초기화 Promise 재생성 시도');
    appInitializationPromise = initializeAppGlobally();
  }
}
// #############################################################################

export default function RootLayout() {
  console.log('RootLayout: 컴포넌트 렌더링 시작.');

  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "digital": require("../assets/fonts/digital-7.ttf"),
  });

  const router = useRouter();

  // 새로운 authStore에서 상태 및 액션 구독
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAutoLoginAttempted = useAuthStore((state) => state.isAutoLoginAttempted);
  const isAppInitialized = useAuthStore((state) => state.isAppInitialized);
  const { setAppInitialized } = useAuthStore((state) => state.actions);

  console.log(`RootLayout Render State: fontsLoaded=${fontsLoaded}, fontError=${!!fontError}, accessToken=${!!accessToken}, isAutoLoginAttempted=${isAutoLoginAttempted}, isAppInitialized=${isAppInitialized}`);

  useEffect(() => {
    console.log('RootLayout useEffect: 실행됨. Dependencies 업데이트됨.');
    
    // initializeAppGlobally Promise가 완료되기를 기다립니다.
    // 이 Promise는 앱 로드 시 한 번만 실행되어 자동 로그인을 시도합니다.
    appInitializationPromise?.then(loginSuccessFromPromise => {
        console.log('RootLayout useEffect: appInitializationPromise 완료. loginSuccessFromPromise:', loginSuccessFromPromise);
        // 이 시점에 isAutoLoginAttempted는 attemptAutoLogin 내부에서 true로 설정되었어야 합니다.
        // accessToken 상태는 attemptAutoLogin을 통해 업데이트 되었을 수 있습니다.

        if (fontsLoaded || fontError) { 
            console.log('RootLayout useEffect: 폰트 로딩 완료/에러 조건 충족.');
            // isAutoLoginAttempted 상태가 true가 될 때까지 기다리거나, 
            // appInitializationPromise가 완료된 시점을 기준으로 판단합니다.
            // 여기서는 appInitializationPromise가 완료되었으므로, 자동 로그인 시도는 끝난 것으로 간주합니다.
            
            if (!isAppInitialized) { // 아직 앱 최종 준비가 안 되었다면, 라우팅 및 스플래시 처리
                console.log('RootLayout useEffect: 앱 최종 준비 안됨. 라우팅 및 스플래시 처리 시작.');
                if (accessToken) { // authStore의 accessToken 유무로 최종 로그인 상태 판단
                    console.log('RootLayout useEffect: accessToken 존재. 홈으로 이동.');
                    router.replace('/(tabs)/home');
                } else {
                    console.log('RootLayout useEffect: accessToken 없음. 로그인 화면으로 이동.');
                    router.replace('/(onBoard)');
                }

                SplashScreen.hideAsync().then(() => {
                    console.log('RootLayout useEffect: 스플래시 화면 숨김 완료.');
                    setAppInitialized(true); // 모든 준비 완료
                    console.log('RootLayout useEffect: isAppInitialized = true 설정 완료.');
                }).catch(e => {
                    console.error('RootLayout useEffect: 스플래시 화면 숨기기 실패:', e);
                    setAppInitialized(true); 
                    console.log('RootLayout useEffect: (스플래시 실패 시) isAppInitialized = true 설정 완료.');
                });
            } else {
                console.log('RootLayout useEffect: 앱 이미 최종 준비 완료됨 (isAppInitialized=true). 추가 작업 없음.');
            }
        } else {
            console.log('RootLayout useEffect: 폰트 로딩 아직 안됨. 대기.');
        }
    }).catch(error => {
        console.error("RootLayout useEffect: appInitializationPromise 처리 중 에러 발생", error);
        if (!isAppInitialized) {
            router.replace('/(onBoard)'); // 에러 발생 시 안전하게 로그인 화면으로
            SplashScreen.hideAsync().finally(() => setAppInitialized(true));
        }
    });

    return () => {
        console.log('RootLayout useEffect: 클린업 함수 실행.');
    };
}, [fontsLoaded, fontError, router, setAppInitialized, isAppInitialized, accessToken]); // isAutoLoginAttempted를 의존성 배열에서 제거하고, accessToken으로 로그인 상태 변화를 감지


  if (!fontsLoaded && !fontError) {
    console.log('Render: 폰트 로딩 중... (null 반환)');
    return null;
  }

  // isAppInitialized 상태를 사용하여 스플래시 화면을 제어하고 초기 렌더링을 결정합니다.
  // initializeAppGlobally와 useEffect가 비동기적으로 실행되므로,
  // isAppInitialized가 true가 될 때까지는 스플래시 화면이 유지되거나 null이 반환됩니다.
  if (!isAppInitialized) {
    console.log(`Render: 앱 최종 준비 안됨 (isAppInitialized=${isAppInitialized}). (null 반환)`);
    return null;
  }

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
