import GradientHeader from '@/components/common/GradientHeader'; // 헤더 컴포넌트 (필요에 따라 경로 수정)
import useAuthStore from '@/zustand/stores/authStore'; // 사용자 정보를 가져오기 위함
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';

// 네비게이션 파라미터 타입 정의
type PaymentScreenParams = {
  productId: string;
  productName: string;
  price: string;
  quantity: string;
};

// route 타입 정의
type PaymentScreenRouteProp = RouteProp<{ PaymentScreen: PaymentScreenParams }, 'PaymentScreen'>;


// payment.html 로드 (metro.config.js 설정 필요)
const paymentHtml = require('../../../assets/html/payment.html');

export default function PaymentScreen() {
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();
  
  // ChargePage에서 문자열로 전달된 파라미터를 숫자로 변환
  const productId = parseInt(route.params.productId, 10);
  const price = parseFloat(route.params.price);
  const quantity = parseInt(route.params.quantity, 10);
  const productName = route.params.productName;

  const memberId = useAuthStore((state) => state.memberId);
  const [isLoading, setIsLoading] = useState(true);

  const paymentDetails = {
    customerKey: memberId ? `member_${memberId}` : `guest_${new Date().getTime()}`,
    amount: price, // 변환된 숫자 값 사용
    orderId: `order_${productId}_${new Date().getTime()}`,
    orderName: productName,
    successUrl: 'http://localhost:3000/payment/success',
    failUrl: 'http://localhost:3000/payment/fail',
    customerEmail: undefined, 
    customerName: undefined, 
  };

  const sendPaymentRequestToWebView = () => {
    if (webViewRef.current) {
      const message = {
        type: 'PAYMENT_REQUEST',
        payload: {
          ...paymentDetails,
          amount: price, // 명시적으로 숫자타입인 price 전달
        },
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    console.log('Message from WebView:', event.nativeEvent.data);
    setIsLoading(false); 
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'HTML_LOADED':
          console.log('WebView HTML is loaded. Sending payment request...');
          sendPaymentRequestToWebView();
          break;
        case 'ERROR':
          Alert.alert('결제 처리 중 오류', data.payload.message);
          if (navigation.canGoBack()) navigation.goBack();
          break;
        default:
          console.log('Unknown message type from WebView:', data.type);
          break;
      }
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url, loading } = navState;
    console.log('Current URL in WebView: ', url, 'Loading: ', loading);
    setIsLoading(loading);

    if (url.startsWith(paymentDetails.successUrl)) {
      webViewRef.current?.stopLoading(); 
      const params = new URL(url).searchParams;
      const paymentKey = params.get('paymentKey');
      const orderId = params.get('orderId');
      
      console.log(`결제 성공 감지: paymentKey=${paymentKey}, orderId=${orderId}`);
      Alert.alert('결제 요청 성공', `주문ID: ${orderId}\npaymentKey: ${paymentKey}\n\n실제 결제 완료를 위해서는 백엔드에서 '결제 승인' 처리가 필요합니다.`);
      if (navigation.canGoBack()) navigation.goBack();
    } else if (url.startsWith(paymentDetails.failUrl)) {
      webViewRef.current?.stopLoading();
      const params = new URL(url).searchParams;
      const message = params.get('message') || '알 수 없는 오류로 결제에 실패했습니다.';
      const code = params.get('code');
      console.log(`결제 실패 감지: message=${message}, code=${code}`);
      Alert.alert('결제 실패', `사유: ${message} (코드: ${code})`);
      if (navigation.canGoBack()) navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader title="결제하기" />
      <WebView
        ref={webViewRef}
        source={paymentHtml} 
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={() => setIsLoading(true)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
          setIsLoading(false);
          Alert.alert('WebView 오류', '결제 페이지를 로드하는 중 문제가 발생했습니다.');
          if (navigation.canGoBack()) navigation.goBack();
        }}
        originWhitelist={['*']}
      />
      {isLoading && (
        <ActivityIndicator
          style={styles.loadingOverlay}
          size="large"
          color="#8A50F6"
        />
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
    backgroundColor: 'rgba(255,255,255,0.5)', 
  },
}); 