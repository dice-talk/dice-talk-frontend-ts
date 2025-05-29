import { MemberInfo } from "@/types/MemberInfo";
import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAnonymousStore } from "../zustand/stores/anonymous";
import { axiosWithToken } from "./axios/axios";


// 회원가입 
export const createMemberInfo = async (memberInfo: MemberInfo) => {
    try{
        const response = await axiosWithToken.post("/auth/register", memberInfo);
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error);
        throw error;
    }
};

// 회원정보 수정 -지역
export const updateRegion = async (region: string) => {
    try{
        const memberId = useAnonymousStore.getState().memberId;
        const response = await axiosWithToken.patch(`/my-info/${memberId}`, { region });

        // Zustand 상태 업데이트
        useMemberInfoStore.getState().setRegion(response.data.region);
        console.log("✅ 지역 변경 성공:", response.data.region);
        return response.data;
    } catch (error) {
        console.error("🚨 지역 수정 실패:", error);
        throw error;
    }
};

// 비밀번호 변경
export const updatePassword = async (oldPassword: string, newPassword: string) => {
    try {
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

// 익명 회원 정보 조회
export const getAnonymousInfo = async (memberId: number) => {
    try{
        const response = await axiosWithToken.get(`/my-page/${memberId}`);
        const { memberId: id, profile, nickname, roomStatus, totalDice } = response.data;

        // Zustand에 상태 업데이트 (전역 상태 관리)
        useAnonymousStore.getState().setMemberInfo(nickname, profile, totalDice, roomStatus === "IN_CHAT");
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 조회 실패:", error);
        throw error;
    }
};

// 로그아웃 (토큰 제거 및 상태 초기화)
export const logoutMember = async () => {
    try {
        // 백엔드에 로그아웃 API가 있다면 호출 (선택 사항)
        // 예: await axiosWithToken.post("/auth/logout");

        console.log("로그아웃 시작: AsyncStorage에서 토큰 제거 중...");
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken"); // refreshToken도 제거
        await AsyncStorage.removeItem("memberId");
        console.log("AsyncStorage 토큰 제거 완료.");
        
        // Zustand 스토어 클리어
        console.log("Zustand 스토어 클리어 중...");
        useMemberInfoStore.getState().clearStore(); 
        useAnonymousStore.getState().clearStore(); 
        console.log("Zustand 스토어 클리어 완료.");
        
        console.log("✅ 로그아웃 성공");
        return true; // 성공 여부 반환
    } catch (error) {
        console.error("🚨 로그아웃 실패:", error);
        // 실패 시에도 로컬 데이터는 최대한 정리 시도
        await AsyncStorage.removeItem("accessToken").catch(e => console.error("Failed to remove accessToken on error", e));
        await AsyncStorage.removeItem("refreshToken").catch(e => console.error("Failed to remove refreshToken on error", e));
        await AsyncStorage.removeItem("memberId").catch(e => console.error("Failed to remove memberId on error", e));
        useMemberInfoStore.getState().clearStore(); 
        useAnonymousStore.getState().clearStore(); 
        throw error;
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

