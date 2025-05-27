import { axiosWithToken } from "./axios/axios";

type Notice = {
    noticeId: number;
    title: string;
    content: string;
    images: string[];
    createdAt: string;
}

// 회원가입 
export const getNotice = async (notice: Notice) => {
    try{
        const response = await axiosWithToken.get("/notices");
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error);
        throw error;
    }
};