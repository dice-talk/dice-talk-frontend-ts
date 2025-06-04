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

export const sendVerificationEmail = async (email: string): Promise<{ message: string }> => {
    try {
        const response = await axiosWithoutToken.post<{ message: string }>("/auth/email", { email });
        console.log('이메일 인증 요청 API 응답:', response.data);
        return response.data; // 성공 시 { message: "..." } 반환
    } catch (error: any) {
        console.error("🚨 이메일 인증 요청 실패:", error.response?.data || error.message);
        // 500 에러 시 반환되는 객체에서 message를 추출하거나, 일반적인 에러 메시지 사용
        const errorMessage = error.response?.data?.message || "이메일 인증 요청 중 오류가 발생했습니다.";
        throw new Error(errorMessage);
    }
};

interface VerifyCodeParams {
  email: string;
  code: string;
}

interface VerifyCodeResponse {
  message: string; // 성공 시
  error?: string;   // 실패 시 (선택적)
}

export const verifyAuthCode = async ({ email, code }: VerifyCodeParams): Promise<VerifyCodeResponse> => {
    try {
        const response = await axiosWithoutToken.post<VerifyCodeResponse>("/auth/verify-code", { email, code });
        console.log('인증번호 검증 API 응답:', response.data);
        return response.data; // 성공 시 { message: "..." }
    } catch (error: any) {
        console.error("🚨 인증번호 검증 실패 (API 응답):", error.response?.data);
        console.error("🚨 인증번호 검증 실패 (전체 에러 객체):", error);

        if (error.response && error.response.data) {
            // 서버가 응답 본문에 에러 정보를 담아 보냈다면, 그 객체를 throw
            // 이렇게 하면 VerifyCode.tsx에서 error.status, error.message 등을 사용할 수 있음
            throw error.response.data;
        }
        // 그 외의 경우 (네트워크 오류 등 서버 응답이 없는 경우) 일반 에러 throw
        throw new Error("인증 처리 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
    }
};

// 비회원 문의용 이메일 인증번호 검증 함수
interface VerifyCodeForNonMemberParams {
  email: string;
  code: string;
}

interface VerifyCodeForNonMemberResponse {
  message: string; // 성공 시
  // 서버 응답에 따라 추가적인 필드가 있을 수 있음 (예: 임시 토큰 등)
}

export const verifyCodeForNonMember = async ({ email, code }: VerifyCodeForNonMemberParams): Promise<VerifyCodeForNonMemberResponse> => {
    try {
        // axiosWithoutToken을 사용하여 /auth/verify-code-email 엔드포인트로 요청
        const response = await axiosWithoutToken.post<VerifyCodeForNonMemberResponse>("/auth/verify-code-email", { email, code });
        console.log('비회원 문의용 인증번호 검증 API 응답:', response.data);
        return response.data; // 성공 시 { message: "..." } 또는 서버가 제공하는 응답 객체
    } catch (error: any) {
        console.error("🚨 비회원 문의용 인증번호 검증 실패 (API 응답):", error.response?.data);
        console.error("🚨 비회원 문의용 인증번호 검증 실패 (전체 에러 객체):", error);

        if (error.response && error.response.data) {
            // 서버가 응답 본문에 에러 정보를 담아 보냈다면, 그 객체를 throw
            throw error.response.data;
        }
        // 그 외의 경우 (네트워크 오류 등 서버 응답이 없는 경우) 일반 에러 throw
        throw new Error("인증 처리 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
    }
};
