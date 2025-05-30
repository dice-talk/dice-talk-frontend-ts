// import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore"; // 기존 스토어 임포트 제거
import useAuthStore from "@/zustand/stores/authStore"; // 새 스토어 임포트
import useSharedProfileStore from "@/zustand/stores/sharedProfileStore"; // 새 스토어 임포트
import useSignupProgressStore from "@/zustand/stores/signupProgressStore"; // 새 스토어 임포트

import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useAnonymousStore } from "../zustand/stores/anonymous"; // 이 스토어는 sharedProfileStore로 대체됨
import { axiosWithToken } from "./axios/axios";


// 회원가입 
export const createMemberInfo = async (memberInfo: any) => { // 타입은 SignupInput에서 보내는 payload에 맞춤
    try{
        const response = await axiosWithToken.post("/auth/register", memberInfo);
        return response.data; 
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error);
        throw error;
    }
};

// 회원정보 수정 -지역 
export const updateRegion = async (memberId: number | null, region: string) => { // memberId 인자 추가
    try{
        // const memberId = useAuthStore.getState().memberId; // 내부 참조 제거
        if (!memberId) {
            console.error("🚨 지역 수정 실패: memberId가 제공되지 않았습니다."); // 메시지 수정
            throw new Error("memberId is not available for updateRegion");
        }
        const response = await axiosWithToken.patch(`/my-info/${memberId}`, { region });
        console.log("✅ 지역 변경 API 호출 성공:", region);

        // 이 함수는 API 호출만 담당. Zustand 스토어 직접 업데이트 X.
        // MyInfoPage에서 이 함수 호출 후, 성공 시 로컬 상태를 업데이트하거나, 
        // getMemberDetailsForMyInfoPage를 다시 호출하여 상세 정보를 갱신.
        // 만약 sharedProfileStore에 간략한 지역 정보가 있고, 그것도 갱신해야 한다면 여기서 처리 가능하나,
        // 현재 설계에서는 sharedProfileStore에 상세 지역 정보 없음.
        console.log("✅ 지역 변경 API 호출 성공:", response.data.data?.region || response.data.region);
        return region;//response.data.data || response.data; 
    } catch (error) {
        console.error("🚨 지역 수정 실패:", error);
        throw error;
    }
};

// 비밀번호 변경
export const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
        // 비밀번호 변경 API는 memberId가 필요 없을 수도 있지만, 필요하다면 authStore에서 가져와 사용
        //const memberId = useAuthStore.getState().memberId;
        const response = await axiosWithToken.post("/password", {
            oldPassword,
            newPassword,
        });
        return response.data;
    } catch (error) {
        console.error("🚨 비밀번호 변경 실패:", error);
        throw error;
    }
};

// 익명 회원 정보 조회 (주로 ProfileHeader 용도 - /my-page/{memberId})
// 이 함수는 호출부에서 sharedProfileStore를 업데이트.
export const getAnonymousInfo = async (memberId: number | null) => { // memberId 인자 추가 및 null 허용
    try{
        // const memberId = useAuthStore.getState().memberId; // 내부 참조 제거
        if (!memberId) {
            console.warn("getAnonymousInfo: memberId가 제공되지 않았습니다. 익명 정보 조회를 건너뜁니다."); // 메시지 수정
            return null; 
        }
        console.log(`getAnonymousInfo: Fetching /my-page/${memberId}`);
        const response = await axiosWithToken.get(`/my-page/${memberId}`);
        
        if (response && response.data && response.data.data) { 
            return response.data.data; 
        } else if (response && response.data) { 
            return response.data;
        }
        console.warn("getAnonymousInfo: API 응답에서 데이터를 찾을 수 없습니다.", response);
        return null; 
    } catch (error) {
        console.error("🚨 /my-page/{memberId} 정보 조회 실패:", error);
        throw error; 
    }
};


// 회원 상세 정보 조회 (MyInfoPage 필드 용도 - /my-info/{member-id})
// 이 함수는 MyInfoPage에서 호출하여 로컬 상태를 업데이트.
export const getMemberDetailsForMyInfoPage = async (memberId: number | null) => { // memberId 인자 추가 및 null 허용
    try {
        // const memberId = useAuthStore.getState().memberId; // 내부 참조 제거
        if (!memberId) {
            console.warn("getMemberDetailsForMyInfoPage: memberId가 제공되지 않았습니다."); // 메시지 수정
            return null;
        }
        console.log(`getMemberDetailsForMyInfoPage: Fetching /my-info/${memberId}`);
        const response = await axiosWithToken.get(`/my-info/${memberId}`);

        if (response && response.data && response.data.data) {
            console.log("getMemberDetailsForMyInfoPage: API 응답 데이터:", response.data.data);
            return response.data.data; 
        }
        console.warn("getMemberDetailsForMyInfoPage: API 응답에서 데이터를 찾을 수 없습니다.", response);
        return null;
    } catch (error) {
        console.error("🚨 /my-info/{member-id} 상세 정보 조회 실패:", error);
        throw error;
    }
};


// 로그아웃 (토큰 제거 및 상태 초기화)
export const logoutMember = async () => {
    try {
        console.log("로그아웃 시작: AsyncStorage에서 토큰 제거 중...");
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("memberId"); // memberId도 AsyncStorage에서 관리했다면 제거
        console.log("AsyncStorage 토큰 제거 완료.");
        
        console.log("Zustand 스토어 클리어 중...");
        useAuthStore.getState().actions.clearAuthInfo(); 
        useSharedProfileStore.getState().actions.clearSharedProfile(); 
        useSignupProgressStore.getState().actions.clearSignupData(); // 회원가입 진행 중 데이터도 클리어
        console.log("Zustand 스토어 클리어 완료.");
        
        console.log("✅ 로그아웃 성공");
        return true;
    } catch (error) {
        console.error("🚨 로그아웃 실패:", error);
        // 실패 시에도 로컬 데이터는 최대한 정리 시도
        await AsyncStorage.removeItem("accessToken").catch(e => console.error("Failed to remove accessToken on error", e));
        await AsyncStorage.removeItem("refreshToken").catch(e => console.error("Failed to remove refreshToken on error", e));
        await AsyncStorage.removeItem("memberId").catch(e => console.error("Failed to remove memberId on error", e));
        
        // 스토어 클리어도 다시 시도
        try {
            useAuthStore.getState().actions.clearAuthInfo(); 
            useSharedProfileStore.getState().actions.clearSharedProfile(); 
            useSignupProgressStore.getState().actions.clearSignupData();
        } catch (storeError) {
            console.error("🚨 로그아웃 실패 중 스토어 클리어 추가 오류:", storeError);
        }
        throw error; // 원본 에러를 다시 throw
    }
};


// 회원 탈퇴
export const deleteMember = async (reason: string) => {
    try{
        // const memberId = useMemberInfoStore.getState().memberId;
        const memberId = 4;
        const response = await axiosWithToken.delete(`/my-info/${memberId}`, {
            data: reason,
            headers: {
                'Content-Type': 'text/plain'
            }
        });
        return response.data;
    } catch (error) {
        console.error("🚨 회원 탈퇴 실패:", error);
        throw error;
    }
};

// 회원 단일 조회
export const getMember = async () => {
    try{
        const memberId = Number(await AsyncStorage.getItem("memberId"));
        // const memberId = 4;
        const response = await axiosWithToken.get(`/my-info/${memberId}`, {
        });
        return response.data.data;
    } catch (error) {
        console.error("🚨 회원 조회 실패:", error);
        throw error;
    }
};

