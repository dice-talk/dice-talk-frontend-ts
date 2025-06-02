import useAuthStore from "@/zustand/stores/authStore"; // 경로 수정 가능성 있음
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import useChatRoomStore, { ChatRoomDetails } from "@/zustand/stores/ChatRoomStore"; // 새로 만든 ChatRoomStore 임포트
import { axiosWithToken } from "./axios/axios";

// isPossible API 응답 데이터 타입 (실제 API 스펙에 맞게 조정 필요)
interface IsPossibleResponseData {
  isPossible: boolean;
  chatRoomId?: number; // 사용자가 이미 방에 참여 중일 경우 해당 방 ID
  // 기타 필요한 필드들...
}

// ChatRoomInfo API 응답 데이터 타입 (ChatRoomDetails와 유사하지만, API 응답 구조에 따라 data 래핑 등이 있을 수 있음)
interface ApiChatRoomInfoData {
  createdAt: string;
  roomType: string;
  themeId?: number; // API 응답에 themeId가 포함될 수 있다고 가정 (선택적)
  themeName: string;
  chats: any[]; // 실제 타입으로 변경 권장
  chatParts: any[]; // 실제 타입으로 변경 권장
  roomEvents: any[]; // 실제 타입으로 변경 권장
  // 기타 필요한 필드들...
}

// 새로운 채팅방 참여 가능여부
export const getIsPossible = async () => {
  try {
    const memberId = useAuthStore.getState().memberId;
    if (!memberId) {
      throw new Error("🚨 memberId가 AuthStore에 없습니다. 로그인 상태를 확인해주세요.");
    }

    const response = await axiosWithToken.get<{ data: IsPossibleResponseData }>(`/chat-rooms/isPossible/${memberId}`);
    console.log(`🔍 'isPossible' API 응답:`, { status: response.status, data: response.data.data });

    const isPossibleData = response.data.data;

    if (response.status === 200 && isPossibleData.isPossible) {
      // 새로운 채팅방 참여 가능
      return { canJoinNew: true, status: response.status, data: isPossibleData };
    } else {
      // 새로운 채팅방 참여 불가능 (이미 참여 중이거나 다른 이유).
      // HomeStore에서 chatRoomId를 확인합니다. isPossible API 응답의 chatRoomId는 사용하지 않습니다.
      const homeChatRoomId = useHomeStore.getState().chatRoomId;

      if (homeChatRoomId) {
        console.log(`ℹ️ 새로운 방 참여 불가. HomeStore에서 가져온 chatRoomId=${homeChatRoomId}로 기존 방 정보 로드 시도.`);
        try {
          // getChatRoomInfo는 이제 HomeStore의 chatRoomId를 직접 사용하므로 인수 없이 호출합니다.
          const roomInfo = await getChatRoomInfo();
          return { canJoinNew: false, status: response.status, data: isPossibleData, existingRoomDetails: roomInfo };
        } catch (roomInfoError) {
          console.error(`🚨 기존 방 정보(HomeStore chatRoomId: ${homeChatRoomId}) 로드 실패:`, roomInfoError);
          // 기존 방 정보 로드에 실패했더라도, isPossible 결과는 반환
          return { canJoinNew: false, status: response.status, data: isPossibleData, errorFetchingExistingRoom: true };
        }
      }
      // HomeStore에 chatRoomId가 없는 경우.
      console.warn(`🤔 'isPossible' API가 참여 불가를 반환했고, HomeStore에서 유효한 chatRoomId를 찾지 못했습니다. (API 응답 isPossible: ${isPossibleData.isPossible}, API 응답 chatRoomId: ${isPossibleData.chatRoomId} - 이 값은 사용되지 않음)`);
      return { canJoinNew: false, status: response.status, data: isPossibleData };
    }
  } catch (error) {
    console.error("🚨 'isPossible' API 호출 실패:", error);
    throw error;
  }
};

// 채팅방 상세 정보 조회 및 ChatRoomStore에 저장 (HomeStore의 chatRoomId 사용)
export const getChatRoomInfo = async (): Promise<ChatRoomDetails | null> => {
  try {
    // HomeStore에서 chatRoomId를 가져옵니다.
    const chatRoomId = useHomeStore.getState().chatRoomId;

    if (!chatRoomId) {
      console.warn("🚨 getChatRoomInfo: HomeStore에 chatRoomId가 없습니다. 상세 정보 조회를 건너뜁니다.");
      return null; // chatRoomId가 없으면 null 반환
    }

    const requestUrl = `/chat-rooms/${chatRoomId}`;
    console.log(`🚀 getChatRoomInfo 요청 URL: ${requestUrl}`); // 요청 URL 출력
    const response = await axiosWithToken.get<{ data: ApiChatRoomInfoData }>(requestUrl);
    console.log(`🏠 채팅방 상세 정보 응답 (chatRoomId: ${chatRoomId}):`, { status: response.status, data: response.data.data });
    
    const roomDetails: ChatRoomDetails = {
      chatRoomId: chatRoomId, // API 응답에 chatRoomId가 없다면, 파라미터로 받은 값을 사용
      createdAt: response.data.data.createdAt,
      roomType: response.data.data.roomType,
      themeId: response.data.data.themeId ?? null, // API 응답에서 themeId를 사용하거나 null로 설정
      themeName: response.data.data.themeName,
      chats: response.data.data.chats || [],
      chatParts: response.data.data.chatParts || [],
      roomEvents: response.data.data.roomEvents || [],
      remainingTimeForTimer: null, // 초기값은 null로 설정
    };

    // ChatRoomStore에 정보 저장
    const { setChatRoomDetails } = useChatRoomStore.getState().actions;
    setChatRoomDetails(roomDetails);

    return roomDetails;
  } catch (error) {
    // 에러 발생 시점에는 chatRoomId 변수가 try 블록 스코프 내에 있으므로, HomeStore에서 다시 가져와 로깅합니다.
    console.error(`🚨 채팅방 상세 정보(HomeStore chatRoomId: ${useHomeStore.getState().chatRoomId}) 조회 실패:`, error);
    throw error;
  }
};