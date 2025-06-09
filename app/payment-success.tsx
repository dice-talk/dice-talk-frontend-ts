import { confirmTossPayment } from '@/api/paymentApi';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

/**
 * 결제 성공 처리 페이지
 */
export default function PaymentSuccessScreen() {
  const params = useGlobalSearchParams();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const processPayment = async () => {
      try {
        const { paymentKey, orderId, amount } = params;

        if (!paymentKey || !orderId || !amount) {
          throw new Error("필수 결제 정보가 누락되었습니다.");
        }

        // 백엔드에 최종 결제 승인 요청
        await confirmTossPayment({
          paymentKey: String(paymentKey),
          orderId: String(orderId),
          amount: Number(amount),
        });

        Alert.alert('결제 성공', '결제가 성공적으로 완료되었습니다.', [
          { text: '확인', onPress: () => navigation.navigate('profile/ChargePage') },
        ]);

      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
        Alert.alert('결제 승인 실패', errorMessage, [
          { text: '확인', onPress: () => navigation.navigate('profile/ChargePage') },
        ]);
      }
    };

    processPayment();
  }, [params, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>결제 승인 중입니다. 잠시만 기다려주세요...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16 },
}); 