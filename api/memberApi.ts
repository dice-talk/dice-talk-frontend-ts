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
        console.log("로그아웃/탈퇴 후 데이터 정리 시작: AsyncStorage에서 토큰 제거 중..."); // 메시지 수정
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("memberId"); 
        console.log("AsyncStorage 토큰 제거 완료.");
        
        console.log("Zustand 스토어 클리어 중...");
        useAuthStore.getState().actions.clearAuthInfo(); 
        useSharedProfileStore.getState().actions.clearSharedProfile(); 
        useSignupProgressStore.getState().actions.clearSignupData(); 
        // 다른 사용자 특정 스토어가 있다면 여기서 추가로 클리어
        console.log("Zustand 스토어 클리어 완료.");
        
        console.log("✅ 로그아웃/탈퇴 후 데이터 정리 성공"); // 메시지 수정
        return true;
    } catch (error) {
        console.error("🚨 로그아웃/탈퇴 중 데이터 정리 실패:", error); // 메시지 수정
        await AsyncStorage.removeItem("accessToken").catch(e => console.error("Failed to remove accessToken on error", e));
        await AsyncStorage.removeItem("refreshToken").catch(e => console.error("Failed to remove refreshToken on error", e));
        await AsyncStorage.removeItem("memberId").catch(e => console.error("Failed to remove memberId on error", e));
        
        try {
            useAuthStore.getState().actions.clearAuthInfo(); 
            useSharedProfileStore.getState().actions.clearSharedProfile(); 
            useSignupProgressStore.getState().actions.clearSignupData();
        } catch (storeError) {
            console.error("🚨 데이터 정리 실패 중 스토어 클리어 추가 오류:", storeError); // 메시지 수정
        }
        throw error; 
    }
};


// 회원 탈퇴
export const deleteMember = async (reason: string) => {
    try{
        const memberId = useAuthStore.getState().memberId;
        if (!memberId) {
            console.error("🚨 회원 탈퇴 실패: memberId를 찾을 수 없습니다.");
            throw new Error("Member ID not found for deletion.");
        }

        // API 명세서에 따르면 request body에 reason을 JSON 형태로 전달해야 합니다.
        const response = await axiosWithToken.delete(`/my-info/${memberId}`, {
            data: { reason }, // { "reason": "원하는 서비스가 아니예요." } 형태
        });

        // HTTP 204 No Content 응답을 성공으로 간주
        if (response.status === 204) {
            console.log("✅ 회원 탈퇴 API 호출 성공");
            // 탈퇴 성공 후 로컬 데이터 및 스토어 정리
            await logoutMember(); // logoutMember 함수를 호출하여 데이터 정리
            return true; // 또는 API 응답이 있다면 그대로 반환
        } else {
            // 204가 아닌 다른 성공 응답 코드가 있을 경우 (명세서에는 없지만 만약을 위해)
            console.warn("🚨 회원 탈퇴 API는 성공했으나 예상치 못한 상태 코드:", response.status, response.data);
            // 이 경우에도 데이터는 정리하는 것이 안전할 수 있음
            await logoutMember();
            return response.data; // 또는 true
        }

    } catch (error: any) {
        // Axios 에러 객체에서 실제 HTTP 응답 상태 코드와 데이터를 확인
        if (error.response) {
            console.error(`🚨 회원 탈퇴 실패: 서버 응답 상태 ${error.response.status}`, error.response.data);
        } else if (error.request) {
            // 요청은 이루어졌으나 응답을 받지 못한 경우
            console.error("🚨 회원 탈퇴 실패: 서버에서 응답이 없습니다.", error.request);
        } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error("🚨 회원 탈퇴 실패: 요청 설정 오류", error.message);
        }
        // 탈퇴 실패 시에는 로컬 데이터를 유지할 수도 있고, 상황에 따라 정리할 수도 있습니다.
        // 여기서는 우선 실패 시 로컬 데이터를 건드리지 않는 것으로 가정합니다.
        throw error; // 원본 에러를 다시 throw
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

