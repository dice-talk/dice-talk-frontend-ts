import { useMemberStore } from "../zustand/stores/memberStore";
import { axiosWithToken } from "./axios/axios";

export const getMemberInfo = async (memberId: number) => {
    try{
        const response = await axiosWithToken.get(`/my-page/${memberId}`);
        const { memberId: id, profile, nickname, roomStatus, totalDice } = response.data;

        // Zustand에 상태 업데이트 (전역 상태 관리)
        useMemberStore.getState().setMemberInfo(nickname, profile, totalDice, roomStatus === "IN_CHAT");
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 조회 실패:", error);
        throw error;
    }
};