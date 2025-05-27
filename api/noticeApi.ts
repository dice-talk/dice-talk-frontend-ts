import { axiosWithToken } from "./axios/axios"; // axiosWithToken으로 변경

// API 응답에 따른 공지사항 아이템 타입
export interface NoticeItemDto {
  noticeId: number;
  title: string;
  content?: string; // 목록에서는 content가 없을 수 있으므로 optional
  noticeImages?: string[]; // API 명세에 따라 noticeImages 또는 thumbnail
  thumbnail?: string; // API 명세에 thumbnail 필드가 있음
  noticeStatus: "CLOSED" | "ONGOING";
  noticeType: "NOTICE" | "EVENT";
  createdAt: string; // "YYYY-MM-DDTHH:mm:ss" 또는 "YYYY-MM-DD HH:MM:SS" 형식일 수 있음
  modifiedAt?: string;
  importance: number; // 0 또는 1 (1이면 중요)
  startDate?: string; // 이벤트 시작일 (EVENT 타입일 때)
  endDate?: string; // 이벤트 종료일 (EVENT 타입일 때)
}

// 공지사항 목록 조회 API 응답 타입
export interface NoticeListResponse {
  data: {
    noticeList: NoticeItemDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number; // API 명세서에는 page로 되어있을 수 있음 (0-indexed)
    size: number;
  };
  // status, message 등 공통 응답 구조가 있다면 추가
}

// 공지사항 단건 조회 API 응답 타입 (상세 페이지용)
export interface NoticeDetailResponse {
  data: NoticeItemDto; // 상세 정보는 content 포함
  // status, message 등
}

interface GetNoticesParams {
  page?: number; // 기본값 0
  size?: number; // 기본값 10 또는 20
  noticeType?: "ALL" | "NOTICE" | "EVENT"; // "ALL"은 백엔드에서 빈 값으로 처리될 수 있음
  keyword?: string;
}

// 공지사항 목록 조회 API
export const getNotices = async (params: GetNoticesParams = {}): Promise<NoticeListResponse> => {
  try {
    const queryParams: Record<string, any> = { ...params };
    if (params.noticeType === "ALL") {
      delete queryParams.noticeType; // "ALL"일 경우 noticeType 파라미터 제거
    }

    const response = await axiosWithToken.get<NoticeListResponse>("/notices", { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("🚨 공지사항 목록 조회 실패:", error);
    throw error;
  }
};

// 공지사항 상세 조회 API
export const getNoticeById = async (noticeId: number): Promise<NoticeDetailResponse> => {
  try {
    const response = await axiosWithToken.get<NoticeDetailResponse>(`/notices/${noticeId}`);
    return response.data;
  } catch (error) {
    console.error(`🚨 공지사항 상세 조회 실패 (ID: ${noticeId}):`, error);
    throw error;
  }
};

// 기존 getNotice 함수는 용도가 불분명하고 파라미터 타입이 맞지 않아 주석 처리 또는 삭제
/*
type Notice = { // 이 타입은 NoticeItemDto와 유사하나, API 명세 기반으로 NoticeItemDto 사용 권장
    noticeId: number;
    title: string;
    content: string;
    images: string[];
    createdAt: string;
}

export const getNotice = async (notice: Notice) => { // notice 파라미터는 사용되지 않음
    try{
        // axiosWithToken 사용 여부 확인 필요 (공지사항 조회가 인증 필요한지)
        const response = await axiosWithToken.get("/notices"); // 파라미터 없이 호출하면 첫 페이지만 가져옴
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error); // 메시지가 "회원 정보 생성 실패"로 되어 있어 수정 필요
        throw error;
    }
};
*/