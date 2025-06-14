import Footer from "@/components/footer/Footer";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const [currentTab, setCurrentTab] = useState<string>("home");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 초기 경로가 /(tabs) 또는 / 일 때 /home으로 리디렉션
    if (pathname === "/(tabs)" || pathname === "/") {
      setTimeout(() => {
        router.replace("/home");
      }, 0);
    }
  
    // pathname을 기반으로 현재 탭 설정
    const pathSegments = pathname.split("/");
    const currentBaseTab = pathSegments[1] || "home"; // 예: /chat/room -> chat, /home -> home
    if (["home", "history", "chat", "profile", "plus"].includes(currentBaseTab)) {
      setCurrentTab(currentBaseTab);
    }
  }, [pathname, router]);

  // 뒤로가기 버튼 처리 로직
  useEffect(() => {
    const backAction = () => {
      const pathSegments = pathname.split("/");
      const currentScreenBase = pathSegments[1]; // 예: 'home', 'plus'
      const isAtTabRoot = pathSegments.length === 2; // 예: /home, /plus (true), /plus/notice (false)

      // 탭 내의 상세 페이지 (예: /plus/notice)에 있다면 기본 뒤로가기 (-> /plus)
      if (["home", "history", "chat", "profile", "plus"].includes(currentScreenBase) && !isAtTabRoot) {
        // Expo Router의 기본 동작에 맡기거나, 필요시 router.back() 명시
        // 여기서는 BackHandler가 이벤트를 가로채지 않도록 false 반환
        return false; 
      }

      // 현재 화면이 탭의 루트이고, 홈 화면이 아닌 경우 홈으로 이동
      if (isAtTabRoot && currentScreenBase !== "home" && ["history", "chat", "profile", "plus"].includes(currentScreenBase) ) {
        router.replace("/home");
        return true; // 이벤트 처리 완료
      }

      // 현재 화면이 홈 화면의 루트이거나, 위 조건에 해당하지 않으면 기본 동작 수행 (앱 종료 등)
      return false; 
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [pathname, router, currentTab]); // currentTab도 의존성으로 추가 (상황에 따라 필요 없을 수도 있음, pathname으로 충분할 수 있음)

  const handleTabPress = (tabName: string) => {
    const targetPath = `/${tabName}`;

    // 이미 현재 탭의 루트에 있고, 다시 그 탭을 누른 경우 아무것도 하지 않음 (선택적)
    if (currentTab === tabName && pathname === targetPath) {
      return;
    }

    // 현재 활성화된 탭을 다시 누르거나 (다른 화면에 있다가), 다른 탭을 누른 경우
    // 해당 탭의 루트로 이동 (스택 초기화 효과)
    setCurrentTab(tabName);
    router.replace(targetPath as any); // as any로 타입 검사 우회
  };

  // [수정] PaymentScreen에서도 Footer를 표시하지 않도록 조건을 추가합니다.
  const isChatRoomScreen = pathname.startsWith('/chat/ChatRoom');
  const isLoadingScreen = pathname === '/home/LoadingScreen';
  const isPaymentScreen = pathname === '/profile/PaymentScreen';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mainContent}>
          <View style={styles.content}>
            <Slot />
          </View>
          {/* [수정] isPaymentScreen 조건을 추가하여 해당 화면에서 Footer를 숨깁니다. */}
          {!isChatRoomScreen && !isLoadingScreen && !isPaymentScreen && (
          <Footer currentTab={currentTab} onTabPress={handleTabPress} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
