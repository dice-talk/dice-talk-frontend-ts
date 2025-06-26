import useAuthStore from '@/zustand/stores/authStore';
import { axiosWithToken } from "./axios/axios";
import { Page, ReportChatMessageDto as ApiChatMessageDto } from './reportApi'; // reportApi에서 Page와 DTO 임포트

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
  opponentName?: string;
  opponentProfileSvg?: any;
}

// 페이지 정보 타입 (getChatHistory, getMyHeartHistory용)
export interface SimplePageInfo {
  page: number;      // 현재 페이지
  size: number;      // 페이지 당 항목 수
  totalElements: number; // 총 항목 수
  totalPages: number;    // 총 페이지 수
}

// 채팅방 목록 조회 API 응답 타입
export interface ChatRoomListResponse {
  data: ChatRoomItem[];
  pageInfo: SimplePageInfo;
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
  senderName?: string;
  senderProfileSvg?: any; // SVG 컴포넌트 또는 이미지 경로 (React.FC<SvgProps> | ImageSourcePropType)
}

// 하트 히스토리 조회 API 응답 타입 (API 명세에는 pageInfo가 있으므로 non-optional로 변경)
export interface HeartHistoryListResponse {
  data: HeartHistoryItem[];
  pageInfo: SimplePageInfo;
}

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

/**
 * 특정 채팅방의 메시지 내역 조회 API
 * @param chatRoomId 채팅방 ID
 * @param page 페이지 번호 (0부터 시작)
 * @param size 페이지 당 항목 수
 */
export const getChatMessages = async (
    chatRoomId: number,
    page: number = 0, // API는 0-based page
    size: number = 30
): Promise<Page<ApiChatMessageDto>> => { // 반환 타입을 Page<ApiChatMessageDto>로 변경
    try {
        const response = await axiosWithToken.get(`/chat-rooms/${chatRoomId}/messages`, {
            params: { page, size }
        });
        return response.data; // API 응답이 Page<ApiChatMessageDto> 객체 자체라고 가정
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
        console.warn("🚨 [getMyHeartHistory] memberId is not available from authStore, proceeding without it for API call.");
    }
    
    const response = await axiosWithToken.get(`/room-event/history`, { 
      params: { 
        page, // 1-based 페이지 전달
        size 
      }, 
    });
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
