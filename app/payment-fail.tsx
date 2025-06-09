import { failTossPayment } from '@/api/paymentApi';
import { useGlobalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

/**
 * 결제 실패 처리 페이지
 */
export default function PaymentFailScreen() {
  const params = useGlobalSearchParams();
  const navigation = useNavigation<any>();

  useEffect(() => {
    const reportFailure = async () => {
      try {
        const { orderId, message, code } = params;
        if (!orderId || !message || !code) {
          throw new Error('필수 실패 정보가 누락되었습니다.');
        }

        // 백엔드에 결제 실패 사실 전송
        await failTossPayment({
          orderId: String(orderId),
          message: String(message),
          code: String(code),
        });

      } catch (error: any) {
        // 실패 전송 API 호출 자체의 에러는 일단 콘솔에만 기록
        console.error("결제 실패 정보 전송 실패:", error);
      } finally {
        // 백엔드 전송 성공 여부와 관계 없이 사용자에게는 실패 사실을 알리고 돌려보냄
        Alert.alert(
          '결제 실패',
          `오류가 발생하여 결제에 실패했습니다. (코드: ${params.code})`,
          [{ text: '확인', onPress: () => navigation.navigate('profile/ChargePage') }]
        );
      }
    };

    reportFailure();
  }, [params, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>결제 처리 중 오류가 발생했습니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16, color: 'red' },
}); 