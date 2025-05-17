import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import { axiosWithoutToken } from "./axios/axios";

const loginMember = async (email: string, password: string) => {
    try{
        const response = await axiosWithoutToken.post("/auth/login", { email, password });

        const { token, memberInfo } = response.data;
        useMemberInfoStore.getState().setMemberInfo(memberInfo);
        useMemberInfoStore.getState().setToken(token);
        return response.data;

    } catch (error) {
        console.error("🚨 로그인 실패:", error);
        throw error;
    }
};