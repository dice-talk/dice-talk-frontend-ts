import { axiosWithToken } from '@/api/axios/axios'; // axiosWithToken 임포트 경로 수정
import { AxiosError } from 'axios'; // AxiosError 타입 임포트
import { Platform } from 'react-native'; // Platform 가져오기

interface SendPushTokenPayload {
  expoPushToken: string;
  deviceType: string; // 'ios', 'android', 'web', 'windows', 'macos' 중 하나
  // 백엔드에서 사용자 식별을 위해 memberId를 URL 경로 파라미터로 받는다면 payload에선 제외될 수 있음
}

/**
 * Expo 푸시 알림 토큰을 서버로 전송합니다.
 * 백엔드가 Authorization 헤더의 JWT에서 사용자 정보를 식별하므로 memberId는 인자로 필요 없습니다.
 * @param token - Expo 푸시 토큰
 */
export const sendPushTokenToServer = async (token: string): Promise<void> => {
  try {
    const payload: SendPushTokenPayload = {
      expoPushToken: token,
      deviceType: Platform.OS, // 'ios' 또는 'android'
    };
    
    // 백엔드 엔드포인트: POST /api/v1/push-notifications/token
    // Authorization 헤더는 axiosWithToken 인터셉터에서 자동으로 추가됩니다.
    await axiosWithToken.post('/api/v1/push-notifications/token', payload); 
    console.log(`Push token (${token.substring(0,15)}...) sent to server successfully.`);
  } catch (error) {
    const axiosError = error as AxiosError; // 에러 타입을 AxiosError로 단언
    let errorMessage = 'Failed to send push token to server.';
    if (axiosError.response) {
      errorMessage = `Server error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`;
    } else if (axiosError.request) {
      errorMessage = 'No response from server while sending push token.';
    } else {
      errorMessage = axiosError.message;
    }
    console.error(errorMessage, axiosError);
    // 실제 앱에서는 사용자에게 알리거나 재시도 로직 등을 고려할 수 있습니다.
    throw new Error(errorMessage); // 에러를 다시 throw하여 호출한 쪽에서 알 수 있도록 함
  }
}; 