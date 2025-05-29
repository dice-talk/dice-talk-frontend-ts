// // src/api/apiClient.ts (Create this file or organize into multiple files like products.ts, items.ts, etc.)

// import { axiosWithToken, axiosWithoutToken } from '@/api/axios/axios'; // Adjust path to your axios setup
// import {
//   ProductPostDto, ProductPatchDto, SingleProductResponse, ProductListResponse,
//   ItemPostDto, ItemPatchDto, SingleItemResponse, ItemListResponse,
//   DiceChargeDto, DiceUsedDto, DiceLogResponse, DiceLogListResponse, ApiErrorResponse, Product
// } from '@/types/Product'; // Adjust path as needed

// /**
//  * 관리자가 새로운 Product 등록
//  * POST /products
//  */
// export const addProduct = async (productPostDto: ProductPostDto, imageFile?: File): Promise<void> => {
//   // The spec says 201 CREATED but doesn't show a response body for success.
//   // Assuming no specific data is returned on success based on the spec.
//   try {
//     const formData = new FormData();
//     formData.append('productPostDto', JSON.stringify(productPostDto));
//     if (imageFile) {
//       // The API spec says 'image: [file]', suggesting it could be an array,
//       // but typically for a single product image, it's one file.
//       // Adjust if multiple files are indeed supported for a single product.
//       formData.append('image', imageFile);
//     }
//     await axiosWithToken.post<void>('/products', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//   } catch (error: any) {
//     console.error("Error adding product:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 관리자가 기존에 등록된 Product 수정
//  * PATCH /products/{product-id}
//  */
// export const updateProduct = async (
//   productId: number,
//   productPatchDto: ProductPatchDto,
//   imageFile?: File
// ): Promise<SingleProductResponse> => {
//   try {
//     const formData = new FormData();
//     formData.append('productPatchDto', JSON.stringify({ ...productPatchDto, productId })); // Ensure productId is in DTO if backend expects it
//     if (imageFile) {
//       formData.append('image', imageFile);
//     }
//     const response = await axiosWithToken.patch<SingleProductResponse>(`/products/${productId}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error updating product ${productId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 상품(Product)의 단일 조회
//  * GET /products/{product-id}
//  */
// export const getProductById = async (productId: number): Promise<SingleProductResponse> => {
//   try {
//     const response = await axiosWithoutToken.get<SingleProductResponse>(`/products/${productId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error fetching product ${productId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 상품(Product)의 전체 조회
//  * GET /products
//  */
// export const getAllProducts = async (page: number, size: number): Promise<ProductListResponse> => {
//   try {
//     const response = await axiosWithoutToken.get<ProductListResponse>('/products', {
//       params: { page, size },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching all products:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 등록된 상품의 단일 삭제 성공
//  * DELETE /products/{product-id}
//  */
// export const deleteProduct = async (productId: number): Promise<void> => {
//   try {
//     await axiosWithToken.delete(`/products/${productId}`);
//   } catch (error: any) {
//     console.error(`Error deleting product ${productId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// // --- Item APIs ---

// /**
//  * 재화로 구매 가능한 아이템 등록
//  * POST /items
//  */
// export const addItem = async (itemPostDto: ItemPostDto, imageFile?: File): Promise<SingleItemResponse> => {
//   try {
//     const formData = new FormData();
//     formData.append('itemPostDto', JSON.stringify(itemPostDto));
//     if (imageFile) {
//       formData.append('image', imageFile);
//     }
//     const response = await axiosWithToken.post<SingleItemResponse>('/items', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error adding item:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 재화로 구매 가능한 아이템 수정
//  * PATCH /items/{item-id}
//  */
// export const updateItem = async (
//   itemId: number,
//   itemPatchDto: ItemPatchDto,
//   imageFile?: File
// ): Promise<SingleItemResponse> => {
//   try {
//     const formData = new FormData();
//     formData.append('itemPatchDto', JSON.stringify(itemPatchDto));
//     if (imageFile) {
//       formData.append('image', imageFile);
//     }
//     const response = await axiosWithToken.patch<SingleItemResponse>(`/items/${itemId}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error updating item ${itemId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 재화로 구매 가능한 아이템 단일 조회
//  * GET /items/{item-id}
//  */
// export const getItemById = async (itemId: number): Promise<SingleItemResponse> => {
//   try {
//     const response = await axiosWithoutToken.get<SingleItemResponse>(`/items/${itemId}`);
//     return response.data;
//   } catch (error: any) {
//     console.error(`Error fetching item ${itemId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 아이템 전체 조회
//  * GET /items
//  */
// export const getAllItems = async (page: number, size: number): Promise<ItemListResponse> => {
//   try {
//     const response = await axiosWithoutToken.get<ItemListResponse>('/items', {
//       params: { page, size },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching all items:", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

// /**
//  * 아이템 삭제는 관리자만 가능
//  * DELETE /items/{item-id}
//  */
// export const deleteItem = async (itemId: number): Promise<void> => {
//   try {
//     await axiosWithToken.delete(`/items/${itemId}`);
//   } catch (error: any) {
//     console.error(`Error deleting item ${itemId}:`, error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };

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

// /**
//  * 전체 DICELOG에 대한 내역 조회 (관리자)
//  * GET /dices/logs
//  */
// export const getAllDiceLogsAdmin = async (page: number, size: number): Promise<DiceLogListResponse> => {
//   try {
//     const response = await axiosWithToken.get<DiceLogListResponse>('/dices/logs', {
//       params: { page, size },
//     });
//     return response.data;
//   } catch (error: any) {
//     console.error("Error fetching all dice logs (admin):", error.response?.data);
//     throw error.response?.data as ApiErrorResponse || error;
//   }
// };