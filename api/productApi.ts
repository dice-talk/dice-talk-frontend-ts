import { axiosWithToken } from '@/api/axios/axios'; // Adjust path to your axios setup
import { ApiErrorResponse, ProductListResponse } from '@/types/Product';
// import { useAuthStore } from '@/zustand/stores/authStore'; // 직접적인 스토어 접근 제거
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
  memberId: number; // API 응답에는 memberId가 포함됨
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
 * @param memberId - 조회할 회원의 ID
 * @param page - 조회하는 페이지
 * @param size - 불러오는 데이터 수
 */
export const getMemberDiceLogs = async (
  memberId: number, // memberId를 인자로 받도록 수정
  page: number,
  size: number
): Promise<DiceLogListResponse> => {
  if (!memberId) {
    // 또는 적절한 기본값을 반환하거나, 호출부에서 처리하도록 null/undefined 반환
    console.warn('getMemberDiceLogs: memberId is required but was not provided.');
    // 빈 결과 또는 에러를 반환하여 호출부에서 처리하도록 할 수 있습니다.
    // 여기서는 빈 데이터를 포함한 응답 형태로 반환하여 앱이 중단되지 않도록 합니다.
    return { data: [], pageInfo: { page: 1, size, totalElements: 0, totalPages: 0 } };
  }
  try {
    // const memberIdFromStore = useAuthStore.getState().memberId; // 이 줄 제거
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