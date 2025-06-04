import { axiosWithToken } from '@/api/axios/axios'; // Adjust path to your axios setup
import { ApiErrorResponse, ProductListResponse } from '@/types/Product';

/**
 * 상품(Product)의 전체 조회
 * GET /products
 */
export const getAllProducts = async (page: number, size: number): Promise<ProductListResponse> => {
  try {
    const response = await axiosWithToken.get<ProductListResponse>('/products', {
      params: { page, size },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching all products:", error.response?.data);
    throw error.response?.data as ApiErrorResponse || error;
  }
};

// --- DiceLog Types ---
export interface DiceLog {
  logId: number;
  quantity: number;
  logType: "DICE_CHARGE" | "DICE_USED";
  info: string;
  memberId: number;
  productId: number | null;
  itemId: number | null;
  createdAt: string;
}

export interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DiceLogListResponse {
  data: DiceLog[];
  pageInfo: PageInfo;
  // API 응답에 따라 message, code 등이 있다면 추가 가능
}

// --- DiceLog APIs ---

/**
 * 해당 회원의 다이스 구매(충전) 및 아이템 사용 내역 조회
 * GET /dices/{member-id}
 */
export const getMemberDiceLogs = async (
  memberId: number,
  page: number,
  size: number
): Promise<DiceLogListResponse> => {
  try {
    const response = await axiosWithToken.get<DiceLogListResponse>(`/dices/${memberId}`, {
      params: { page, size },
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching dice logs for member ${memberId}:`, error.response?.data);
    // API 에러 응답 구조에 따라 ApiErrorResponse 타입을 사용하거나 일반 Error로 처리
    throw error.response?.data || new Error('Failed to fetch dice logs');
  }
};