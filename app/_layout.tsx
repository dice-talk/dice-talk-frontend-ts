// import { attemptAutoLogin } from '@/api/authApi'; // 자동 로그인 일시 비활성화
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

// 앱 초기 스플래시 화면을 숨기지 않도록 설정
SplashScreen.preventAutoHideAsync();

// ✅ 타입 선언 (Optional)
type ThemeValue = typeof DarkTheme | typeof DefaultTheme;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "digital": require("../assets/fonts/digital-7.ttf"),
  });

  const router = useRouter();
  const [appReady, setAppReady] = useState(false); // 앱 전체 준비 완료 상태

  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    async function initializeApp() {
      console.log('initializeApp: Starting app initialization...');
      try {
        // 폰트 로딩을 기다리는 로직이 필요함.
        // useFonts는 훅이라 useEffect 밖에서 호출되어야 하고, fontsLoaded 값으로 판단.
        // 이 useEffect는 fontsLoaded/fontError가 바뀔 때마다 실행되는게 아니라, 한번만 실행되어야 함.
        // 따라서, fontsLoaded가 true가 될 때까지 기다리는 polling 방식 또는 다른 접근이 필요할 수 있으나,
        // 일단은 fontsLoaded 상태를 바로 확인하는 식으로 단순화.

        if (!fontsLoaded && !fontError) {
          // 폰트가 아직 로드되지 않았으면, fontsLoaded/fontError가 변경될 때 이 useEffect가 다시 실행되길 기다리지 않음.
          // 이 useEffect는 단 한번 실행되므로, 여기서 바로 fontsLoaded를 체크.
          console.log('initializeApp: Fonts not loaded yet. Waiting for next render cycle if useFonts is async internally.');
          // 이 경우, 아래의 setAppReady(true)가 너무 빨리 호출될 수 있음.
          // 이상적으로는 useFonts의 로딩 완료 콜백이 있다면 좋지만, 없으므로
          // RootLayout 컴포넌트의 렌더링 조건에서 fontsLoaded를 사용해야 함.
          // 여기서는 일단 로직을 최대한 단순화하여 루프를 피하는 데 집중.
        }

        // 폰트 로딩이 완료되었거나 에러 발생 시 (이 시점의 fontsLoaded/fontError 값 기준)
        if (fontsLoaded || fontError) {
          if (fontError) {
            console.error("initializeApp: Error loading fonts:", fontError);
          }
          console.log('initializeApp: Fonts loaded or error occurred. Navigating to Login.');
          if (isMounted) { // 컴포넌트가 여전히 마운트 상태일 때만 router 작업 수행
            router.replace('/(onBoard)/Login');
          }
        }
        // 이 부분은 폰트 로딩 여부와 관계없이 한 번 실행되도록 이동
        console.log('initializeApp: Hiding splash screen and setting app ready.');
        if (isMounted) { // 컴포넌트가 여전히 마운트 상태일 때만 상태 업데이트
          await SplashScreen.hideAsync();
          setAppReady(true);
        }

      } catch (e) {
        console.error('Error during app initialization:', e);
        if (isMounted) {
          await SplashScreen.hideAsync().catch(() => {}); 
          setAppReady(true); // 오류 발생 시에도 앱 준비 상태로 만들어 루프 방지
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 플래그 설정
      console.log('RootLayout: Unmounted');
    };
  }, []); // 의존성 배열을 빈 배열로 설정하여 마운트 시 한 번만 실행

  // 폰트가 로드되지 않았고 에러도 없다면 (로딩 중) 스플래시 유지
  if (!fontsLoaded && !fontError) {
    console.log(`Render: Fonts loading (fontsLoaded: ${fontsLoaded}, fontError: ${!!fontError}). Returning null.`);
    return null;
  }

  // 폰트 로딩은 끝났으나 (성공 또는 실패), 앱 준비가 아직 안 됐으면 스플래시 유지
  if (!appReady) {
    console.log(`Render: Fonts loaded/error, App not ready (appReady: ${appReady}). Returning null.`);
    return null;
  }

  console.log('Render: App is ready. Rendering UI.');
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
