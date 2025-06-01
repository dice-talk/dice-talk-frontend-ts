import {create} from 'zustand'

// API 응답에 따라 더 구체적인 타입 정의가 필요할 수 있습니다.
interface ChatMessage {
  // 예시: id: string; message: string; senderId: string; timestamp: string;
  [key: string]: any; // 실제 메시지 구조에 맞게 수정
}

interface ChatParticipant {
  // 예시: memberId: string; nickname: string; profileImageUrl?: string;
  [key: string]: any; // 실제 참여자 구조에 맞게 수정
}

interface RoomEvent {
  // 예시: eventId: string; type: string; data: any; timestamp: string;
  [key: string]: any; // 실제 이벤트 구조에 맞게 수정
}

export interface ChatRoomDetails {
  chatRoomId: number | null;
  createdAt: string | null;
  roomType: string | null;
  themeId: number | null; // themeId 필드 추가
  themeName: string | null;
  chats: ChatMessage[];
  chatParts: ChatParticipant[];
  roomEvents: RoomEvent[];
  remainingTimeForTimer: number | null; // 타이머를 위한 남은 시간 (초)
}

interface ChatRoomState extends ChatRoomDetails {
  actions: {
    setChatRoomDetails: (details: Partial<ChatRoomDetails>) => void;
    clearChatRoomDetails: () => void;
    setRemainingTimeForTimer: (seconds: number | null) => void; // 남은 시간 설정 액션
  };
}

const initialState: ChatRoomDetails = {
  chatRoomId: null,
  createdAt: null,
  roomType: null,
  themeId: null, // themeId 초기값 추가
  themeName: null,
  chats: [],
  chatParts: [],
  roomEvents: [],
  remainingTimeForTimer: null, // 초기값 null
};

const useChatRoomStore = create<ChatRoomState>((set) => ({
  ...initialState,
  actions: {
    setChatRoomDetails: (details) =>
      set((state) => ({
        ...state,
        ...details,
        // Partial 업데이트 시 배열이 undefined로 덮어쓰이는 것을 방지
        chats: details.chats !== undefined ? details.chats : state.chats,
        chatParts: details.chatParts !== undefined ? details.chatParts : state.chatParts,
        roomEvents: details.roomEvents !== undefined ? details.roomEvents : state.roomEvents,
      })),
    clearChatRoomDetails: () => set({ ...initialState, actions: useChatRoomStore.getState().actions }), // actions는 유지
    setRemainingTimeForTimer: (seconds) =>
      set({ remainingTimeForTimer: seconds }),
  },
}));

export const useChatRoomActions = () => useChatRoomStore((state) => state.actions);

export default useChatRoomStore;