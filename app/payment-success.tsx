import { confirmTossPayment } from '@/api/paymentApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

/**
 * 결제 성공 처리 페이지
 */
export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { paymentKey, orderId, amount } = params;
  
  const [isConfirming, setIsConfirming] = useState(true);
  const [message, setMessage] = useState('결제 승인 중입니다...');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      // ... 필수 정보 누락 시 에러 처리
      return;
    }

    const confirmPayment = async () => {
      try {
        await confirmTossPayment({
          paymentKey: String(paymentKey),
          orderId: String(orderId),
          amount: Number(amount),
        });

        Alert.alert('결제 성공', '결제가 최종적으로 완료되었습니다.', [
          { text: '확인', onPress: () => router.replace('/(tabs)/profile/ChargePage') },
        ]);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || '결제 승인에 실패했습니다.';
        Alert.alert('결제 승인 실패', errorMessage, [
          { text: '확인', onPress: () => router.replace('/(tabs)/profile/ChargePage') },
        ]);
      } finally {
        setIsConfirming(false);
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, router]);

  return (
    <View style={styles.container}>
      {isConfirming ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Text style={styles.text}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16 },
}); 