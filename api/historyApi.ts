// import { useMemberInfoStore } from "@/zustand/stores/memberInfoStore";
import useAuthStore from '@/zustand/stores/authStore'; // authStore 임포트
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
  themeId: number;
  message: string | null;
  roomEventType: 'PICK_MESSAGE' | string; // 다양한 이벤트 타입이 있을 수 있음
  createdAt: string;
  modifiedAt: string;
  // sender 정보 (이름, 프로필 등)를 위해 임시 필드 추가
  senderName?: string;
  senderProfileSvg?: any; // SVG 컴포넌트 또는 이미지 경로 (React.FC<SvgProps> | ImageSourcePropType)
}

// 하트 히스토리 조회 API 응답 타입 (API 명세에는 pageInfo가 있으므로 non-optional로 변경)
export interface HeartHistoryListResponse {
  data: HeartHistoryItem[];
  pageInfo: PageInfo; // optional 제거
}

// 사용자 기본 정보 (이름만)
const userBaseInfo: Record<string, { name: string }> = {
  '1': { name: '한가로운 하나' },
  '2': { name: '두 얼굴의 매력 두리' },
  '3': { name: '세침한 세찌' },
  '4': { name: '네모지만 부드러운 네몽' },
  '5': { name: '단호한데 다정한 다오' },
  '6': { name: '육감적인 직감파 육땡' },
};

/**
 * 1:1 채팅 내역 (채팅방 목록) 조회 API
 * @param page 페이지 번호 (1부터 시작하는 것으로 가정)
 * @param size 페이지 당 항목 수
 */
export const getChatHistory = async (
  page: number = 1, // 기본값을 1로 변경 (1-based page 가정)
  size: number = 10,
): Promise<ChatRoomListResponse> => {
  try {
    const memberId = useAuthStore.getState().memberId;
    if (!memberId) {
      console.error("🚨 [getChatHistory] 채팅 내역 조회 실패: memberId가 없습니다.");
      throw new Error("memberId is not available for getChatHistory");
    }
    // 요청 URL을 백엔드 컨트롤러의 전체 경로와 일치하도록 수정
    // 클래스 레벨 @RequestMapping("/chat-rooms") + 메서드 레벨 @GetMapping("/my-chat-room/{member-id}")
    const response = await axiosWithToken.get(`/chat-rooms/my-chat-room/${memberId}`, {
      params: {
        page, // 전달받은 page 값 사용 (1-based)
        size,
      },
    });
    return response.data as ChatRoomListResponse; 
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
 * @param page 페이지 번호 (1부터 시작, API 명세에 따름)
 * @param size 페이지 당 항목 수
 */
export const getMyHeartHistory = async (
  page: number = 1, // 기본값을 1로 변경 (1-based page)
  size: number = 20,
): Promise<HeartHistoryListResponse> => {
  try {
    const memberId = useAuthStore.getState().memberId; 
    if (!memberId) {
        // memberId가 없어도 API 호출은 가능할 수 있음 (토큰 기반 인증)
        // 다만, 로깅이나 특정 플로우에 필요하다면 이 로직 유지
        console.warn("🚨 [getMyHeartHistory] memberId is not available from authStore, proceeding without it for API call.");
        // throw new Error("memberId is not available"); // 호출 자체를 막을 필요는 없을 수 있음
    }
    
    // API 명세서에 따른 엔드포인트로 변경
    const response = await axiosWithToken.get(`/room-event/history`, { 
      params: { 
        page, // 1-based 페이지 전달
        size 
      }, 
    });
    // API 응답에 pageInfo가 있으므로, HeartHistoryListResponse에 pageInfo가 optional이 아니어야 할 수 있음.
    // 현재는 optional로 되어 있으므로, 그대로 사용하거나 필요시 타입을 non-optional로 변경.
    return response.data as HeartHistoryListResponse; 
  } catch (error) {
    console.error('🚨 하트 내역 조회 실패 (getMyHeartHistory):', error);
    throw error;
  }
};

/**
 * 하트 히스토리 아이템 삭제 API
 * @param roomEventId 삭제할 하트 히스토리 아이템의 ID
 */
export const deleteHeartHistoryItem = async (roomEventId: number | string): Promise<void> => {
  try {
    await axiosWithToken.delete(`/room-event/history/${roomEventId}`);
  } catch (error) {
    console.error(`🚨 하트 내역 삭제 실패 (ID: ${roomEventId}):`, error);
    throw error;
  }
};

// (유지) 원본 코드의 getHeartHistory (특정 멤버 ID 기준, admin/public 용도일 수 있음)
export const getHeartHistoryByMemberId = async (
  memberId: number,
  page: number = 0,
  size: number = 10,
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