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

  // customerKey는 WebView 내에서 임의로 생성하거나,
  // 필요 시 백엔드 응답에 포함시켜서 전달받을 수 있습니다.
  const customerKey = `user_${Math.random().toString(36).substring(7)}`;

  const [isWebViewLoaded, setIsWebViewLoaded] = useState(false);

  useEffect(() => {
    // 모든 필수 파라미터가 있는지 확인
    if (isWebViewLoaded && webViewRef.current && amount && orderId && orderName && clientKey) {
      const paymentInfo = {
        clientKey,
        customerKey,
        amount: Number(amount),
        orderId,
        orderName,
      };
      console.log("WebView로 전달하는 결제 정보:", paymentInfo);
      webViewRef.current.postMessage(JSON.stringify(paymentInfo));
    }
  }, [isWebViewLoaded, amount, orderId, orderName, clientKey]);

  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'LOG') {
        console.log('WebView LOG:', ...message.data);
      } else if (message.type === 'ERROR') {
        console.error('WebView ERROR:', ...message.data);
      }
    } catch (e) {
      // JSON 형식이 아닌 메시지는 무시
    }
  };

  const onShouldStartLoadWithRequest = (event: any) => {
    const { url } = event;

    const successUrl = 'dicetalkts://payment-success';
    const failUrl = 'dicetalkts://payment-fail';

    if (url.startsWith(successUrl)) {
      const urlObj = new URL(url.replace('dicetalkts:/', 'https:/'));
      const params = Object.fromEntries(urlObj.searchParams.entries());
      router.replace({ pathname: '/payment-success', params });
      return false;
    }
    if (url.startsWith(failUrl)) {
      const urlObj = new URL(url.replace('dicetalkts:/', 'https:/'));
      const params = Object.fromEntries(urlObj.searchParams.entries());
      router.replace({ pathname: '/payment-fail', params });
      return false;
    }
    
    // http, https, about:blank가 아니면 외부 앱으로 간주하고 Linking.openURL 시도
    if (!url.startsWith('http') && !url.startsWith('about:blank')) {
      // intent:// URL의 경우, 안드로이드에서만 특별 처리가 필요할 수 있음
      if (Platform.OS === 'android' && url.startsWith('intent:')) {
        // intent URL을 파싱하여 market URL을 찾거나 직접 실행
        // 이 예제에서는 Linking API에 직접 맡겨봅니다.
        Linking.openURL(url).catch(() => {
          // 실패 시, intent URL에서 패키지명을 파싱하여 마켓으로 보내는 로직 추가 가능
          const appPackage = url.match(/package=([^;]+)/);
          if (appPackage?.[1]) {
            Linking.openURL(`market://details?id=${appPackage[1]}`);
          } else {
            Alert.alert('알림', '결제 앱 실행에 실패했습니다. 설치 여부를 확인해주세요.');
          }
        });
      } else {
        // 일반적인 앱 스킴 (예: ispmobile://) 또는 iOS 처리
        Linking.openURL(url).catch(() => {
          Alert.alert('알림', '앱 실행에 실패했습니다. 설치 여부를 확인해주세요.');
        });
      }
      return false; // WebView의 URL 이동 중단
    }

    return true;
  };

  if (!amount || !orderId || !orderName || !clientKey) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const injectedJavaScript = `
    (function() {
      const originalRequestPayment = PaymentWidget.prototype.requestPayment;
      PaymentWidget.prototype.requestPayment = function(paymentParams) {
        const successUrl = 'dicetalkts://payment-success';
        const failUrl = 'dicetalkts://payment-fail';
        const finalParams = { ...paymentParams, successUrl, failUrl };
        originalRequestPayment.call(this, finalParams);
      };
    })();
    true;
  `;
  
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
        injectedJavaScriptBeforeContentLoaded={`
          // WebView 콘솔 로그를 React Native로 전달하는 프록시 설정
          window.console.log = function(...args) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOG', data: args }));
          };
          window.console.error = function(...args) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR', data: args }));
          };
          
          // 기존 스크립트 (successUrl, failUrl 주입)
          ${injectedJavaScript}
        `}
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