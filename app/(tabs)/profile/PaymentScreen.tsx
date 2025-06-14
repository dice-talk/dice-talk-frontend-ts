import { ConvertUrl } from '@tosspayments/widget-sdk-react-native/src/utils/convertUrl';
// import { ConvertUrl } from '@tosspayments/widget-sdk-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const TossPaymentWebView = () => {
  const webViewRef = useRef<WebView>(null);
  const router = useRouter();
  const { amount, orderId, orderName, clientKey } = useLocalSearchParams<{
    amount: string;
    orderId: string;
    orderName:string;
    clientKey: string;
  }>();

  // 벡엔드 키 검증 및 UI 렌더링을 위한 임시 조치
  // 백엔드에서 올바른 '위젯용 클라이언트 키'를 제공하면 이 줄은 삭제해야 합니다.
  const temporaryFixedClientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

  // customerKey는 WebView 내에서 임의로 생성하거나,
  // 필요 시 백엔드 응답에 포함시켜서 전달받을 수 있습니다.
  const customerKey = `user_${Math.random().toString(36).substring(7)}`;

  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  useEffect(() => {
    // 모든 필수 파라미터가 있는지 확인
    if (isWebViewLoaded && webViewRef.current && amount && orderId && orderName && temporaryFixedClientKey) {
      const paymentInfo = {
        clientKey: temporaryFixedClientKey, // 임시 키 사용
        customerKey,
        amount: Number(amount),
        orderId,
        orderName,
        successUrl: 'dicetalkts://payment-success',
        failUrl: 'dicetalkts://payment-fail',
      };
      console.log("WebView로 전달하는 결제 정보 (임시 키 사용):", paymentInfo);
      webViewRef.current.postMessage(JSON.stringify(paymentInfo));
    }
  }, [isWebViewLoaded, amount, orderId, orderName, temporaryFixedClientKey]);

  const handleWebViewMessage = (event: any) => {
    try {
      // event.nativeEvent.data가 문자열이 아닐 수도 있으므로 확인
      if (typeof event.nativeEvent.data !== 'string') {
        console.log('[WebView] Received non-string message:', event.nativeEvent.data);
        return;
      }
      const message = JSON.parse(event.nativeEvent.data);
      const { type, data } = message;

      // 데이터가 배열이 아니면 배열로 감싸서 spread operator(...) 사용시 에러 방지
      const logData = Array.isArray(data) ? data : [data];

      switch (type) {
        case 'LOG':
        case 'INFO':
          console.log('[WebView]', ...logData);
          break;
        case 'WARN':
          console.warn('[WebView]', ...logData);
          break;
        case 'ERROR':
          console.error('[WebView]', ...logData);
          break;
        default:
          console.log('[WebView Message]', message);
          break;
      }
    } catch (e) {
      // JSON 파싱 실패 시 원본 메시지 출력
      console.log('[Raw WebView message]', event.nativeEvent.data);
    }
  };

  const onShouldStartLoadWithRequest = (event: any) => {
    const { url } = event;

    // 1. 결제 성공/실패 후 우리 앱으로 돌아오는 URL 처리
    const successUrl = 'dicetalkts://payment-success';
    const failUrl = 'dicetalkts://payment-fail';

    if (url.startsWith(successUrl)) {
      // URLSearchParams를 사용하여 쿼리 파라미터 파싱
      const searchParams = new URL(url.replace('dicetalkts:/', 'https:/')).searchParams;
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      router.replace({ pathname: '/payment-success', params: { paymentKey, orderId, amount } });
      return false; // WebView 내에서 이동하지 않음
    }
    if (url.startsWith(failUrl)) {
      const searchParams = new URL(url.replace('dicetalkts:/', 'https:/')).searchParams;
      const code = searchParams.get('code');
      const message = searchParams.get('message');
      router.replace({ pathname: '/payment-fail', params: { code, message } });
      return false; // WebView 내에서 이동하지 않음
    }

    // 2. 외부 앱(카드사, 간편결제 앱)을 실행해야 하는 URL 처리 (intent, market 등)
    if (Platform.OS === 'android' && (url.startsWith('intent://') || url.startsWith('market://'))) {
      const convertUrl = new ConvertUrl(url); // 공식 유틸리티 사용
      convertUrl.launchApp().catch(error => {
        console.error("앱 실행 또는 마켓 이동에 실패했습니다.", error);
        Alert.alert("알림", "결제 앱을 실행할 수 없습니다. 설치 여부를 확인해주세요.");
      });
      return false; // WebView 내에서 이동하지 않음
    }

    // 3. 그 외 모든 외부 앱 스킴 처리 (iOS 등)
    if (!url.startsWith('http') && !url.startsWith('about:blank')) {
      Linking.openURL(url).catch(error => {
        console.error("앱 실행에 실패했습니다.", error);
        Alert.alert("알림", "앱을 열 수 없습니다. 설치 여부를 확인해주세요.");
      });
      return false; // WebView 내에서 이동하지 않음
    }
    
    // 4. 위 모든 경우에 해당하지 않으면 WebView 내에서 정상적으로 페이지 이동 허용
    return true;
  };

  if (!amount || !orderId || !orderName || !clientKey) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={require('@/assets/html/payment.html')}
        onLoadEnd={() => setIsWebViewLoaded(true)}
        onMessage={handleWebViewMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TossPaymentWebView; 