import { axiosWithToken } from '@/api/axios/axios';

interface TossPaymentConfirmation {
  paymentKey: string;
  orderId: string;
  amount: number;
}

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