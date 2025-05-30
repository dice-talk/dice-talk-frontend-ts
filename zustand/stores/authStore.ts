import { create } from 'zustand';

interface AuthState {
  memberId: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAppInitialized: boolean; // 앱의 기본적인 초기화(폰트 로딩 등) 완료 여부
  isAutoLoginAttempted: boolean; // 자동 로그인 시도 완료 여부
  actions: {
    setAuthInfo: (data: { memberId: number; accessToken: string; refreshToken: string }) => void;
    clearAuthInfo: () => void;
    setAppInitialized: (isInitialized: boolean) => void;
    setAutoLoginAttempted: (isAttempted: boolean) => void;
    // 비동기 액션 (예: AsyncStorage에서 토큰 로드)은 스토어 외부 또는 미들웨어 사용 고려
  };
}

const useAuthStore = create<AuthState>((set) => ({
  memberId: null,
  accessToken: null,
  refreshToken: null,
  isAppInitialized: false,
  isAutoLoginAttempted: false,
  actions: {
    setAuthInfo: ({ memberId, accessToken, refreshToken }) => {
      console.log('authStore: setAuthInfo', { memberId, accessTokenIsPresent: !!accessToken, refreshTokenIsPresent: !!refreshToken });
      set({ memberId, accessToken, refreshToken });
    },
    clearAuthInfo: async () => {
      console.log('authStore: clearAuthInfo');
      set({ memberId: null, accessToken: null, refreshToken: null });
      // AsyncStorage에서도 관련 아이템 제거 (선택적, 로그아웃 API에서 이미 처리한다면 중복될 수 있음)
      // await AsyncStorage.removeItem('memberId');
      // await AsyncStorage.removeItem('accessToken');
      // await AsyncStorage.removeItem('refreshToken');
    },
    setAppInitialized: (isInitialized) => {
      console.log('authStore: setAppInitialized', isInitialized);
      set({ isAppInitialized: isInitialized });
    },
    setAutoLoginAttempted: (isAttempted) => {
      console.log('authStore: setAutoLoginAttempted', isAttempted);
      set({ isAutoLoginAttempted: isAttempted });
    },
  },
}));

// 스토어 외부에서 액션만 쉽게 사용하기 위해 export (선택적)
export const useAuthActions = () => useAuthStore((state) => state.actions);

export default useAuthStore; 