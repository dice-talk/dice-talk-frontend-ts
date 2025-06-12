import { failTossPayment } from '@/api/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * 결제 실패 처리 페이지
 */
export default function PaymentFailScreen() {
  const params = useGlobalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // 백엔드에 실패 사실을 알리는 로직 (선택적)
    const reportFailure = async () => {
      try {
        const { orderId, message, code } = params;
        if (orderId && message && code) {
          await failTossPayment({
            orderId: String(orderId),
            message: String(message),
            code: String(code),
          });
        }
      } catch (error: any) {
        console.error("결제 실패 정보 전송 실패:", error);
      }
    };

    reportFailure();

    // 3초 후에 충전 페이지로 자동 이동
    const timer = setTimeout(() => {
      router.replace('/profile/ChargePage');
    }, 3000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, [params, router]);

  const errorMessage = params.message ? String(params.message) : '알 수 없는 오류가 발생했습니다.';
  const errorCode = params.code ? `(코드: ${params.code})` : '';

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={80} color="#FBC02D" />
      <Text style={styles.title}>결제를 실패했어요</Text>
      <Text style={styles.subtitle}>{`${errorMessage} ${errorCode}`.trim()}</Text>
      <Text style={styles.subtitle}>3초 후 충전 페이지로 이동합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
}); 