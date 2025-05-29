import { axiosWithToken } from "./axios/axios"; // axiosWithToken으로 변경

export interface NoticeImage {
    imageId: number;
    imageUrl: string;
  }

// API 응답에 따른 공지사항 아이템 타입
export interface NoticeItemDto {
  noticeId: number;
  title: string;
  content?: string; // 목록에서는 content가 없을 수 있으므로 optional
  noticeImages?: NoticeImage[]; // API 명세에 따라 noticeImages 또는 thumbnail
  thumbnail?: string; // API 명세에 thumbnail 필드가 있음
  noticeStatus: "CLOSED" | "ONGOING" | "SCHEDULED";
  noticeType: "NOTICE" | "EVENT" | "UPDATE";
  createdAt: string; // "YYYY-MM-DDTHH:mm:ss" 또는 "YYYY-MM-DD HH:MM:SS" 형식일 수 있음
  modifiedAt?: string;
  importance: number; // 0 또는 1 (1이면 중요)
  startDate?: string; // 이벤트 시작일 (EVENT 타입일 때)
  endDate?: string; // 이벤트 종료일 (EVENT 타입일 때)
}

// 공지사항 목록 조회 API 응답 타입
export interface NoticeListResponse {
  noticeList: NoticeItemDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number; // API 명세서에는 page로 되어있을 수 있음 (0-indexed)
  size: number;
}

// 공지사항 단건 조회 API 응답 타입 (상세 페이지용)
export interface NoticeDetailResponse extends Omit<NoticeItemDto, 'content'> {
    content: string;
}

interface GetNoticesParams {
  page?: number; // 기본값 0
  size?: number; // 기본값 10 또는 20
  noticeType?: "ALL" | "NOTICE" | "EVENT" | "UPDATE"; // "ALL"은 백엔드에서 빈 값으로 처리될 수 있음
  keyword?: string;
  sortBy?: string; 
  sortOrder?: "ASC" | "DESC";
}

// 공지사항 목록 조회 API
export const getNotices = async (params: GetNoticesParams = {}): Promise<NoticeListResponse> => {
  try {
    const queryParams: Record<string, any> = { ...params };
    if (params.noticeType === "ALL") {
      delete queryParams.noticeType; // "ALL"일 경우 noticeType 파라미터 제거
    }

    // Default pagination if not provided
    queryParams.page = params.page || 0; // API might be 0-indexed
    queryParams.size = params.size || 10;

    const response = await axiosWithToken.get<{
        data: NoticeItemDto[], // Assuming the actual list is in 'data'
        totalElements: number,
        totalPages: number,
        number: number, // 'currentPage' might be 'number' (0-indexed)
        size: number
    }>("/notices", { params: queryParams });

    return {
        noticeList: response.data.data,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size
    };

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