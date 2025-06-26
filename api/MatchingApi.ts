
import useChatOptionStore from '@/zustand/stores/ChatOptionStore';
import axios from 'axios';
import { axiosWithToken } from "./axios/axios";
/**
 * 채팅방 매칭 요청 API
 * POST /matching/join
 * @returns Promise<{ message: string; chatRoomId?: number }> - 매칭 결과 메시지와 성공 시 채팅방 ID
 */
export const joinMatchingQueue = async (): Promise<{ message: string; chatRoomId?: number }> => {
  const { themeId, region, ageGroup } = useChatOptionStore.getState();
  try {
    // 인증된 요청이므로 axiosWithToken 사용
    // 컨트롤러에서 @RequestBody를 사용하지 않으므로, 요청 본문은 비워둡니다.
   const response = await axiosWithToken.post("/matching/join", {
      themeId,
      region,
      ageGroup, // 서버에서 받는 파라미터 이름이 birth라면 'birth: ageGroup'으로 변경
    });

    console.log("🤝 매칭 요청 API 응답:", response.data);

    // API 응답 그대로 반환 (message와 chatRoomId 포함 가능)
    return response.data;

  } catch (error) {
    console.error("🚨 매칭 요청 API 실패:", error);
    if (axios.isAxiosError(error) && error.response) {
      // 서버에서 구체적인 에러 메시지를 보냈다면 해당 메시지를 사용
      const apiErrorMessage = error.response.data?.message || "매칭 서버와 통신 중 오류가 발생했습니다.";
      throw new Error(apiErrorMessage);
    }
    // 그 외 네트워크 오류 등
    throw new Error("매칭 요청 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요.");
  }
};