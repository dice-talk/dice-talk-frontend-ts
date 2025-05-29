import { axiosWithToken } from "./axios/axios";

// 알림 조회
export const getNotifications = async (page: number, size: number) => {
  try {
    const response = await axiosWithToken.get("/notifications", {
      params: { page, size },
    });
    
    // API 응답 구조: {data: [...], pageInfo: {...}}
    // 실제 알림 배열만 추출해서 반환
    console.log("🔍 API 전체 응답:", response.data);
    console.log("🔍 추출된 알림 배열:", response.data.data);
    
    return response.data.data || []; // data 필드만 반환, 없으면 빈 배열

  } catch (error) {
    console.error("🚨 알림 조회 실패:", error);
    throw error;
  }
};
// 알림 단일 삭제
export const deleteNotification = async (notificationId: number) => {
  try {
    const response = await axiosWithToken.delete(`/notifications/${notificationId}`);
    console.log(`🔍 단일 삭제 응답:`, { status: response.status, data: response.data });
    return response; // 전체 response 객체 반환

  } catch (error) {
    console.error("🚨 알림 삭제 실패:", error);
    throw error;
  }
};

// 전체 알림 삭제
export const deleteAllNotifications = async () => {
  try {
    const response = await axiosWithToken.delete("/notifications");
    console.log(`🔍 전체 삭제 응답:`, { status: response.status, data: response.data });
    return response; // 전체 response 객체 반환

  } catch (error) {
    console.error("🚨 전체 알림 삭제 실패:", error);
    throw error;
  }
};

// 전체 알림 읽음 처리
export const readAllNotifications = async () => {
  try {
    const response = await axiosWithToken.patch("/notifications/read-all");
    console.log(`🔍 전체 읽음 처리 응답:`, { status: response.status, data: response.data });
    return response;

  } catch (error) {
    console.error("🚨 전체 알림 읽음 처리 실패:", error);
    throw error;
  }
};

// 안읽은 알림 개수 조회 요청
export const getUnreadNotificationCount = async () => {
  try {
    const response = await axiosWithToken.get("/notifications/unread-count");
    console.log(`🔍 안읽은 알림 개수 조회 응답:`, { status: response.status, data: response.data });
    return response;

  } catch (error) {
    console.error("🚨 안읽은 알림 개수 조회 실패:", error);
    throw error;
  }
};
