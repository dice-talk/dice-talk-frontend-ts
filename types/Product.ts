// src/types/api.ts (Create this file or add to an existing types file)

export interface PageInfo {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }
  
  // Product Types
  export interface Product {
    productId: number;
    productName: string;
    productImage: string | null;
    price: number;
    quantity: number;
    createdAt: string;
    modifiedAt: string | null;
  }
  
  export interface ProductPostDto {
    productName: string;
    price: number;
    quantity: number;
  }
  
  export interface ProductPatchDto {
    productId: number; // Usually path param, but included in your spec's DTO
    productName?: string;
    productImage?: string; // URL of existing or new image if not uploading a file
    price?: number;
    quantity?: number;
  }
  
  export interface ProductListResponse {
    data: Product[];
    pageInfo: PageInfo;
  }
  
  export interface SingleProductResponse {
    data: Product;
  }
  
  // Item Types
  export interface Item {
    itemId: number;
    itemName: string;
    description: string;
    itemImage: string | null;
    dicePrice: number;
    createdAt: string;
    modifiedAt: string | null;
  }
  
  export interface ItemPostDto {
    itemName: string;
    description: string;
    dicePrice: number;
  }
  
  export interface ItemPatchDto {
    itemName?: string;
    description?: string;
    dicePrice?: number;
    // itemImage is handled by the 'image' file part in FormData if updated
  }
  
  export interface ItemListResponse {
    data: Item[];
    pageInfo: PageInfo;
  }
  
  export interface SingleItemResponse {
    data: Item;
  }
  
  // DiceLog Types
  export type LogType = "DICE_CHARGE" | "DICE_USED";
  
  export interface DiceLog {
    logId: number;
    quantity: number;
    logType: LogType;
    info: string;
    memberId: number;
    productId: number | null;
    itemId: number | null;
    createdAt: string;
  }
  
  export interface DiceChargeDto {
    quantity: number;
    productId: number;
    info: string; // Example: "다이스 2000개"
    logType: "DICE_CHARGE";
  }
  
  export interface DiceUsedDto {
    quantity: number;
    itemId: number;
    info: string; // Example: "채팅방 나가기" or "프로필 프레임"
    logType: "DICE_USED";
  }
  
  export interface DiceLogResponse {
    data: DiceLog;
  }
  
  export interface DiceLogListResponse {
    data: DiceLog[];
    pageInfo: PageInfo;
  }
  
  // Generic error response structure (assuming standard JSON, not double-stringified)
  export interface ApiErrorResponse {
    status: number;
    message: string;
    fieldErrors?: Array<{ field: string; rejectedValue: string; reason: string }>;
    violationErrors?: any; // Adjust as per actual structure
  }