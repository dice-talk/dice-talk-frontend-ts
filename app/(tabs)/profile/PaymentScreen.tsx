import useAuthStore from '@/zustand/stores/authStore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, Linking, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

// [복원] 네비게이션 파라미터 타입 정의
type PaymentScreenParams = {
  productId: string;
  productName: string;
  price: string;
  quantity: string;
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

  // [복원] 전달받은 파라미터를 안전하게 파싱
  const { productId, productName, price, quantity } = route.params;
  const memberId = useAuthStore((state) => state.memberId);
  const [isLoading, setIsLoading] = useState(true);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  // [복원] orderId를 프론트에서 생성
  const [orderId] = useState(`order_${productId}_${new Date().getTime()}`);
  
  // [복원] 결제 정보를 프론트에서 조합
  const paymentDetails = useMemo(() => ({
    clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm', // [중요] 문서에서 제공된 테스트 클라이언트 키
    customerKey: memberId ? `member_${memberId}` : `guest_${orderId}`,
    amount: parseFloat(price) * parseInt(quantity, 10),
    orderId: orderId,
    orderName: productName,
    successUrl: 'dicetalkts://payment-success', // 우리 앱의 딥링크
    failUrl: 'dicetalkts://payment-fail',       // 우리 앱의 딥링크
  }), [memberId, orderId, price, quantity, productName]);
  
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
  const requestPaymentInWebView = () => {
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
        <ActivityIndicator style={styles.loadingOverlay} size="large" />
      )}
      {isWidgetReady && (
        <View style={styles.paymentButtonContainer}>
          <Button
            title={`${paymentDetails.amount.toLocaleString()}원 결제하기`}
            onPress={requestPaymentInWebView}
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