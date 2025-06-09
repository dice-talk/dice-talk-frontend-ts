import { axiosWithToken } from '@/api/axios/axios';

/**
 * 결제 요청을 위한 데이터 타입
 */
interface RequestPaymentData {
  productId: number;
  amount: number;
  diceAmount: number;
}

/**
 * 결제 요청 후 백엔드로부터 받는 응답 데이터 타입
 */
export interface PaymentResponseData {
  orderId: string;
  amount: number;
  clientKey: string;
  orderName: string;
  successUrl: string; // 이 값은 사용하지 않고, 프론트에서 재정의합니다.
  failUrl: string;   // 이 값은 사용하지 않고, 프론트에서 재정의합니다.
}

/**
 * 결제 승인을 위해 백엔드에 보내는 데이터 타입
 */
interface ConfirmPaymentData {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 결제 실패 정보를 백엔드에 보내는 데이터 타입
 */
interface FailPaymentData {
  paymentKey?: string; // 실패 시 paymentKey는 없을 수 있습니다.
  orderId: string;
  message: string;
  code: string;
}

interface TossPaymentConfirmation {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 1. 백엔드에 결제 정보를 보내고, 토스 결제창에 필요한 정보를 받아오는 API
 * @param data - 상품 ID, 결제 금액, 주사위 개수
 */
export const requestTossPayment = async (data: RequestPaymentData): Promise<PaymentResponseData> => {
  const response = await axiosWithToken.post('/api/v1/payments/toss/request', data);
  return response.data;
};

/**
 * 토스페이먼츠 결제 승인을 요청하는 API
 * @param {TossPaymentConfirmation} paymentData - 결제 승인에 필요한 정보 (paymentKey, orderId, amount)
 */
export const confirmTossPayment = async (paymentData: TossPaymentConfirmation) => {
  try {
    // 우리 백엔드 서버의 '/payments/toss/confirm' 엔드포인트로 결제 승인 요청을 보냅니다.
    // 실제 백엔드 구현에 따라 엔드포인트는 달라질 수 있습니다.
    const response = await axiosWithToken.post('/payments/toss/confirm', paymentData);
    
    console.log('결제 승인 성공:', response.data);
    return response.data;
    
  } catch (error: any) {
    console.error('결제 승인 API 요청 실패:', error.response ? error.response.data : error.message);
    // 에러를 그대로 다시 던져서 호출한 쪽(PaymentScreen)에서 처리하도록 합니다.
    throw error;
  }
};

/**
 * 3. 결제 실패 시, 백엔드에 실패 사실을 알리는 API
 * @param data - paymentKey, orderId, message, code
 */
export const failTossPayment = async (data: FailPaymentData): Promise<void> => {
  await axiosWithToken.post('/api/v1/payments/toss/fail', data);
}; 