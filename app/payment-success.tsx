import { confirmTossPayment } from '@/api/paymentApi';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

console.log('--- [ROUTING] payment-success.tsx 파일 로드됨 ---');

/**
 * 결제 성공 처리 페이지
 */
export default function PaymentSuccessScreen() {
  const params = useGlobalSearchParams();
  const router = useRouter();

  console.log('--- [DATA] 수신된 파라미터:', JSON.stringify(params, null, 2));

  useEffect(() => {
    const processPayment = async () => {
      try {
        const { paymentKey, orderId, amount } = params;

        if (!paymentKey || !orderId || !amount) {
          // 이 페이지는 토스 결제 후 돌아오는 리디렉션 URL이므로,
          // 파라미터가 없다면 잘못된 접근으로 간주하고 메인으로 보냅니다.
          Alert.alert("잘못된 접근", "올바르지 않은 경로입니다.", [
            { text: '확인', onPress: () => router.replace('/(tabs)/home') },
          ]);
          return;
        }

        // 백엔드에 최종 결제 승인 요청
        await confirmTossPayment({
          paymentKey: String(paymentKey),
          orderId: String(orderId),
          amount: Number(amount),
        });

        Alert.alert('결제 성공', '결제가 성공적으로 완료되었습니다.', [
          { text: '확인', onPress: () => router.replace('/(tabs)/home') }, // 성공 시 홈 화면으로 이동
        ]);

      } catch (error: any) {
        // 에러 로그를 콘솔에 상세히 출력하여 디버깅
        console.error("결제 승인 에러:", JSON.stringify(error, null, 2));

        const errorMessage = error?.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        Alert.alert('결제 승인 실패', `${errorMessage}\n다시 시도해주세요.`, [
          { text: '확인', onPress: () => router.replace('/profile/ChargePage') }, // 실패 시 다시 충전 페이지로 이동
        ]);
      }
    };

    processPayment();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.text}>결제 승인 중입니다. 잠시만 기다려주세요...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  text: { fontSize: 16 },
}); 