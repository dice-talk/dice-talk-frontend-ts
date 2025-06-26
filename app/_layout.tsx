import { attemptAutoLogin } from '@/api/authApi'; // 자동 로그인 함수 임포트
// import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore'; // 기존 스토어 임포트 제거
import useAuthStore from '@/zustand/stores/authStore'; // 새로운 authStore 임포트
import useChatNotificationStore from '@/zustand/stores/chatNotificationStore'; // [추가] 채팅 알림 스토어
import useNotificationStore from '@/zustand/stores/notificationStore'; // [추가] 딥링크 처리를 위한 스토어
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications'; // <<<<<< [추가]
import { SplashScreen, Stack, usePathname, useRouter } from 'expo-router'; // usePathname 추가
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native'; // <<<<<< [수정] AppState 임포트
import 'react-native-reanimated';

// 앱 초기 스플래시 화면을 숨기지 않도록 설정
SplashScreen.preventAutoHideAsync();

// #############################################################################
// 앱 전역 알림 핸들러 설정 (컴포넌트 외부 또는 최상단)
// #############################################################################
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: false, // [수정] 앱이 포그라운드에 있을 때 시스템 알림을 표시하지 않음
    shouldPlaySound: false, // [수정] 소리도 재생하지 않음
    shouldSetBadge: true,   // 앱 아이콘의 뱃지 카운트는 업데이트 (백그라운드/종료 상태에서 유용)
    shouldShowBanner: false, // [추가] 타입 에러 해결을 위해 명시적으로 false 설정
    shouldShowList: false,   // [추가] 타입 에러 해결을 위해 명시적으로 false 설정
  }),
});

// Android 알림 채널 설정 (앱 시작 시 한 번)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: '채팅 알림', // 채널 이름 (사용자에게 보일 수 있음)
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250], // 기본 진동 패턴
    lightColor: '#FF231F7C', // 알림 LED 색상 (지원 기기에서)
  }).catch(err => console.log('Failed to set notification channel:', err));
}
// #############################################################################

// #############################################################################
// 앱 초기화 로직 (컴포넌트 외부 또는 최상단에서 한 번만 실행되도록 시도)
// #############################################################################
let appInitializationPromise: Promise<boolean> | null = null;

const initializeAppGlobally = async () => {
  // Zustand 스토어에서 직접 getter를 사용하는 대신, 스토어 액션을 통해 상태를 변경하고,
  // 컴포넌트 내에서 구독을 통해 상태 변화에 반응하는 것이 일반적입니다.
  // 여기서는 attemptAutoLogin을 호출하고 그 결과를 반환하는 데 집중합니다.
  // isAutoLoginAttempted 상태는 attemptAutoLogin 내부 및 authStore에서 관리됩니다.
  
  // 자동 로그인을 시도하기 전에 authStore의 isAutoLoginAttempted 상태를 확인하여 중복 실행 방지 (선택적 강화)
  // 다만, appInitializationPromise 자체가 한 번만 실행되도록 하므로 이중 방어임.
  if (useAuthStore.getState().isAutoLoginAttempted && appInitializationPromise) {
    return useAuthStore.getState().accessToken ? true : false;
  }

  const loginSuccess = await attemptAutoLogin(); // attemptAutoLogin은 내부에서 isAutoLoginAttempted=true 설정
  return loginSuccess;
};

if (!appInitializationPromise) {
  appInitializationPromise = initializeAppGlobally();
} else {
  // 핫 리로드 시 이전 Promise가 완료되지 않았을 수 있으므로, 상태를 보고 다시 실행할지 결정할 수 있습니다.
  // 예를 들어, authStore의 isAutoLoginAttempted가 false이면 다시 시도할 수 있습니다.
  if (!useAuthStore.getState().isAutoLoginAttempted) {
    appInitializationPromise = initializeAppGlobally();
  }
}
// #############################################################################

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.otf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.otf"),
    "digital": require("../assets/fonts/digital-7.ttf"),
  });

  const router = useRouter();
  const pathname = usePathname(); // 현재 경로 가져오기

  // 새로운 authStore에서 상태 및 액션 구독
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAutoLoginAttempted = useAuthStore((state) => state.isAutoLoginAttempted);
  const isAppInitialized = useAuthStore((state) => state.isAppInitialized);
  const { setAppInitialized } = useAuthStore((state) => state.actions);

  useEffect(() => {
    // ############ [추가] AppState 리스너 설정 ############
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('앱이 활성 상태로 전환되었습니다. 자동 로그인을 시도합니다.');
        // 사용자가 명시적으로 로그아웃한 상태가 아니라면, 자동 로그인을 시도합니다.
        // accessToken이 이미 있다면, 유효성 검사를 다시 할 수도 있습니다. (여기서는 간단히 재시도)
        if (!useAuthStore.getState().accessToken) {
            const loginSuccess = await attemptAutoLogin();
            if(loginSuccess) {
                // 이미 (tabs) 내부에 있다면 굳이 이동할 필요는 없지만,
                // 혹시 다른 페이지에 있다가 돌아온 경우를 대비해 이동시킬 수 있습니다.
                // 현재 라우팅 로직이 복잡하므로, attemptAutoLogin이 상태를 바꾸는 것만으로도 충분할 수 있습니다.
                // 필요하다면 router.replace('/(tabs)/home'); 추가
            }
        }
      }
    });

    return () => {
      subscription.remove();
    };
    // ######################################################
  }, []);

  useEffect(() => {
    // initializeAppGlobally Promise가 완료되기를 기다립니다.
    // 이 Promise는 앱 로드 시 한 번만 실행되어 자동 로그인을 시도합니다.
    appInitializationPromise?.then(loginSuccessFromPromise => {
        // 이 시점에 isAutoLoginAttempted는 attemptAutoLogin 내부에서 true로 설정되었어야 합니다.
        // accessToken 상태는 attemptAutoLogin을 통해 업데이트 되었을 수 있습니다.

        if (fontsLoaded || fontError) { 
            // isAutoLoginAttempted 상태가 true가 될 때까지 기다리거나, 
            // appInitializationPromise가 완료된 시점을 기준으로 판단합니다.
            // 여기서는 appInitializationPromise가 완료되었으므로, 자동 로그인 시도는 끝난 것으로 간주합니다.
            
            if (!isAppInitialized) { // 아직 앱 최종 준비가 안 되었다면, 라우팅 및 스플래시 처리
                // 현재 경로가 온보딩/회원가입 관련이 아닐 때만 자동 라우팅 실행
                if (!pathname.startsWith('/(onBoard)')) {
                    // 자동 로그인이 완료된 이 시점에서, 스토어의 최신 상태를 직접 가져와 최종 판단합니다.
                    const finalAccessToken = useAuthStore.getState().accessToken;
                    const pendingChatRoomId = useNotificationStore.getState().initialChatRoomId;
            
                    if (finalAccessToken && pendingChatRoomId) {
                        // 우선순위 1: 로그인되었고, 처리할 알림이 있는 경우 -> 해당 채팅방으로 이동
                        console.log(`앱 초기화 완료. 보류 중인 알림을 처리합니다. 채팅방 ID: ${pendingChatRoomId}`);
                        router.replace({ // replace를 사용하여 스택에 이전 화면이 남지 않도록 함
                            pathname: '/(tabs)/chat/ChatRoom',
                            params: { chatRoomId: pendingChatRoomId },
                        });
                        // 처리 후에는 반드시 상태를 초기화하여 중복 이동을 방지합니다.
                        useNotificationStore.getState().setInitialChatRoomId(null);
            
                    } else if (finalAccessToken) {
                        // 우선순위 2: 로그인만 된 경우 -> 홈으로 이동
                        router.replace('/(tabs)/home');
                    } else {
                        // 우선순위 3: 로그인 안된 경우 -> 온보딩/로그인 화면으로 이동
                        router.replace('/(onBoard)');
                    }
                }

                SplashScreen.hideAsync().then(() => {
                    setAppInitialized(true); // 모든 준비 완료
                }).catch(e => {
                    console.error('RootLayout useEffect: 스플래시 화면 숨기기 실패:', e); // 이 로그는 에러 상황이므로 남겨둘 수 있습니다.
                    setAppInitialized(true); 
                });
            }
        }
    }).catch(error => {
        console.error("RootLayout useEffect: appInitializationPromise 처리 중 에러 발생", error); // 이 로그는 에러 상황이므로 남겨둘 수 있습니다.
        if (!isAppInitialized) {
            router.replace('/(onBoard)'); // 에러 발생 시 안전하게 로그인 화면으로
            SplashScreen.hideAsync().finally(() => setAppInitialized(true));
        }
    });

    // [추가] 앱이 포그라운드에 있을 때 알림을 '수신'했을 때의 리스너
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received while app in foreground:', notification.request.identifier);
      // '빨간 점'을 표시하기 위해 Zustand 스토어 상태를 업데이트
      useChatNotificationStore.getState().setHasUnread(true);
    });

    // 알림 탭 시 반응 리스너 (앱 전역에서 관리)
    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification Response Received (RootLayout). Storing chatRoomId for deferred navigation.');
      const data = response.notification.request.content.data;
      if (data && typeof data === 'object' && data.chatRoomId) {
        const chatRoomIdValue = String(data.chatRoomId);
        // 즉시 이동하는 대신, chatRoomId를 스토어에 저장합니다.
        useNotificationStore.getState().setInitialChatRoomId(chatRoomIdValue);
        console.log(`Saved chatRoomId: ${chatRoomIdValue} to handle after app initialization.`);
      } else {
        console.log('Notification tap response did not contain a valid chatRoomId.');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationReceivedListener); // [추가] 리스너 제거
      Notifications.removeNotificationSubscription(notificationResponseListener);
    };
  }, [fontsLoaded, fontError, router, setAppInitialized, isAppInitialized, accessToken, pathname]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // isAppInitialized 상태를 사용하여 스플래시 화면을 제어하고 초기 렌더링을 결정합니다.
  // initializeAppGlobally와 useEffect가 비동기적으로 실행되므로,
  // isAppInitialized가 true가 될 때까지는 스플래시 화면이 유지되거나 null이 반환됩니다.
  if (!isAppInitialized) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'fade', // 화면 전환 시 페이드 효과
          animationDuration: 250, // 애니메이션 지속 시간 (0.2초)
          headerShown: false, // 기본적으로 헤더 숨김 (필요시 각 화면에서 제어)
        }}
      >
        <Stack.Screen name="(onBoard)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Loading" options={{ headerShown: false }} />
        <Stack.Screen name="payment-success" options={{ headerShown: false }} />
        <Stack.Screen name="payment-fail" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
