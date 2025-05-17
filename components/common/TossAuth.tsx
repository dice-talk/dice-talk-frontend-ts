import { axiosWithoutToken } from "@/api/axios/axios";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, AppStateStatus, SafeAreaView } from "react-native";
import uuid from "react-native-uuid";

// ✅ 사용자 정보 타입 정의
type TossUserInfo = {
  name: string;
  phone: string;
  birth: string;
  gender: string;
};

type TossAuthProps = {
  onAuthSuccess?: (userInfo: TossUserInfo) => void;
  targetScreen?: "/(onBoard)/SignUp" // ✅ 인증 성공 후 이동할 페이지 (기본: 회원가입)
  onAuthFailure?: () => void;
};

export default function TossAuth({ onAuthSuccess, targetScreen = "/(onBoard)/SignUp", onAuthFailure }: TossAuthProps) {
  const router = useRouter();
  const [txId, setTxId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);

  // ✅ Toss 인증 요청
  useEffect(() => {
    const requestToss = async () => {
      try {
        // const res = await fetch(`${BASE_URL}/auth/request`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        // });
        const res = await axiosWithoutToken.post("/auth/request");
        const data = res.data;
        //const data = await res.json();
        console.log("✅ 인증 요청 응답:", data);
        setTxId(data.txId);

        const appUriRes = await fetch(
          `https://cert.toss.im/api-client/v1/transactions/${data.txId}`
        );
        const appUriData = await appUriRes.json();

        if (appUriData.resultType === "SUCCESS") {
          const tossUri = appUriData.success.appUri.ios;
          await Linking.openURL(tossUri); // Toss 앱 실행
        } else {
          throw new Error(appUriData.error?.reason || "Toss 인증 오류");
        }
      } catch (err) {
        console.error("❌ Toss 인증 요청 실패:", err);
        Alert.alert("오류", "Toss 인증 요청 또는 실행에 실패했습니다.");
        if (onAuthFailure) onAuthFailure();
      } finally {
        console.log("✅ Toss 인증 요청 종료");
        setLoading(false);
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

  // ✅ 사용자 정보 조회
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      console.log("✅ 사용자 정보 조회 시작");

      // const res = await fetch(`${BASE_URL}/auth/cert?txId=${txId}`, {
      //   method: "POST",
      // });
      const res = await axiosWithoutToken.post(`/auth/cert?txId=${txId}`);
      const data: TossUserInfo = res.data;

      // const data: TossUserInfo = await res.json();
      console.log("✅ 사용자 정보:", data);

      // ✅ 사용자 정보 페이지로 이동 (회원가입으로 연결)
      if (onAuthSuccess) {
        onAuthSuccess(data); // ✅ 콜백 함수로 전달
      } else {
        router.replace({
          pathname: targetScreen,
          params: { 
            name: data.name,
            phone: data.phone,
            birth: data.birth,
          },
        });
      }

    } catch (err) {
      console.error("❌ 사용자 정보 요청 실패:", err);
      Alert.alert("오류", "인증 정보 확인에 실패했습니다.");
      if (onAuthFailure) onAuthFailure();
    } finally {
      setLoading(false);
    }
  };

  // ✅ 앱 복귀 감지 + 딥링크 확인
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      // ✅ 앱이 백그라운드 -> 활성화될 때 딥링크 확인
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        console.log("📱 앱 복귀 감지됨");
        const url = await Linking.getInitialURL();
        if (url) {
          console.log("🔗 복귀 URL:", url);
          setPendingUrl(url);
        }
      }
      appState.current = nextState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // ✅ txId와 복귀 URL이 모두 준비됐을 때 실행
  useEffect(() => {
    const tryProcess = async () => {
      console.log("✅ txId와 복귀 URL이 모두 준비됐을 때 실행", txId, pendingUrl);
      if (!txId || !pendingUrl) return;

      if (txId) {
        console.log("🚀 Toss 인증 성공 처리 시작");
        await fetchUserInfo();
      } else {
        Alert.alert("인증 실패", "다시 시도해주세요.");
      }

      setPendingUrl(null); // ✅ 중복 방지
    };

    tryProcess();
  }, [txId, pendingUrl]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading && <ActivityIndicator size="large" />}
    </SafeAreaView>
  );
}
