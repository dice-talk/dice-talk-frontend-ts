import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import { axiosWithToken } from "./axios/axios";

export interface ChatRoomOpponent { 
  memberId: number;
  name: string;
  profileImage: string; 
}

export interface ChatRoomItem {
  chatRoomId: number;
  roomType: 'COUPLE' | 'GROUP' | string; 
  roomStatus: 'ROOM_ACTIVE' | 'ROOM_DEACTIVE';
  lastChat: string | null;
  createdAt: string; 
  modifiedAt: string; 
  // 추가적으로 상대방 정보 (memberId, name, profileImage 등)가 필요할 수 있으나, 현재 API 명세에는 없음
  // 필요하다면 백엔드에 요청하여 응답에 포함하거나, 별도 API로 가져와야 합니다.
  // 더미데이터 구성을 위해 임시 필드 추가
  opponentName?: string;
  opponentProfileSvg?: any;
}

// 페이지 정보 타입 (API 응답 기반)
export interface PageInfo {
  page: number;      // 현재 페이지
  size: number;      // 페이지 당 항목 수
  totalElements: number; // 총 항목 수
  totalPages: number;    // 총 페이지 수
}

// 채팅방 목록 조회 API 응답 타입
export interface ChatRoomListResponse {
  data: ChatRoomItem[];
  pageInfo: PageInfo;
}

// 하트 히스토리 아이템 타입 (API 응답 기반)
export interface HeartHistoryItem {
  roomEventId: number;
  receiverId: number;
  senderId: number;
  chatRoomId: number;
  message: string | null;
  roomEventType: 'PICK_MESSAGE' | string; // 다양한 이벤트 타입이 있을 수 있음
  createdAt: string;
  modifiedAt: string;
  // sender 정보 (이름, 프로필 등)를 위해 임시 필드 추가
  senderName?: string;
  senderProfileSvg?: any; // SVG 컴포넌트 또는 이미지 경로 (React.FC<SvgProps> | ImageSourcePropType)
}

// 하트 히스토리 조회 API 응답 타입 (API 명세에는 pageInfo가 없으나, 필요시 추가될 수 있음)
export interface HeartHistoryListResponse {
  data: HeartHistoryItem[];
  pageInfo?: PageInfo; // 필요시 추가
}

// 사용자 기본 정보 (이름만)
const userBaseInfo: Record<string, { name: string }> = {
  '1': { name: '한가로운 하나' },
  '2': { name: '두 얼굴의 매력 두리' },
  '3': { name: '세침한 세찌' },
  '4': { name: '네모지만 부드러운 네몽' },
  '5': { name: '단호하데 다정한 다오' },
  '6': { name: '육감적인 직감파 육땡' },
};

/**
 * 1:1 채팅 내역 (채팅방 목록) 조회 API
 * @param memberId 회원 ID
 * @param page 페이지 번호 (1부터 시작)
 * @param size 페이지 당 항목 수
 */
export const getChatHistory = async (
  page: number = 0,
  size: number = 10,
): Promise<ChatRoomListResponse> => {
  //console.log(`[API] getChatHistory 호출: memberId=${memberId}, page=${page}, size=${size}`);
  try {
    const memberId = useMemberInfoStore.getState().memberId;
    const response = await axiosWithToken.get(`/chat-rooms/my-chat-rooms/${memberId}`, {
      params: {
        page, // 백엔드가 0-indexed page를 사용한다면 조정
        size,
      },
    });
    return response.data as ChatRoomListResponse; // 실제 응답 구조에 맞춰야 함
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

  export interface ChatMessage {
    messageId: string; // Or number
    chatRoomId: number;
    senderId: number;
    senderNickname: string;
    senderProfileImage?: string;
    messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
    content: string;
    createdAt: string; // ISO Date string
    isRead?: boolean;
}

export interface ChatMessagesResponse {
    messages: ChatMessage[];
    pageInfo: PageInfo;
}

/**
 * 특정 채팅방의 메시지 내역 조회 API
 * @param chatRoomId 채팅방 ID
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 당 항목 수
 */
export const getChatMessages = async (
    chatRoomId: number,
    page: number = 0,
    size: number = 50
): Promise<ChatMessagesResponse> => {
    try {
        const response = await axiosWithToken.get(`/chat-rooms/${chatRoomId}/messages`, {
            params: { page, size }
        });
        return response.data as ChatMessagesResponse; // Adjust based on actual response
    } catch (error) {
        console.error(`🚨 채팅방 ${chatRoomId} 메시지 조회 실패:`, error);
        throw error;
    }
};


/**
 * 하트 히스토리 조회 API (내가 보내거나 받은 하트)
 * @param page 페이지 번호 (0부터 시작, API 스펙에 따라 조정)
 * @param size 페이지 당 항목 수
 */
export const getMyHeartHistory = async (
  page: number = 0,
  size: number = 20,
): Promise<HeartHistoryListResponse> => {
  try {
    const memberId = useMemberInfoStore.getState().memberId; // Assuming memberId needed or inferred
    if (!memberId) {
        console.error("🚨 하트 내역 조회 실패: memberId가 없습니다.");
        throw new Error("memberId is not available");
    }
    // Original path: `/room-event-history/${memberId}`.
    // Assuming backend infers user from token for a path like `/my-heart-history`
    const response = await axiosWithToken.get(`/my-heart-history`, { // Path changed for consistency
      params: { page, size }, // Assuming pagination
    });
    return response.data as HeartHistoryListResponse; // Adjust based on actual response
  } catch (error) {
    console.error('🚨 하트 내역 조회 실패:', error);
    throw error;
  }
};

// (유지) 원본 코드의 getHeartHistory (특정 멤버 ID 기준, admin/public 용도일 수 있음)
export const getHeartHistoryByMemberId = async (
  memberId: number,
  page: number = 0,
  size: number = 20,
): Promise<HeartHistoryListResponse> => {
  console.log(`[API] getHeartHistoryByMemberId 호출: memberId=${memberId}`);
  try {
    const response = await axiosWithToken.get(`/room-event-history/${memberId}`, {
       params: { page, size },
    });
    return response.data as HeartHistoryListResponse;
  } catch (error) {
    console.error(`🚨 ID ${memberId} 하트 내역 조회 실패:`, error);
    throw error;
  }
};