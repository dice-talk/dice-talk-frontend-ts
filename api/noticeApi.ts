import axios from 'axios'; // Import axios for isAxiosError
import { axiosWithToken } from "./axios/axios"; // axiosWithToken으로 변경

export interface NoticeImage {
    noticeImageId: number;
    imageUrl: string;
    thumbnail?: boolean;
  }

// API 응답에 따른 공지사항 아이템 타입
export interface NoticeItemDto {
  noticeId: number;
  title: string;
  content?: string; // 목록에서는 content가 없을 수 있으므로 optional
  noticeImages?: NoticeImage[]; // API 명세에 따라 noticeImages 또는 thumbnail
  thumbnail?: string; // API 명세에 thumbnail 필드가 있음
  noticeStatus?: string; // 백엔드 응답 예시의 noticeStatus 사용 (타입은 더 구체화 가능)
  noticeType: "NOTICE" | "EVENT" | "UPDATE";
  createdAt: string; // "YYYY-MM-DDTHH:mm:ss" 또는 "YYYY-MM-DD HH:MM:SS" 형식일 수 있음
  modifiedAt?: string;
  noticeImportance?: number; // API 응답 예시의 noticeImportance 사용 (0, 1, 2 등)
  startDate?: string; // 이벤트 시작일 (EVENT 타입일 때)
  endDate?: string; // 이벤트 종료일 (EVENT 타입일 때)
}

// API 응답 예시의 pageInfo 구조 반영
interface PageInfo {
  page: number; // 1-based from backend example
  size: number;
  totalElements: number;
  totalPages: number;
}

// 공지사항 목록 조회 API 응답 타입
export interface NoticeListResponse {
  noticeList: NoticeItemDto[];
  totalElements: number;
  totalPages: number;
  currentPage: number; // 0-indexed for frontend state
  size: number;
}

// 공지사항 단건 조회 API 응답 타입 (상세 페이지용)
export interface NoticeDetailDto extends Omit<NoticeItemDto, 'content'> {
    content: string; // 상세 조회 시 content는 항상 존재
}

interface GetNoticesParams {
  page?: number; // 1-based for API call
  size?: number; 
  type?: "NOTICE" | "EVENT" | "UPDATE" | "ALL"; // "ALL" 추가
  keyword?: string;
  // sortBy?: string; // API 명세에 현재 없음, 필요시 추가
  // sortOrder?: "ASC" | "DESC"; // API 명세에 현재 없음, 필요시 추가
}

// 공지사항 목록 조회 API
export const getNotices = async (params: GetNoticesParams = {}): Promise<NoticeListResponse> => {
  try {
    const queryParams: Record<string, any> = {};

    // page는 1-based로 전달, 기본값 1 (백엔드가 Positive 처리)
    queryParams.page = params.page || 1;
    queryParams.size = params.size || 10; // 기본값 10

    if (params.type && params.type !== "ALL") {
      queryParams.type = params.type;
    }
    if (params.keyword && params.keyword.trim() !== "") {
      queryParams.keyword = params.keyword.trim();
    }
    // sortBy, sortOrder는 현재 API 명세에 없으므로 주석 처리 또는 제거
    // if (params.sortBy) queryParams.sortBy = params.sortBy;
    // if (params.sortOrder) queryParams.sortOrder = params.sortOrder;

    console.log("🚀 Sending GET /notices with queryParams:", queryParams);
    const response = await axiosWithToken.get<{
        data: NoticeItemDto[], 
        pageInfo: PageInfo 
    }>("/notices", { params: queryParams });

    // API 응답의 page (1-based)를 프론트엔드 상태용 currentPage (0-based)로 변환
    return {
        noticeList: response.data.data,
        totalElements: response.data.pageInfo.totalElements,
        totalPages: response.data.pageInfo.totalPages,
        currentPage: response.data.pageInfo.page - 1, // 0-indexed로 변환
        size: response.data.pageInfo.size
    };

  } catch (error) {
    console.error("🚨 공지사항 목록 조회 실패 (api/noticeApi.ts):");
    if (axios.isAxiosError(error)) { // axios.isAxiosError 사용
      console.error("Axios error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: { // 전체 config 대신 주요 정보만 로깅 (옵션)
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params,
          data: error.config?.data,
        }
      });
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
};

// 공지사항 상세 조회 API
export const getNoticeById = async (noticeId: number): Promise<NoticeDetailDto> => {
  try {
    // 백엔드 응답이 { data: NoticeDetailDto } 형태이므로, 해당 구조에 맞게 수정
    const response = await axiosWithToken.get<{ data: NoticeDetailDto }>(`/notices/${noticeId}`);
    return response.data.data; // 실제 상세 데이터 반환
  } catch (error) {
    console.error(`🚨 공지사항 상세 조회 실패 (ID: ${noticeId}):`, error);
    if (axios.isAxiosError(error)) { 
        console.error("Axios error details (getNoticeById):", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          config: { // 전체 config 대신 주요 정보만 로깅 (옵션)
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params,
            data: error.config?.data,
          }
        });
      } else {
        console.error("Unknown error (getNoticeById):", error);
      }
    throw error;
  }
};