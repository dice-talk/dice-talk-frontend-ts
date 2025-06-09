import { confirmTossPayment } from '@/api/paymentApi'; // 결제 승인 API import
import GradientHeader from '@/components/common/GradientHeader'; // 헤더 컴포넌트 (필요에 따라 경로 수정)
import useAuthStore from '@/zustand/stores/authStore'; // 사용자 정보를 가져오기 위함
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useMemo, useRef, useState } from 'react';
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

// metro.config.js 설정에 따라 로컬 html 파일을 불러옵니다.
const paymentHtml = require('../../../assets/html/payment.html');

export default function PaymentScreen() {
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const route = useRoute<PaymentScreenRouteProp>();

  // [수정] 앱 충돌을 막기 위해 route.params가 준비될 때까지 로딩 화면을 보여줍니다.
  if (!route.params) {
    return (
      <View style={styles.container}>
        <GradientHeader title="결제하기" />
        <ActivityIndicator style={styles.loadingOverlay} size="large" color="#8A50F6" />
      </View>
    );
  }

  // 전달받은 파라미터를 안전하게 파싱합니다.
  const productId = route.params.productId;
  const price = parseFloat(route.params.price);
  const quantity = parseInt(route.params.quantity, 10);
  const productName = route.params.productName;

  const memberId = useAuthStore((state) => state.memberId);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false); // 결제 승인 로딩 상태

  // [수정] 무한 리렌더링을 방지하기 위해 orderId를 상태로 관리합니다.
  const [orderId] = useState(`order_${productId}_${new Date().getTime()}`);
  
  // [수정] 결제 정보를 useMemo로 관리하여 안정성을 높입니다.
  const paymentDetails = useMemo(() => ({
    clientKey: 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm', // 테스트용 클라이언트 키
    customerKey: memberId ? `member_${memberId}` : `guest_${orderId}`,
    amount: price * quantity,
    orderId: orderId,
    orderName: productName,
    // [수정] 모바일 앱 환경에 맞는 딥링크(커스텀 스킴)으로 변경합니다.
    successUrl: 'dicetalkts://payment-success',
    failUrl: 'dicetalkts://payment-fail',
  }), [memberId, orderId, price, quantity, productName]);
  
  /**
   * WebView가 로드된 후, 결제 위젯을 초기화하라는 메시지를 보냅니다.
   */
  const sendPaymentRequestToWebView = () => {
    if (webViewRef.current) {
      // [수정] postMessage 대신 injectJavaScript를 사용하여 안정적으로 함수를 호출합니다.
      const paymentDetailsString = JSON.stringify(paymentDetails);
      // JSON 문자열 내부의 따옴표 문제를 방지하기 위해 이스케이프 처리합니다.
      const escapedPaymentDetailsString = paymentDetailsString.replace(/'/g, "\\'");

      const script = `
        window.initializePayment('${escapedPaymentDetailsString}');
        true; // 마지막에 반드시 true를 반환해야 합니다 (Android).
      `;
      console.log('Injecting script into WebView...');
      webViewRef.current.injectJavaScript(script);
    }
  };

  /**
   * WebView로부터 메시지를 수신하여 처리합니다.
   */
  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    console.log('Message from WebView:', event.nativeEvent.data);
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        // [수정] HTML_LOADED 메시지는 이제 참고용으로만 사용합니다.
        case 'HTML_LOADED':
          console.log('WebView HTML is loaded. Script will be injected on load end.');
          break;
        case 'ERROR':
          Alert.alert('결제 처리 중 오류', data.payload?.message || '알 수 없는 오류가 발생했습니다.');
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

  /**
   * WebView의 URL 변경을 감지하여 결제 성공/실패를 처리합니다.
   */
  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const { url } = navState;
    console.log('Current URL in WebView: ', url);

    if (url.startsWith(paymentDetails.successUrl)) {
      webViewRef.current?.stopLoading();
      setIsConfirming(true); // [추가] 결제 승인 로딩 시작
      try {
        const params = new URL(url).searchParams;
        const paymentKey = params.get('paymentKey');
        const orderIdFromUrl = params.get('orderId');
        const amountFromUrl = params.get('amount');
        
        if (!paymentKey || !orderIdFromUrl || !amountFromUrl) {
          throw new Error("결제 승인에 필요한 정보가 누락되었습니다.");
        }
        
        console.log(`결제 성공 감지. 서버에 승인 요청: paymentKey=${paymentKey}, orderId=${orderIdFromUrl}`);
        
        // [추가] 서버에 결제 승인을 요청합니다.
        await confirmTossPayment({
          paymentKey,
          orderId: orderIdFromUrl,
          amount: parseInt(amountFromUrl, 10),
        });

        Alert.alert('결제 성공', '결제가 최종적으로 완료되었습니다.');
        navigation.goBack();

      } catch (error: any) {
        const message = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
        Alert.alert('결제 승인 실패', `사유: ${message}`);
        navigation.goBack();
      } finally {
        setIsConfirming(false);
      }

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

  const showLoading = isLoading || isConfirming;

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
        // [수정] onLoadEnd는 웹페이지 로딩이 '완료'된 후 호출되므로, 스크립트 주입에 가장 안정적인 시점입니다.
        onLoadEnd={() => {
          setIsLoading(false);
          console.log('WebView onLoadEnd: Injecting payment data.');
          sendPaymentRequestToWebView();
        }}
        onError={(e) => {
          console.warn('WebView error: ', e.nativeEvent);
          setIsLoading(false);
          Alert.alert('WebView 오류', '결제 페이지를 로드하는 중 문제가 발생했습니다.', [
              { text: '확인', onPress: () => navigation.goBack() }
          ]);
        }}
        originWhitelist={['*']}
      />
      {showLoading && (
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
}); 