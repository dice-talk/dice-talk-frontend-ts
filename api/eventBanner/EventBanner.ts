import { axiosWithToken } from "@/api/axios/axios";
import { EventBanner } from "@/types/EventBanner";

// 이벤트 배너 조회
// 해당 url로 요청보내면 EventBanner[] 타입의 데이터가 반환됨
export const getEventBanner = async (): Promise<EventBanner[]> => {
  const response = await axiosWithToken.get<EventBanner[]>("eventBanner 요청 url로 수정해야함");
  return response.data;
};
