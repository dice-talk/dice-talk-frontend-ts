import { getProfileSvg } from '@/utils/getProfileSvg';
import { create } from 'zustand';
import useAuthStore from './authStore';
import useSharedProfileStore from './sharedProfileStore';

// API 응답에 따라 더 구체적인 타입 정의가 필요할 수 있습니다.
export interface ChatMessage {
  chatId: number;
  memberId: number;
  nickname: string;
  message: string;
  createdAt: string;
}

export interface ChatParticipant { // <- 'export' 키워드 추가
  partId: number;
  nickname: string;
  profile: string;
  memberId: number;
  chatRoomId: number;
  exitStatus: string;
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
  roomStatus: string;
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
  roomStatus: '',
};

const useChatRoomStore = create<ChatRoomState>((set) => ({
  ...initialState,
  actions: {
    setChatRoomDetails: (details) => {
      // 1. 현재 사용자 ID 가져오기
      const currentMemberId = useAuthStore.getState().memberId;

      // 2. 참여자 목록에서 현재 사용자 정보 찾기
      const currentUserParticipant = details.chatParts?.find(
        (p) => p.memberId === currentMemberId
      );

      // 3. 현재 사용자 정보를 기반으로 sharedProfileStore 업데이트
      if (currentUserParticipant) {
        const profileSvg = getProfileSvg(currentUserParticipant.nickname);
        useSharedProfileStore.getState().actions.setSharedProfile({
          nickname: currentUserParticipant.nickname,
          profileImage: profileSvg,
          themeId: details.themeId,
          isInChat: true,
        });
      }
      
      console.log('✅ setChatRoomDetails 호출됨. 전달된 chats 데이터:', JSON.stringify(details.chats, null, 2));
      set((state) => ({
        ...state,
        ...details,
        // Partial 업데이트 시 배열이 null 또는 undefined로 덮어쓰이는 것을 방지
        chats: details.chats != null ? (details.chats as any).content || details.chats : state.chats,
        chatParts: details.chatParts != null ? details.chatParts : state.chatParts,
        roomEvents: details.roomEvents != null ? details.roomEvents : state.roomEvents,
      }));
    },
    clearChatRoomDetails: () => {
        set({ ...initialState, actions: useChatRoomStore.getState().actions });
        // 채팅방 나가면 공유 프로필 정보도 초기화
        useSharedProfileStore.getState().actions.clearSharedProfile();
    },
    setRemainingTimeForTimer: (seconds) =>
      set({ remainingTimeForTimer: seconds }),
  },
}));

export const useChatRoomActions = () => useChatRoomStore((state) => state.actions);

export default useChatRoomStore;