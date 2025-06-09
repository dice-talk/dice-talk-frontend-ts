import { axiosWithToken } from './axios/axios';

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
  orderId: string;
  message: string;
  code: string;
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
 * 2. 결제 성공 후, 백엔드에 최종 승인을 요청하는 API
 * @param data - paymentKey, orderId, amount
 */
export const confirmTossPayment = async (data: ConfirmPaymentData): Promise<void> => {
  await axiosWithToken.post('/api/v1/payments/toss/confirm', data);
};

/**
 * 3. 결제 실패 시, 백엔드에 실패 사실을 알리는 API
 * @param data - orderId, message, code
 */
export const failTossPayment = async (data: FailPaymentData): Promise<void> => {
  await axiosWithToken.post('/api/v1/payments/toss/fail', data);
}; 