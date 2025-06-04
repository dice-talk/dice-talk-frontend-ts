import useAuthStore from '@/zustand/stores/authStore';
import useSharedProfileStore from '@/zustand/stores/sharedProfileStore';
import useSignupProgressStore from '@/zustand/stores/signupProgressStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithoutToken } from './axios/axios'; // axios 인스턴스 경로는 실제 프로젝트에 맞게 조정해주세요.
import { getAnonymousInfo } from './memberApi'; // getAnonymousInfo 임포트

// 모든 스토어 클리어하는 헬퍼 함수
const clearAllStores = async () => {
  useAuthStore.getState().actions.clearAuthInfo();
  useSharedProfileStore.getState().actions.clearSharedProfile();
  useSignupProgressStore.getState().actions.clearSignupData();
  // AsyncStorage에서 모든 관련 아이템 제거
  await AsyncStorage.removeItem('accessToken');
  await AsyncStorage.removeItem('refreshToken');
  await AsyncStorage.removeItem('memberId');
  console.log('clearAllStores: 모든 스토어 및 AsyncStorage 토큰/memberId 정리 완료');
};

// 토큰 재발급 API 호출
export const refreshAccessToken = async (): Promise<boolean> => {
  const { accessToken: currentAccessTokenInStore, refreshToken: currentRefreshTokenInStore, memberId } = useAuthStore.getState();
  // AsyncStorage에서 직접 토큰을 가져옵니다. 스토어 상태는 API 호출 성공 후 업데이트될 예정입니다.
  const storedAccessToken = await AsyncStorage.getItem('accessToken');
  const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

  // API 요청에 사용할 refreshToken. AsyncStorage 값이 우선 (가장 최근 값일 가능성)
  const refreshTokenToUse = storedRefreshToken || currentRefreshTokenInStore;

  if (!refreshTokenToUse) {
    console.log('refreshAccessToken: 유효한 refreshToken이 스토어 또는 AsyncStorage에 없습니다. 재발급 불가.');
    await clearAllStores(); 
    return false;
  }

  // API 요청에 사용할 accessToken. AsyncStorage 값이 우선.
  const accessTokenForHeader = storedAccessToken || currentAccessTokenInStore || '';

  console.log('refreshAccessToken: 재발급 시도. 사용될 refreshToken (앞 15자):', refreshTokenToUse ? refreshTokenToUse.substring(0,15)+'...' : ' 없음');
  // console.log('refreshAccessToken: 사용될 accessToken (앞 15자):', accessTokenForHeader ? accessTokenForHeader.substring(0,15)+'...' : ' 없음'); // 디버깅 시 필요하면 주석 해제

  try {
    const response = await axiosWithoutToken.post('/auth/refresh', {}, { 
      headers: {
        // 백엔드에서 Authorization 헤더를 필요로 하는지 확인 필요. 일반적으로 refresh API는 refresh 토큰만으로 인증.
        // 만약 필요하다면, 만료된 accessToken이라도 보내야 할 수 있음.
        'Authorization': `Bearer ${accessTokenForHeader}`, // 백엔드 요구사항에 따라 이 줄을 주석 처리하거나 유지
        'Refresh': refreshTokenToUse, 
      },
    });

    const newAccessToken = response.data?.accessToken;
    const newRefreshToken = response.data?.refreshToken; // 1회용 정책이므로, 이 값은 항상 새로 받아야 함

    if (newAccessToken && newRefreshToken) { // 새로운 액세스 토큰과 새로운 리프레시 토큰이 모두 있어야 성공
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken); // 새로운 리프레시 토큰 저장
      
      // memberId는 변경되지 않으므로 기존 값 사용 (null일 수 없음, refresh 시도 전제는 로그인 상태)
      // attemptAutoLogin에서 스토어에 memberId를 먼저 로드하므로, 여기서 memberId가 null이면 문제 상황.
      if (memberId !== null) { 
        useAuthStore.getState().actions.setAuthInfo({
            memberId: memberId, 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken // 스토어에도 새로운 리프레시 토큰 업데이트
        });
        console.log('refreshAccessToken: 토큰 재발급 성공. 새 accessToken 및 새 refreshToken 저장됨.');
        return true;
      } else {
        // 이 경우는 attemptAutoLogin에서 스토어에 memberId를 제대로 못 넣었거나, 호출 순서가 꼬인 경우.
        console.error('🚨 refreshAccessToken 성공했으나 스토어에 memberId가 없어 AuthInfo 업데이트 불가. 심각한 오류 가능성.');
        await clearAllStores(); // 일관성을 위해 클리어
        return false;
      }
    } else {
      console.error('🚨 refreshAccessToken 실패: API 응답에 newAccessToken 또는 newRefreshToken이 없습니다.', response.data);
      await clearAllStores();
      return false;
    }
  } catch (error: any) {
    console.error('🚨 refreshAccessToken API 호출 중 오류:', error.response?.data || error.message);
    await clearAllStores();
    return false;
  }
};

// 앱 시작 시 또는 필요한 시점에 호출하여 자동 로그인 시도
export const attemptAutoLogin = async (): Promise<boolean> => {
  const { setAutoLoginAttempted } = useAuthStore.getState().actions;
  const { accessToken: currentTokenInStore, memberId: currentMemberIdInStore } = useAuthStore.getState();
  
  console.log('attemptAutoLogin: 시작.');
  setAutoLoginAttempted(true); // 자동 로그인 시도를 했다는 것을 먼저 기록

  try {
    const storedAccessToken = await AsyncStorage.getItem('accessToken');
    const storedMemberIdStr = await AsyncStorage.getItem('memberId');
    const storedRefreshToken = await AsyncStorage.getItem('refreshToken');

    if (storedAccessToken && storedMemberIdStr && storedRefreshToken) {
      const memberId = Number(storedMemberIdStr);
      console.log('attemptAutoLogin: AsyncStorage에 모든 토큰 및 memberId 존재.');
      // 스토어에 우선 로드 (refreshAccessToken 호출 전에 memberId가 필요할 수 있음)
      useAuthStore.getState().actions.setAuthInfo({
        memberId: memberId,
        accessToken: storedAccessToken,
        refreshToken: storedRefreshToken
      });
      console.log('attemptAutoLogin: 스토어 로드 완료. 토큰 재발급 시도...');

      const refreshedSuccessfully = await refreshAccessToken();
      if (refreshedSuccessfully) {
          console.log('attemptAutoLogin: 토큰 재발급 성공 또는 기존 토큰 유효.');
          // 익명 정보(공유 프로필 정보) 가져오기
          const anonymousInfo = await getAnonymousInfo(memberId); // memberApi에서 가져옴
          if (anonymousInfo) {
            useSharedProfileStore.getState().actions.setSharedProfile({
              nickname: anonymousInfo.nickname,
              profileImage: anonymousInfo.profile, // API 응답 필드명 확인 필요
              totalDice: anonymousInfo.totalDice,
              isInChat: anonymousInfo.roomStatus === 'ROOM_ENTER' || anonymousInfo.exitStatus !== "ROOM_EXIT", // API 응답 필드명 확인 필요
            });
            console.log('attemptAutoLogin: 공유 프로필 정보 로드 성공.');
          } else {
            console.warn('attemptAutoLogin: 공유 프로필 정보 로드 실패. UI는 기본값으로 표시될 수 있음.');
            // 공유 프로필 정보 로드 실패가 자동 로그인을 막지는 않음.
          }
          return true; // 자동 로그인 성공
      } else {
          console.log('attemptAutoLogin: 토큰 재발급 실패. 자동 로그인 실패.');
          // refreshAccessToken 내부에서 이미 AsyncStorage와 스토어가 정리되었을 것임
          return false;
      }
    } else {
      console.log('attemptAutoLogin: AsyncStorage에 accessToken, refreshToken 또는 memberId 없음. 자동 로그인 불가.');
      // 현재 스토어에 혹시라도 남아있을 수 있는 잔여 정보 클리어
      if (currentTokenInStore || currentMemberIdInStore) {
          console.log('attemptAutoLogin: 스토어에 잔여 정보가 있어 clearAllStores 호출.');
          await clearAllStores(); 
      } else {
          // AsyncStorage 아이템만 한번 더 확실히 제거
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('refreshToken');
          await AsyncStorage.removeItem('memberId');
      }
      return false;
    }
  } catch (error) {
    console.error('🚨 attemptAutoLogin 중 예기치 않은 오류 발생:', error);
    await clearAllStores(); 
    return false;
  }
}; 