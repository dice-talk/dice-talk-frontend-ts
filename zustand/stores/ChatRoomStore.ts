import { getProfileSvg } from '@/utils/getProfileSvg';
import { create } from 'zustand';
import useAuthStore from './authStore';
import useSharedProfileStore from './sharedProfileStore';

// 페이지네이션 정보를 위한 인터페이스 (API 응답 기반)
export interface PageInfo {
  page: number;      // 현재 페이지 (0-based from API)
  size: number;      // 페이지 당 항목 수
  totalElements: number; // 총 항목 수
  totalPages: number;    // 총 페이지 수
}

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
  partStatus?: string; // 추가: 참여자 상태 (예: MEMBER_EXIT)
}

interface RoomEvent {
  // 예시: eventId: string; type: string; data: any; timestamp: string;
  [key: string]: any; // 실제 이벤트 구조에 맞게 수정
}

// 아이템 데이터 타입을 정의합니다.
export interface ChatItem { // export 키워드 추가
  itemId: number;
  itemName: string;
  description: string;
  itemImage: string;
  dicePrice: number;
  createdAt: string;
  modifiedAt: string;
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
  items: ChatItem[]; // 아이템 목록 추가
  roomStatus: string;
  chatPageInfo: PageInfo | null; // 채팅 메시지 페이지 정보 추가
}

interface ChatRoomState extends ChatRoomDetails {
  actions: {
    setChatRoomDetails: (details: Partial<ChatRoomDetails>) => void;
    clearChatRoomDetails: () => void;
    setRemainingTimeForTimer: (seconds: number | null) => void; // 남은 시간 설정 액션
    prependPastChats: (chatsToPrepend: ChatMessage[], newPageInfo: PageInfo) => void; // 과거 채팅 추가 액션
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
  items: [], // 아이템 목록 초기값 추가
  roomStatus: '',
  chatPageInfo: null, // chatPageInfo 초기값 추가
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
        // `details` 객체에서 `chats`와 `chatPageInfo`를 직접 처리하므로, `...details`에서 제외
        // 나머지 속성들은 그대로 병합
        chatRoomId: details.chatRoomId !== undefined ? details.chatRoomId : state.chatRoomId,
        createdAt: details.createdAt !== undefined ? details.createdAt : state.createdAt,
        roomType: details.roomType !== undefined ? details.roomType : state.roomType,
        themeId: details.themeId !== undefined ? details.themeId : state.themeId,
        themeName: details.themeName !== undefined ? details.themeName : state.themeName,
        remainingTimeForTimer: details.remainingTimeForTimer !== undefined ? details.remainingTimeForTimer : state.remainingTimeForTimer,
        roomStatus: details.roomStatus !== undefined ? details.roomStatus : state.roomStatus,
        // Partial 업데이트 시 배열이 null 또는 undefined로 덮어쓰이는 것을 방지
        chats: details.chats != null ? details.chats : state.chats, // chats는 이미 ChatMessage[] 타입으로 변환되어 들어온다고 가정
        chatParts: details.chatParts != null ? details.chatParts : state.chatParts,
        items: details.items != null ? details.items : state.items, // items 배열 업데이트 로직 추가
        roomEvents: details.roomEvents != null ? details.roomEvents : state.roomEvents,
        chatPageInfo: details.chatPageInfo !== undefined ? details.chatPageInfo : state.chatPageInfo, // chatPageInfo 업데이트
      }));
    },
    clearChatRoomDetails: () => {
        set({ ...initialState, actions: useChatRoomStore.getState().actions });
        // 채팅방 나가면 공유 프로필 정보도 초기화
        useSharedProfileStore.getState().actions.clearSharedProfile();
    },
    setRemainingTimeForTimer: (seconds) =>
      set({ remainingTimeForTimer: seconds }),
    // 과거 메시지를 목록 앞에 추가하는 액션
    prependPastChats: (chatsToPrepend, newPageInfo) =>
      set((state) => ({
        chats: [...chatsToPrepend, ...state.chats],
        chatPageInfo: newPageInfo,
      })),
  },
}));

export const useChatRoomActions = () => useChatRoomStore((state) => state.actions);

export default useChatRoomStore;