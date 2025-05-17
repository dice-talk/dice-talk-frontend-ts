import { MemberInfo } from "@/types/MemberInfo";
import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
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
        useMemberInfoStore.getState().updateMemberInfo({ region: response.data.region });
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