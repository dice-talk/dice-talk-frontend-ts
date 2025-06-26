import { axiosWithoutToken } from "@/api/axios/axios";
import * as Crypto from "expo-crypto";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === "active") {
        console.log("📱 앱 복귀 감지됨 (AppState)");

        // [핵심] txId가 있고, 아직 처리 중이 아닐 때만 로직 실행
        if (txId && !isProcessing) {
          setIsProcessing(true); // 처리 시작 플래그 설정
          setLoading(true); // 로딩 UI 표시
          console.log("🚀 Toss 인증 성공 처리 시작 (txId:", txId, ")");

          try {
            const { data } = await axiosWithoutToken.post(`/auth/cert?txId=${txId}`);
            console.log("✅ 사용자 정보:", data);

            setLoading(false); // 로딩 UI 숨김

            if (onAuthSuccess) {
              onAuthSuccess({ ...data, txId: txId });
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
            setLoading(false);
            showAlert("오류", "인증 정보 확인에 실패했습니다.");
          }
        }
      }
    };

    const appStateSubscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      appStateSubscription.remove();
    };
  }, [txId, isProcessing, onAuthSuccess, router, targetScreen]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)", // 반투명 배경
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
})
