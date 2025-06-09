import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

/**
 * 결제 실패 처리 페이지
 */
export default function PaymentFailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { message, code } = params;

  useEffect(() => {
    Alert.alert(
      '결제 실패',
      `사유: ${message || '알 수 없는 오류가 발생했습니다.'}\n(코드: ${code || '정보 없음'})`,
      [{ text: '확인', onPress: () => router.replace('/(tabs)/profile/ChargePage') }]
    );
  }, [message, code, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8A50F6" />
      <Text style={styles.text}>결제 실패 정보를 처리 중입니다...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  }
}); 