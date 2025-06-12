import { confirmTossPayment } from '@/api/paymentApi';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

console.log('--- [ROUTING] payment-success.tsx 파일 로드됨 ---');

type PaymentStatus = 'pending' | 'success' | 'error';

/**
 * 결제 결과 처리 페이지
 */
export default function PaymentSuccessScreen() {
  const params = useGlobalSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const { paymentKey, orderId, amount } = params;

        if (!paymentKey || !orderId || !amount) {
          Alert.alert("잘못된 접근", "올바르지 않은 경로입니다.", [
            { text: '확인', onPress: () => router.replace('/(tabs)/home') },
          ]);
          return;
        }

        await confirmTossPayment({
          paymentKey: String(paymentKey),
          orderId: String(orderId),
          amount: Number(amount),
        });

        setStatus('success');

      } catch (error: any) {
        const message = error?.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        setErrorMessage(message);
        setStatus('error');
      }
    };

    processPayment();
  }, [params, router]);

  // 결제 상태가 변경되면 3초 후 페이지 이동
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        router.replace('/profile/ChargePage');
      }, 2000);

      return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
    }
  }, [status, router]);

  if (status === 'pending') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.text}>결제 승인 중입니다. 잠시만 기다려주세요...</Text>
      </View>
    );
  }

  if (status === 'success') {
    return (
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={80} color="#007bff" />
        <Text style={styles.title}>결제를 완료했어요</Text>
        <Text style={styles.subtitle}>2초 후 충전 페이지로 이동합니다.</Text>
      </View>
    );
  }

  // status === 'error'
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={80} color="#FBC02D" />
      <Text style={styles.title}>결제를 실패했어요</Text>
      <Text style={styles.subtitle}>{errorMessage}</Text>
      <Text style={styles.subtitle}>3초 후 충전 페이지로 이동합니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 20 },
  text: { fontSize: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
}); 