import { axiosWithToken } from "./axios/axios";

// home 조회 (메인 화면 들어갈때 필요한 기본 데이터 요청)
export const getHomeApi = async () => {
  try {
    const response = await axiosWithToken.get(`/home`);
    console.log(`🔍 홈 조회 응답:`, { status: response.status, data: response.data });
    return response; // 전체 response 객체 반환

  } catch (error) {
    console.error("🚨 알림 삭제 실패:", error);
    throw error;
  }
};