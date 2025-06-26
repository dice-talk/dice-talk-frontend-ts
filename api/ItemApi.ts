// /Users/6feetlife/Desktop/newDiceTalk/dice-talk-frontend-ts/api/itemApi.ts
import { axiosWithoutToken, axiosWithToken } from "./axios/axios"; // 인증 토큰이 필요한 경우

// 아이템 상세 정보 API 응답 데이터 타입 (실제 API 스펙에 맞게 정의 필요)
interface ItemDetailsData {
  itemId: number;
  name: string;
  description: string;
  price: number;
  // 기타 필요한 필드들...
}

// API 응답 데이터 타입을 정의합니다.
export interface Item {
    itemId: number;
    itemName: string;
    description: string;
    itemImage: string;
    dicePrice: number;
    createdAt: string;
    modifiedAt: string;
}

interface PageInfo {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

interface ItemsResponse {
    data: Item[];
    pageInfo: PageInfo;
}

/**
 * 특정 아이템의 상세 정보를 조회하는 API.
 * @param itemId 조회할 아이템의 ID
 * @returns 아이템 상세 정보 또는 에러 발생 시 null.
 */
export const getItemDetails = async (itemId: number): Promise<ItemDetailsData | null> => {
  if (!itemId) {
    console.warn("🚨 getItemDetails: itemId가 제공되지 않았습니다.");
    return null;
  }

  try {
    const requestUrl = `/items/${itemId}`;
    console.log(`🚀 getItemDetails 요청 URL: ${requestUrl}`);

    // API 응답이 { "data": ItemDetailsData } 형태로 온다고 가정
    const response = await axiosWithoutToken.get<{ data: ItemDetailsData }>(requestUrl);
    console.log(`🛍️ 아이템 상세 정보 응답 (itemId: ${itemId}):`, { status: response.status, data: response.data.data });

    return response.data.data; // 실제 데이터 반환
  } catch (error) {
    console.error(`🚨 아이템 상세 정보(itemId: ${itemId}) 조회 실패:`, error);
    // 에러 처리는 프로젝트의 요구사항에 맞게 조정 (예: 특정 에러 코드에 따른 분기 처리)
    return null;
  }
};

/**
 * 다이스로 구매 가능한 아이템 목록을 조회합니다.
 * @param page 페이지 번호 (기본값: 1)
 * @param size 페이지당 아이템 수 (기본값: 10)
 * @returns Promise<ItemsResponse>
 */
export const getAllItems = async (page: number = 1, size: number = 10): Promise<ItemsResponse> => {
    try {
        const response = await axiosWithToken.get<ItemsResponse>(`/items?page=${page}&size=${size}`);
        return response.data;
    } catch (error) {
        console.error("🚨 아이템 목록 조회 실패:", error);
        throw error;
    }
};
