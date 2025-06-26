import useAuthStore from '@/zustand/stores/authStore';
import useSharedProfileStore from '@/zustand/stores/sharedProfileStore';
import useSignupProgressStore from '@/zustand/stores/signupProgressStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getAnonymousInfo } from './memberApi';

// [수정] 순환 참조를 끊기 위해 axios 인스턴스 대신 BASE_URL만 import하고, axios를 직접 사용합니다.
import axios from 'axios';
import { BASE_URL } from './axios/axios';

const clearAllStores = async () => {
  useAuthStore.getState().actions.clearAuthInfo();
  useSharedProfileStore.getState().actions.clearSharedProfile();
  useSignupProgressStore.getState().actions.clearSignupData();
  
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('memberId');
  }
  console.log('clearAllStores: 모든 스토어 및 AsyncStorage 토큰/memberId 정리 완료');
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  const { accessToken: currentAccessTokenInStore, refreshToken: currentRefreshTokenInStore, memberId } = useAuthStore.getState();
  const storedAccessToken = await AsyncStorage.getItem('accessToken');
  const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
  const refreshTokenToUse = storedRefreshToken || currentRefreshTokenInStore;

  if (!refreshTokenToUse) {
    console.log('refreshAccessToken: 유효한 refreshToken이 없습니다.');
    await clearAllStores(); 
    return false;
  }

  const accessTokenForHeader = storedAccessToken || currentAccessTokenInStore || '';
  console.log('refreshAccessToken: 재발급 시도...');

  try {
    // [수정] 순환 참조를 유발하는 axiosWithoutToken 대신, 이 함수 전용 인스턴스를 생성하여 사용합니다.
    const refreshInstance = axios.create({ baseURL: BASE_URL });
    const response = await refreshInstance.post('/auth/refresh', {}, { 
      headers: { 'Authorization': `Bearer ${accessTokenForHeader}`, 'Refresh': refreshTokenToUse, },
    });

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    if (newAccessToken && newRefreshToken) {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem('accessToken', newAccessToken);
        await AsyncStorage.setItem('refreshToken', newRefreshToken);
      }
      
      if (memberId !== null) { 
        useAuthStore.getState().actions.setAuthInfo({ memberId, accessToken: newAccessToken, refreshToken: newRefreshToken });
        console.log('refreshAccessToken: 토큰 재발급 성공.');
        return true;
      } else {
        console.error('🚨 refreshAccessToken 성공했으나 스토어에 memberId가 없어 AuthInfo 업데이트 불가.');
        await clearAllStores();
        return false;
      }
    } else {
      console.error('🚨 refreshAccessToken 실패: API 응답에 필수 토큰이 없습니다.', response.data);
      await clearAllStores();
      return false;
    }
  } catch (error: any) {
    console.error('🚨 refreshAccessToken API 호출 중 오류:', error.response?.data || error.message);
    await clearAllStores();
    return false;
  }
};

export const attemptAutoLogin = async (): Promise<boolean> => {
  const { setAutoLoginAttempted } = useAuthStore.getState().actions;
  setAutoLoginAttempted(true);
  console.log('attemptAutoLogin: 시작.');

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    console.log(`attemptAutoLogin: ${Platform.OS} 환경에서는 자동 로그인을 건너뜁니다.`);
    return false;
  }

  try {
    const storedAccessToken = await AsyncStorage.getItem('accessToken');
    const storedMemberIdStr = await AsyncStorage.getItem('memberId');
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

    if (storedAccessToken && storedMemberIdStr && storedRefreshToken) {
      const memberId = Number(storedMemberIdStr);
      useAuthStore.getState().actions.setAuthInfo({ memberId, accessToken: storedAccessToken, refreshToken: storedRefreshToken });
      console.log('attemptAutoLogin: 스토어 로드 완료. 토큰 재발급 시도...');

      const refreshedSuccessfully = await refreshAccessToken();
      if (refreshedSuccessfully) {
          console.log('attemptAutoLogin: 토큰 재발급 성공 또는 기존 토큰 유효.');
          const anonymousInfo = await getAnonymousInfo(memberId);
          if (anonymousInfo) {
            useSharedProfileStore.getState().actions.setSharedProfile({
              nickname: anonymousInfo.nickname, profileImage: anonymousInfo.profile,
              totalDice: anonymousInfo.totalDice, isInChat: anonymousInfo.roomStatus === 'ROOM_ENTER' || anonymousInfo.exitStatus !== "ROOM_EXIT",
            });
            console.log('attemptAutoLogin: 공유 프로필 정보 로드 성공.');
          } else {
            console.warn('attemptAutoLogin: 공유 프로필 정보 로드 실패.');
          }
          return true;
      } else {
          console.log('attemptAutoLogin: 토큰 재발급 실패. 자동 로그인 실패.');
          return false;
      }
    } else {
      const { accessToken: currentTokenInStore, memberId: currentMemberIdInStore } = useAuthStore.getState();
      if (currentTokenInStore || currentMemberIdInStore) {
          await clearAllStores(); 
      } else {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('memberId');
        }
      }
      return false;
    }
  } catch (error) {
    console.error('🚨 attemptAutoLogin 중 예기치 않은 오류 발생:', error);
    await clearAllStores(); 
    return false;
  }
}; 