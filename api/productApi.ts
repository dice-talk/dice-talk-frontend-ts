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

// // --- DiceLog APIs ---

// /**
//  * DICE(재화) 구매 내역 등록 (DICE_CHARGE)
//  * POST /dices/charge
//  */
// export const chargeDices = async (chargeDto: DiceChargeDto): Promise<DiceLogResponse> => {
//   try {
//     const response = await axiosWithToken.post<DiceLogResponse>('/dices/charge', chargeDto);
//     // Update Zustand store (example)
//     useMemberStore.getState().updateDiceBalance(response.data.data.quantity);
//     useMemberStore.getState().addDiceLog(response.data.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error charging dices:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * ITEM 구매 내역 등록 (DICE_USED)
//  * POST /dices/used
//  */
// export const useDices = async (usedDto: DiceUsedDto): Promise<DiceLogResponse> => {
//   try {
//     const response = await axiosWithToken.post<DiceLogResponse>('/dices/used', usedDto);
//     // Update Zustand store (example)
//     // Quantity in DICE_USED is positive, so subtract it for balance.
//     useMemberStore.getState().updateDiceBalance(-response.data.data.quantity);
//     useMemberStore.getState().addDiceLog(response.data.data);
//     return response.data;
//   } catch (error: any) {
//     console.error("Error using dices:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 해당 회원이 직접 구매한 Product(상품), Item(아이템 사용) 에 대한 내역 조회
//  * GET /dices/{member-id}
//  */
// export const getMemberDiceLogs = async (
//   memberId: number,
//   page: number,
//   size: number
// ): Promise<DiceLogListResponse> => {
//   try {
//     const response = await axiosWithToken.get<DiceLogListResponse>(`/dices/${memberId}`, {
//       params: { page, size },
//     });
//     // Optionally update Zustand store with fetched logs
//     if (page === 1) { // Example: reset logs if fetching the first page
//       useMemberStore.getState().setDiceLogs(response.data.data);
//     } else { // Example: append to existing logs
//       // This might need more sophisticated logic to avoid duplicates and maintain order
//       // For simplicity, you might just refetch all or handle pagination UI-side
//     }
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error fetching dice logs for member ${memberId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };