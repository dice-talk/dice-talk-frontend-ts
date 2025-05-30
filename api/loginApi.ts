// import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import useAuthStore from '@/zustand/stores/authStore'; // authStore 임포트
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithoutToken } from "./axios/axios";
// AsyncStorage import는 스토어 저장 로직을 loginApi 내부에 유지한다면 필요할 수 있습니다.
// import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginMember = async (email: string, password: string): Promise<boolean> => {
    try{
        const response = await axiosWithoutToken.post("/auth/login", { username: email, password: password });
        console.log('로그인 API 응답 전체:', response);
        console.log('로그인 API 응답 헤더:', response.headers);

        const authorizationHeader = response.headers?.authorization || response.headers?.Authorization;
        let accessToken = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
          accessToken = authorizationHeader.substring(7);
        }
        console.log('추출된 AccessToken:', accessToken);
        
        // 응답 헤더에서 RefreshToken 추출 (실제 헤더 이름은 백엔드 확인 필요: 'Refresh', 'refresh', 'X-Refresh-Token' 등)
        const refreshTokenHeader = response.headers?.refresh || response.headers?.Refresh || response.headers?.['x-refresh-token'];
        let refreshToken = null;
        if (refreshTokenHeader) {
            // refreshToken에 'Bearer ' 접두사가 있는지 확인하고 필요시 제거 (일반적으로는 없음)
            if (typeof refreshTokenHeader === 'string' && refreshTokenHeader.toLowerCase().startsWith('bearer ')) {
                refreshToken = refreshTokenHeader.substring(7);
            } else {
                refreshToken = refreshTokenHeader as string; // 배열인 경우 첫번째 요소 사용 등의 처리 필요할 수 있음
            }
        }
        console.log('추출된 RefreshToken from header:', refreshToken);

        const memberId = response.data?.memberId; // memberId는 여전히 body에서 온다고 가정
        console.log('추출된 memberId:', memberId);

        if (memberId && accessToken && refreshToken) { 
            // useMemberInfoStore.getState().setMemberId(memberId);
            // useMemberInfoStore.getState().setToken(accessToken); 
            useAuthStore.getState().actions.setAuthInfo({ // authStore 사용
                memberId: Number(memberId), 
                accessToken: accessToken, 
                refreshToken: refreshToken
            });
            
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('memberId', String(memberId));
            
            console.log('AsyncStorage 및 스토어 저장 완료. AccessToken:', accessToken, 'RefreshToken:', refreshToken, 'MemberId:', memberId);
            // console.log('스토어 상태:', useMemberInfoStore.getState());
            console.log('authStore 상태:', useAuthStore.getState()); // authStore 상태 로깅
            return true;
        } else {
            console.error("🚨 로그인 실패: 응답에서 memberId, accessToken 또는 refreshToken(header)을 찾을 수 없습니다.", 
                          { memberId, accessToken, refreshToken, responseData: response.data, responseHeaders: response.headers });
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            await AsyncStorage.removeItem('memberId');
            // 로그인 실패 시 스토어도 정리 (선택적, authStore에 clearAuthInfo 같은 액션이 있다면 호출)
            useAuthStore.getState().actions.clearAuthInfo();
            throw new Error("로그인 응답 형식이 올바르지 않습니다. 토큰 또는 memberId 누락.");
        }
        
    } catch (error: any) {
        console.error("🚨 로그인 API 호출 중 에러 발생:", error.response?.data || error.message);
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('memberId');
        // 에러 발생 시 스토어도 정리
        useAuthStore.getState().actions.clearAuthInfo();
        throw new Error(error.response?.data?.message || error.message || "로그인 중 오류가 발생했습니다.");
    }
};