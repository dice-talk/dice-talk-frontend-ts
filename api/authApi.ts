import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithoutToken } from './axios/axios'; // axios 인스턴스 경로는 실제 프로젝트에 맞게 조정해주세요.

// 토큰 재발급 API 호출
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    // const { setIsAutoLoginAttempted } = useMemberInfoStore.getState(); // 이 함수는 여기서 직접 상태 변경하지 않음

    if (!refreshToken) {
      console.log('refreshAccessToken: refreshToken이 AsyncStorage에 없습니다. 재발급 불가.');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('memberId');
      useMemberInfoStore.getState().clearStore();
      // setIsAutoLoginAttempted(true); // attemptAutoLogin에서 최종적으로 처리
      return false;
    }
    // accessToken이 없어도 refreshToken만 있으면 재발급 시도 가능해야 함 (백엔드 정책에 따라 다름)
    // console.log('refreshAccessToken: 현재 accessToken:', accessToken);
    console.log('refreshAccessToken: 현재 refreshToken:', refreshToken);

    const response = await axiosWithoutToken.post('/auth/refresh', {}, { 
      headers: {
        'Authorization': `Bearer ${accessToken || ''}`, // 만료되었거나 없는 accessToken이라도 포함 (백엔드 요구사항)
        'Refresh': refreshToken, 
      },
    });

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken; 

    if (newAccessToken && newRefreshToken) {
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      useMemberInfoStore.getState().setToken(newAccessToken); 
      // memberId는 AsyncStorage에서 읽어와 attemptAutoLogin에서 스토어에 설정하므로 여기서는 setToken만.
      console.log('refreshAccessToken: 토큰 재발급 성공. 새 accessToken:', newAccessToken.substring(0, 15) + '...');
      console.log('refreshAccessToken: 토큰 재발급 성공. 새 refreshToken:', newRefreshToken.substring(0, 15) + '...');
      return true;
    } else {
      console.error('🚨 refreshAccessToken 실패: API 응답에 newAccessToken 또는 newRefreshToken이 없습니다.', response.data);
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('memberId');
      useMemberInfoStore.getState().clearStore();
      // setIsAutoLoginAttempted(true); // attemptAutoLogin에서 최종적으로 처리
      return false;
    }
  } catch (error: any) {
    console.error('🚨 refreshAccessToken API 호출 중 오류:', error.response?.data || error.message);
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('memberId');
    useMemberInfoStore.getState().clearStore();
    // setIsAutoLoginAttempted(true); // attemptAutoLogin에서 최종적으로 처리
    return false;
  }
};

// 앱 시작 시 또는 필요한 시점에 호출하여 자동 로그인 시도
export const attemptAutoLogin = async (): Promise<boolean> => {
  const { setIsAutoLoginAttempted, setToken, setMemberId, clearStore, token: currentToken, memberId: currentMemberId } = useMemberInfoStore.getState();
  console.log('attemptAutoLogin: 시작. isAutoLoginAttempted를 true로 설정 시도.');
  setIsAutoLoginAttempted(true); // 자동 로그인 시도를 했다는 것을 먼저 기록

  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const memberIdStr = await AsyncStorage.getItem('memberId');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (accessToken && memberIdStr && refreshToken) {
      console.log('attemptAutoLogin: AsyncStorage에 모든 토큰 및 memberId 존재. 스토어 우선 로드.');
      setToken(accessToken);
      setMemberId(Number(memberIdStr));
      console.log('attemptAutoLogin: 스토어 로드 후, 토큰 재발급 시도...');

      const refreshedSuccessfully = await refreshAccessToken();
      if (refreshedSuccessfully) {
          console.log('attemptAutoLogin: 토큰 재발급 성공 또는 기존 토큰 유효. 자동 로그인 성공.');
          return true;
      } else {
          console.log('attemptAutoLogin: 토큰 재발급 실패. 자동 로그인 실패.');
          // refreshAccessToken 내부에서 이미 AsyncStorage와 스토어가 정리되었을 것임
          return false;
      }
    } else {
      console.log('attemptAutoLogin: AsyncStorage에 accessToken, refreshToken 또는 memberId 없음. 자동 로그인 불가.');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('memberId');
      // 스토어에 남아있을 수 있는 잔여 정보 클리어 (이미 로그인 안 된 상태로 간주)
      if (currentToken || currentMemberId) {
          console.log('attemptAutoLogin: 스토어에 잔여 정보가 있어 clearStore 호출.');
          clearStore(); 
      }
      return false;
    }
  } catch (error) {
    console.error('🚨 attemptAutoLogin 중 예기치 않은 오류 발생:', error);
    // 예기치 않은 오류 발생 시에도 안전하게 정리 시도
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('memberId');
    clearStore(); // 스토어 정리
    return false;
  }
}; 