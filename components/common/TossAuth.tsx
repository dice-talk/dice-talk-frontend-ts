import { axiosWithoutToken } from "@/api/axios/axios";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, Modal, StyleSheet, View } from "react-native";
import uuid from "react-native-uuid";
import AlertModal from "./AlertModal";

// ✅ 사용자 정보 타입 정의
type TossUserInfo = {
  name: string;
  birth: string;
  gender: string;
};

// onAuthSuccess 콜백이 전달하는 데이터 타입을 명확히 정의 (txId 포함)
export type TossAuthSuccessData = TossUserInfo & {
  txId: string;
};

type TossAuthProps = {
  onAuthSuccess?: (authData: TossAuthSuccessData) => void;
  targetScreen?: "/(onBoard)/register/SignupInput"
  onAuthFailure?: () => void;
};

export default function TossAuth({ onAuthSuccess, targetScreen = "/(onBoard)/register/SignupInput", onAuthFailure }: TossAuthProps) {
  const router = useRouter();
  const [txId, setTxId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  // AlertModal 상태 추가
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const handleAlertConfirm = () => {
    setIsAlertVisible(false);
    // 확인 버튼을 누르면 실패 콜백을 호출하고, 뒤로가기를 시도합니다.
    if (onAuthFailure) {
      onAuthFailure();
    }
    // if (router.canGoBack()) {
    //   router.back();
    // }
  };

  // ✅ Toss 인증 요청
  useEffect(() => {
    const requestToss = async () => {
      try {
        // ✅ axios를 사용하여 인증 요청
        const { data } = await axiosWithoutToken.post("/auth/request");
        console.log("✅ 인증 요청 응답:", data);
        setTxId(data.txId);

        // ✅ Toss 인증 URL 요청
        const appUriRes = await fetch(
          `https://cert.toss.im/api-client/v1/transactions/${data.txId}`
        );
        console.log("appUriRes", appUriRes);
        const appUriData = await appUriRes.json();
        console.log("appUriData", appUriData);
        if (appUriData.resultType === "SUCCESS") {
          const tossUri = appUriData.success.appUri.ios;
          console.log("🚀 Linking.openURL으로 열려는 최종 URI:", tossUri);
          await Linking.openURL(tossUri); // Toss 앱 실행
        } else {
          throw new Error(appUriData.error?.reason || "Toss 인증 오류");
        }
      } catch (err) {
        console.error("❌ Toss 인증 요청 실패:", err);
        showAlert("오류", "Toss 인증 요청 또는 실행에 실패했습니다.");
      } finally {
        console.log("✅ Toss 인증 요청 종료");
        // Toss 앱으로 넘어가기 직전에 로딩을 풀지 않아, 사용자가 앱으로 돌아왔을 때도 로딩 상태가 유지되도록 함
        // setLoading(false); 
      }
    };

    requestToss();
  }, []);

  // ✅ 세션키 생성 (필요 시)
  const createSessionKey = async (): Promise<string> => {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const base64Key = Buffer.from(randomBytes).toString("base64");
    const uuidKey = uuid.v4();
    return `v1$${uuidKey}$${base64Key}`;
  };

  // ✅ 앱 복귀 감지 (AppState) 및 초기/실행 중 URL 처리 (Linking)
  useEffect(() => {
    // 앱 상태 변경 처리 (백그라운드 -> 포그라운드)
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        console.log("📱 앱 복귀 감지됨 (AppState)");
        try {
          const initialUrl = await Linking.getInitialURL();
          console.log("🔗 Retrieved Initial URL (on AppState change):", initialUrl);
          if (initialUrl && !pendingUrl) { 
            // pendingUrl이 이미 다른 경로(addEventListener)로 설정되지 않았을 경우에만 설정
            console.log("🔗 초기 URL 설정 (AppState):", initialUrl);
            setPendingUrl(initialUrl);
          }
        } catch (e) {
          console.warn("🔗 AppState change: Failed to get initial URL", e);
        }
      }
      appState.current = nextState;
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    // 실행 중인 앱으로 들어오는 딥링크 처리
    const handleDeepLink = (event: { url: string }) => {
      console.log("🔗 딥링크 이벤트 수신 (addEventListener):", event.url);
      if (event.url) {
        setPendingUrl(event.url);
      }
    };

    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);

    // 컴포넌트 마운트 시 초기 URL 확인
    Linking.getInitialURL().then(url => {
      if (url && !pendingUrl) { // pendingUrl이 이미 설정되지 않았을 경우에만
        console.log("🔗 Retrieved Initial URL (on mount):", url);
        setPendingUrl(url);
      }
    }).catch(err => console.warn("🔗 Mount: Failed to get initial URL", err));

    return () => {
      appStateSubscription.remove();
      linkingSubscription.remove();
    };
  }, [pendingUrl]); // pendingUrl을 디펜던시 배열에 추가하여 중복 설정을 방지

  // ✅ txId와 복귀 URL이 모두 준비됐을 때 실행
  useEffect(() => {
    // fetchUserInfo 로직을 useEffect 내부로 이동
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        console.log("✅ 사용자 정보 조회 시작");
  
        // ✅ axios를 사용하여 사용자 정보 조회
        const { data } = await axiosWithoutToken.post(`/auth/cert?txId=${txId}`);
        console.log("✅ 사용자 정보:", data);
  
        // 로딩 화면을 먼저 숨기고, 그 다음에 성공 콜백을 호출합니다.
        setLoading(false);

        // ✅ 사용자 정보 페이지로 이동 (회원가입으로 연결)
        if (onAuthSuccess) {
          // data (사용자 정보)와 현재 컴포넌트의 state인 txId를 함께 전달
          if (txId) { // txId가 유효한지 한번 더 확인
            onAuthSuccess({ ...data, txId: txId }); // txId 추가
          } else {
            console.error("❌ fetchUserInfo: txId가 유효하지 않아 onAuthSuccess 호출 불가");
            showAlert("인증 오류", "인증 트랜잭션 ID가 없습니다. 다시 시도해주세요.");
          }
        } else {
          router.replace({
            pathname: targetScreen,
            params: { 
              name: data.name,
              phone: data.phone,
              birth: data.birth,
              gender: data.gender,
            },
          });
        }
  
      } catch (err) {
        console.error("❌ 사용자 정보 요청 실패:", err);
        setLoading(false); // 오류 발생 시에도 로딩은 중단
        showAlert("오류", "인증 정보 확인에 실패했습니다.");
      } 
      // finally 블록 제거: 성공/실패 경로에서 setLoading을 개별적으로 처리
    };

    const tryProcess = async () => {
      console.log("✅ txId와 복귀 URL이 모두 준비됐을 때 실행", txId, pendingUrl);
      if (!txId || !pendingUrl) return;

      // pendingUrl에 txId가 포함되어 있는지, 또는 특정 경로인지 등을 확인하여
      // 정말 Toss 인증 후 돌아온 URL인지 검증하는 로직을 추가할 수 있습니다.
      // 예: if (!pendingUrl.includes("success")) return; 

      if (txId) {
        console.log("🚀 Toss 인증 성공 처리 시작");
        await fetchUserInfo();
      } else {
        showAlert("인증 실패", "다시 시도해주세요.");
      }

      setPendingUrl(null); // ✅ 중복 방지
    };

    tryProcess();
  }, [txId, pendingUrl, onAuthSuccess, onAuthFailure, router, targetScreen]);

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ 로딩 모달 */}
      <Modal visible={loading} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B28EF8" />
          </View>
        </View>
      </Modal>

      {/* ✅ 오류 알림 모달 */}
      <AlertModal
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onConfirm={handleAlertConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
})
