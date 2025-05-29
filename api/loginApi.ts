import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import { axiosWithoutToken } from "./axios/axios";

export const loginMember = async (email: string, password: string) => {
    try{
        const response = await axiosWithoutToken.post("/auth/login", { username: email, password: password });

        const authorizationHeader = response.headers?.authorization || response.headers?.Authorization;
        let token = null;
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
          token = authorizationHeader.substring(7);
        }

        const memberId = response.data?.memberId;

        if (memberId && token) {
            useMemberInfoStore.getState().setMemberId(memberId);
            useMemberInfoStore.getState().setToken(token);
        } else {
            console.error("🚨 로그인 실패: 응답에서 memberId 또는 token을 찾을 수 없습니다.", response);
            throw new Error("로그인 응답 형식이 올바르지 않습니다.");
        }
        
        return response;

    } catch (error) {
        console.error("🚨 로그인 실패:", error);
        throw error;
    }
};