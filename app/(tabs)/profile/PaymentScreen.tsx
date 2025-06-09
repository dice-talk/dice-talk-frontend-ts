import { PaymentResponseData } from '@/api/paymentApi';
import useAuthStore from '@/zustand/stores/authStore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Linking, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

// [수정] 네비게이션 파라미터 타입을 백엔드 응답 DTO와 합칩니다.
type PaymentScreenParams = PaymentResponseData & {
  productName: string; // ChargePage에서 추가로 넘겨주는 정보
};

type PaymentScreenRouteProp = RouteProp<{ PaymentScreen: PaymentScreenParams }, 'PaymentScreen'>;

const paymentHtml = require('../../../assets/html/payment.html');

export default function PaymentScreen() {
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();

  // 외부 앱(토스) 실행 요청 처리
  const onShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    const { url } = event;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:blank')) {
      return true;
    }
    if (url.startsWith('dicetalkts://')) {
      return false;
    }
    Linking.openURL(url).catch(err => {
      Alert.alert('앱 실행 실패', '결제를 위한 앱을 열 수 없습니다.');
    });
    return false;
  };

  // route.params가 없으면 로딩 처리
  if (!route.params) {
    return ( <View style={styles.container}><ActivityIndicator/></View> );
  }

  // [수정] route.params에서 직접 필요한 정보를 추출합니다.
  const { clientKey, orderId, amount, productName } = route.params;
  const memberId = useAuthStore((state) => state.memberId);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  // [수정] 백엔드로부터 받은 데이터로 paymentDetails를 구성합니다.
  const paymentDetails = useMemo(() => ({
    clientKey, // [수정] 백엔드 키가 수정되었으므로, 다시 백엔드에서 받은 값을 사용하도록 복원합니다.
    customerKey: memberId ? `member_${memberId}` : `guest_${orderId}`,
    amount, // 백엔드에서 받은 값
    orderId, // 백엔드에서 받은 값
    orderName: productName, // ChargePage에서 전달받은 값
    successUrl: 'dicetalkts://payment-success',
    failUrl: 'dicetalkts://payment-fail',
  }), [clientKey, memberId, orderId, amount, productName]);
  
  /**
   * WebView에 위젯 렌더링을 요청하는 스크립트를 주입합니다.
   */
  const renderWidgetInWebView = () => {
    if (webViewRef.current) {
      const script = `window.renderWidget('${JSON.stringify(paymentDetails)}'); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  };

  /**
   * WebView에 결제 시작을 요청하는 스크립트를 주입합니다.
   */
  const handlePaymentRequest = () => {
    if (isPaymentProcessing) return;
    setIsPaymentProcessing(true);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.startPayment(); true;`);
    }
  };

  /**
   * WebView로부터 수신한 메시지를 처리합니다.
   */
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from WebView:', data);

      switch (data.type) {
        case 'WIDGET_READY':
          // 위젯이 준비되면 로딩을 멈추고 결제 버튼을 활성화합니다.
          setIsLoading(false);
          setIsWidgetReady(true);
          break;
        case 'ERROR':
          Alert.alert('오류', data.payload?.message || '알 수 없는 오류');
          break;
        case 'LOG':
          console.log(`[WebView LOG] ${data.payload}`);
          break;
      }
    } catch (e) { console.error('메시지 파싱 오류:', e); }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={paymentHtml}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={renderWidgetInWebView}
        onError={(e) => {
          console.warn('WebView error: ', e.nativeEvent);
          setIsLoading(false);
          Alert.alert('WebView 오류', '결제 페이지를 로드하는 중 문제가 발생했습니다.', [
              { text: '확인', onPress: () => navigation.goBack() }
          ]);
        }}
        originWhitelist={['*']}
      />
      {isLoading && !isWidgetReady && (
        <ActivityIndicator style={styles.loadingOverlay} size="large" color="#8A50F6" />
      )}

      {/* [수정] 결제가 진행 중이 아닐 때만 버튼 컨테이너를 보여줍니다. */}
      {!isPaymentProcessing && (
        <View style={styles.paymentButtonContainer}>
          <Button
            title={`${amount.toLocaleString()}원 결제하기`}
            onPress={handlePaymentRequest}
            disabled={!isWidgetReady}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paymentButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  }
}); 