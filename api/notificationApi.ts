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
 * @param memberId - 사용자 ID (URL 경로에 포함될 수 있음)
 * @param token - Expo 푸시 토큰
 */
export const sendPushTokenToServer = async (memberId: number | string, token: string): Promise<void> => {
  try {
    const payload: SendPushTokenPayload = {
      expoPushToken: token,
      deviceType: Platform.OS,
    };
    // 백엔드 엔드포인트 예시: /members/expo-push-token
    // 실제 사용하는 엔드포인트로 수정해야 합니다.
    // 예를 들어, PUT /api/v1/members/{memberId}/expo-push-token 형태라면:
    // await axiosWithToken.put(`/api/v1/members/${memberId}/expo-push-token`, payload);
    // 여기서는 POST /api/v1/members/expo-push-token 형태로 가정 (Authorization 헤더로 사용자 식별)
    await axiosWithToken.post('/api/v1/push-notifications/token', payload); 
    console.log(`Push token (${token.substring(0,15)}...) for member ${memberId} sent to server successfully.`);
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