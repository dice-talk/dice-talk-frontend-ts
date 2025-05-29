import { useMemberInfoStore } from '@/zustand/stores/memberInfoStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithoutToken } from './axios/axios'; // axios 인스턴스 경로는 실제 프로젝트에 맞게 조정해주세요.

// 토큰 재발급 API 호출
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');

    if (!refreshToken) { // Primary check: refreshToken must exist
      console.log('토큰 재발급 불가: refreshToken이 AsyncStorage에 없습니다.');
      // refreshToken이 없으면 자동 로그인은 불가능하므로, 관련 정보 모두 클리어
      await AsyncStorage.removeItem('accessToken'); // accessToken도 의미 없음
      await AsyncStorage.removeItem('memberId');
      useMemberInfoStore.getState().clearStore();
      return false;
    }
    if (!accessToken) { // refreshToken은 있지만 accessToken이 없는 경우 (비정상적일 수 있지만 일단 재발급 시도)
      console.log('토큰 재발급 시도: accessToken은 없지만 refreshToken은 존재.');
      // 이 경우 API 명세에 따라 Authorization 헤더 없이 Refresh 헤더만 보낼지, 
      // 아니면 빈 Authorization 헤더라도 보내야 할지 확인 필요.
      // 여기서는 일단 빈 accessToken으로 시도 (백엔드가 어떻게 처리할지에 따라 다름)
    }

    console.log('토큰 재발급 시도: 현재 accessToken:', accessToken);
    console.log('토큰 재발급 시도: 현재 refreshToken:', refreshToken);

    const response = await axiosWithoutToken.post('/auth/refresh', {}, { 
      headers: {
        // accessToken이 만료되었거나 없을 수 있으므로, 백엔드 명세에 따라 이 헤더를 보내야 하는지 확인.
        // 일부 구현에서는 만료된 accessToken도 검증 목적으로 요구하기도 함.
        // 여기서는 API 명세에서 AccessToken과 RefreshToken을 모두 전달하라고 했으므로 포함합니다.
        'Authorization': `Bearer ${accessToken || ''}`,
        'Refresh': refreshToken, 
      },
    });

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken; // 새 refreshToken도 받음

    if (newAccessToken && newRefreshToken) { // 새 토큰 둘 다 받아야 성공으로 간주
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken); // 새 refreshToken도 저장
      useMemberInfoStore.getState().setToken(newAccessToken); 
      // memberId는 변경되지 않으므로 스토어에서 setMemberId를 다시 호출할 필요는 없음
      
      console.log('토큰 재발급 성공. 새 accessToken:', newAccessToken);
      console.log('토큰 재발급 성공. 새 refreshToken:', newRefreshToken);
      return true;
    } else {
      console.error('🚨 토큰 재발급 실패: API 응답에 newAccessToken 또는 newRefreshToken이 없습니다.', response.data);
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('memberId');
      useMemberInfoStore.getState().clearStore(); 
      return false;
    }
  } catch (error: any) {
    console.error('🚨 토큰 재발급 API 호출 중 오류:', error.response?.data || error.message);
    // 401 (Invalid Token) 등의 오류 발생 시 토큰들이 유효하지 않다는 의미이므로 모두 삭제
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('memberId');
    useMemberInfoStore.getState().clearStore();
    return false;
  }
};

// 앱 시작 시 또는 필요한 시점에 호출하여 자동 로그인 시도
export const attemptAutoLogin = async (): Promise<boolean> => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const memberIdStr = await AsyncStorage.getItem('memberId');
  const refreshToken = await AsyncStorage.getItem('refreshToken'); // refreshToken도 확인

  if (accessToken && memberIdStr && refreshToken) { // 모든 필요 정보가 있는지 확인
    console.log('AsyncStorage에 모든 토큰 및 memberId 존재. 스토어 우선 로드 후 재발급 시도.');
    useMemberInfoStore.getState().setToken(accessToken);
    useMemberInfoStore.getState().setMemberId(Number(memberIdStr));

    const refreshedSuccessfully = await refreshAccessToken();
    if (refreshedSuccessfully) {
        console.log('자동 로그인 성공: 토큰 재발급 성공 또는 기존 토큰 유효.');
        return true;
    } else {
        console.log('자동 로그인 실패: 토큰 재발급 실패.');
        // refreshAccessToken 내부에서 이미 AsyncStorage와 스토어가 정리되었을 것임
        return false;
    }
  } else {
    console.log('AsyncStorage에 accessToken, refreshToken 또는 memberId 없음. 자동 로그인 불가.');
    // 하나라도 없으면 확실히 정리
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('memberId');
    const store = useMemberInfoStore.getState();
    if (store.token || store.memberId) {
        store.clearStore(); 
    }
    return false;
  }
}; 