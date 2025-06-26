import useAuthStore from "@/zustand/stores/authStore"; // 경로 수정 가능성 있음
import useChatRoomStore, { ChatItem, ChatRoomDetails, ChatMessage, PageInfo } from "@/zustand/stores/ChatRoomStore"; // 새로 만든 ChatRoomStore 임포트, ChatItem, ChatMessage, PageInfo 추가

import useHomeStore, { useHomeActions } from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import axios from "axios"; // axios.isAxiosError를 사용하기 위해 임포트

import { axiosWithToken } from "./axios/axios";
import { Page, ReportChatMessageDto, ReportChatParticipantDto, ReportRoomEventDto } from "./reportApi"; // Import Page and DTOs from reportApi

// isPossible API 응답 데이터 타입 (실제 API 스펙에 맞게 조정 필요)
interface IsPossibleResponseData {
  isPossible: boolean;
  chatRoomId?: number; // 사용자가 이미 방에 참여 중일 경우 해당 방 ID
  // 기타 필요한 필드들...
}

// ChatRoomInfo API 응답 데이터 타입 (ChatRoomDetails와 유사하지만, API 응답 구조에 따라 data 래핑 등이 있을 수 있음)
interface ApiChatRoomInfoData {
  chatRoomId: number; // << 중요: API 응답에 이 필드가 포함되어야 합니다.
  createdAt: string;
  roomType: string;
  themeId?: number; // API 응답에 themeId가 포함될 수 있다고 가정 (선택적)
  themeName: string;
  chats: Page<ReportChatMessageDto>; // Changed to Page<ReportChatMessageDto>
  chatParts: ReportChatParticipantDto[]; // Changed to ReportChatParticipantDto[]
  roomEvents: ReportRoomEventDto[]; // Changed to ReportRoomEventDto[]
  roomStatus: string;
  items?: ChatItem[]; // API 응답에 items가 포함될 수 있도록 추가 (선택적 필드로 정의)
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
    console.log("이거 확인해", isPossibleData);
    if (response.status === 200 && isPossibleData.chatRoomId === 0){
      // 새로운 채팅방 참여 불가능 (isPossible: false)
      // HomeStore에서 chatRoomId를 확인합니다. isPossible API 응답의 chatRoomId는 사용하지 않습니다.
      const homeChatRoomId = useHomeStore.getState().chatRoomId;
      if (homeChatRoomId) {
        console.log(`ℹ️ 'isPossible' API 응답: 참여 불가. HomeStore의 chatRoomId=${homeChatRoomId}로 기존 방 정보 로드 시도.`);
        try {
          // getChatRoomInfo는 이제 HomeStore의 chatRoomId를 직접 사용하므로 인수 없이 호출합니다.
          const roomInfo = await getChatRoomInfo();
          return { canJoinNew: false, status: response.status, data: isPossibleData, existingRoomDetails: roomInfo };
        } catch (roomInfoError) {
          console.error(`🚨 기존 방 정보(HomeStore chatRoomId: ${homeChatRoomId}) 로드 실패:`, roomInfoError);
          // 기존 방 정보 로드에 실패했더라도, isPossible 결과(참여 불가)는 반환
          return { canJoinNew: false, status: response.status, data: isPossibleData, errorFetchingExistingRoom: true };
        }
      }
    } else if (response.status === 200 && isPossibleData) {
      // 새로운 채팅방 참여 가능 (isPossible: true)
      console.log(`ℹ️ 'isPossible' API 응답: 새로운 방 참여 가능.`);
      return { canJoinNew: true, status: response.status, data: isPossibleData };
    }
  } catch (error) {
    console.error("🚨 'isPossible' API 호출 실패:", error);
    throw error;
  }
};

/**
 * 현재 사용자가 참여하고 있는 채팅방 ID (curChatRoomId)를 조회하는 API.
 * @returns 현재 채팅방 ID (curChatRoomId) 또는 null (참여 중인 방이 없거나 에러 발생 시).
 */
export const getCurrentChatRoomId = async (): Promise<number | null> => {
  const { setChatRoomDetails } = useChatRoomStore.getState().actions;
  const { setChatRoomId: setHomeChatRoomId } = useHomeStore.getState().actions; 
  try {
    const memberId = useAuthStore.getState().memberId;
    
    if (!memberId) {
      console.warn("🚨 getCurrentChatRoomId: memberId가 AuthStore에 없습니다. 로그인 상태를 확인해주세요.");
      setChatRoomDetails({ chatRoomId: null });
      setHomeChatRoomId(0); // HomeStore도 업데이트 (방 없음 상태)
    return null; // Return null for chatPageInfo
    }

    const requestUrl = `/chat-rooms/curChatRoom`; // API 엔드포인트
    console.log(`🚀 getCurrentChatRoomId 요청 URL: ${requestUrl}`);
    // 서버가 { "data": 0 } 형태로 응답한다고 가정 (0이 curChatRoomId)
    const response = await axiosWithToken.get<number>(requestUrl); // API 응답이 숫자 자체라고 가정

    console.log(`🔍 현재 채팅방 ID (curChatRoomId) 조회 응답:`, { status: response.status, data: response.data }); // response.data 전체를 로깅하거나, response.data.data를 로깅

    const curChatRoomId = response.data; // response.data를 직접 사용
    console.log ("갱신된 roomId:",curChatRoomId, "그냥 리스폰스:", response.data)

    // ChatRoomStore에)
    // ChatRoomStore에 curChatRoomId 저장
    // 이 액션이 ChatRoomStore에 정의되어 있어야 합니다.
    // 예: setChatRoomId: (id: number | null) => set({ chatRoomId: id })
    setChatRoomDetails({ chatRoomId: curChatRoomId });
    // HomeStore에도 curChatRoomId 저장
    setHomeChatRoomId(curChatRoomId);

    return curChatRoomId;
  } catch (error) {
    console.error("🚨 현재 채팅방 ID (curChatRoomId) 조회 실패:", error);
    // 에러 발생 또는 방 없음(404) 시 ChatRoomStore와 HomeStore 모두 초기화/업데이트
    setChatRoomDetails({ chatRoomId: null });
    setHomeChatRoomId(0); // HomeStore는 0으로 설정 (방 없음 상태) // Also clear chatPageInfo

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log("ℹ️ 현재 참여중인 채팅방이 없습니다 (404).");
      return null;
    }
    // 그 외 에러는 throw 하거나 null 반환
    // throw error; // 에러를 상위로 전파하려면 주석 해제
    return null;
  }
};

/**
 * 특정 채팅방에서 특정 멤버를 내보내거나 관련 작업을 수행하고 HTTP 응답 상태 코드를 반환하는 API (DELETE 요청).
 * @param chatRoomId 대상 채팅방의 ID
 * * @param memberId 내보낼 멤버의 ID
 * @returns HTTP 응답 상태 코드. 서버 응답이 없는 에러 발생 시 에러 throw.
 */
export const deleteChatRoomMember = async (
  chatRoomId: number,
  memberId: number
): Promise<number> => {
  try {
    if (!chatRoomId || !memberId) {
      console.warn("🚨 deleteChatRoomMember: chatRoomId 또는 memberId가 제공되지 않았습니다.");
      throw new Error("chatRoomId 또는 memberId가 필요합니다.");
    }

    const requestUrl = `/chat-rooms/${chatRoomId}/${memberId}`;

    const response = await axiosWithToken.delete(requestUrl);
    console.log("🟢 원본 나가기 response:", response); // 여기가 실제 찍히는 지 확인 필요
    return response.status;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.status;
    }
    throw error;
  }
};

/**
 * 특정 채팅방에서 특정 멤버를 강제로 내보내고 HTTP 응답 상태 코드를 반환하는 API (DELETE 요청).
 * @returns HTTP 응답 상태 코드. 서버 응답이 없는 에러 발생 시 에러 throw.
 * chatRoomId는 ChatRoomStore에서, memberId는 AuthStore에서 가져옵니다.
 */
export const forceDeleteChatRoomMember = async (): Promise<number> => {
  const chatRoomId = useChatRoomStore.getState().chatRoomId;
  const memberId = useAuthStore.getState().memberId;

  try {
    if (chatRoomId === null || chatRoomId === undefined) {
      console.warn("🚨 forceDeleteChatRoomMember: ChatRoomStore에 chatRoomId가 없습니다.");
      throw new Error("chatRoomId가 ChatRoomStore에 없습니다.");
    }
    if (memberId === null || memberId === undefined) {
      console.warn("🚨 forceDeleteChatRoomMember: AuthStore에 memberId가 없습니다.");
      throw new Error("memberId가 AuthStore에 없습니다.");
    }

    const requestUrl = `/chat-rooms/force/${chatRoomId}/${memberId}`;
    console.log(`🚀 forceDeleteChatRoomMember 요청 URL: ${requestUrl}`);

    const response = await axiosWithToken.delete(requestUrl);
    console.log("🟢 강제 나가기 response:", response);
    return response.status;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.status;
    }
    throw error;
  }
};

// 채팅방 상세 정보 조회 및 ChatRoomStore에 저장 (HomeStore의 chatRoomId 사용)
export const getChatRoomInfo = async (
  page: number = 1, // 기본값 1
  size: number = 50   // 기본값 50
): Promise<ChatRoomDetails | null> => {
  const chatRoomIdFromHomeStore = useHomeStore.getState().chatRoomId; // 요청 시 사용할 ID (HomeStore 값)

  // HomeStore의 chatRoomId가 null이면 API를 호출할 수 없으므로 조회를 건너뜁니다.
  if (chatRoomIdFromHomeStore === null) {
    console.log("ℹ️ getChatRoomInfo: HomeStore의 chatRoomId가 null입니다. 상세 정보 조회를 건너뜁니다.");
    const { setChatRoomDetails } = useChatRoomStore.getState().actions;
    setChatRoomDetails({
        chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, // Clear chatPageInfo
        chats: [], chatParts: [], roomEvents: [], remainingTimeForTimer: null, chatPageInfo: null
    });
    return null;
  }

  // 이제 chatRoomIdFromHomeStore는 숫자 (0 또는 양수 ID)입니다.
  // 요청은 항상 실행됩니다.
  try {
    const requestUrl = `/chat-rooms/${chatRoomIdFromHomeStore}`;
    console.log(`🚀 getChatRoomInfo 요청 URL: ${requestUrl}`);
    const response = await axiosWithToken.get<{ data: ApiChatRoomInfoData }>(
      requestUrl,
      {
        params: { page, size }, // 요청 파라미터 추가
      }
    );
    const apiData = response.data.data; // API로부터 받은 채팅방 상세 정보 (chatRoomId 포함 가정)
    console.log(`🏠 채팅방 상세 정보 응답 (요청 ID: ${chatRoomIdFromHomeStore}, 응답 데이터:`, apiData.chats, `):`, { status: response.status });
    
    const { setChatRoomDetails } = useChatRoomStore.getState().actions;

    // Convert ReportChatMessageDto[] to ChatMessage[] (canonical for store)
    const convertedChats: ChatMessage[] = (apiData.chats?.content || []).map(dto => ({
      chatId: dto.chatId,
      message: dto.message,
      memberId: dto.memberId,
      nickname: dto.nickname || '알 수 없는 사용자', // Handle nickname to nickname conversion
      createdAt: dto.createdAt,
    }));

    const chatPageInfo: PageInfo | null = apiData.chats ? {
      page: apiData.chats.number,
      size: apiData.chats.size,
      totalElements: apiData.chats.totalElements,
      totalPages: apiData.chats.totalPages,
    } : null;

    // ChatRoomStore에 저장할 다른 상세 정보 (chatRoomId 제외)
    const otherDetailsFromApi: Omit<ChatRoomDetails, 'chatRoomId' | 'remainingTimeForTimer'> = {
      createdAt: apiData.createdAt,
      roomType: apiData.roomType,
      themeId: apiData.themeId ?? null,
      themeName: apiData.themeName,
      items: apiData.items || [],
      roomStatus: apiData.roomStatus,
      chats: convertedChats, // Use converted chats
      chatParts: apiData.chatParts || [],
      roomEvents: apiData.roomEvents || [],
      chatPageInfo: chatPageInfo, // Pass page info
    };

    // API 응답으로 받은 chatRoomId (apiData.chatRoomId)가 0인 경우
    if (apiData.chatRoomId === 0) {
      // ChatRoomStore의 chatRoomId는 변경하지 않고, 다른 정보만 업데이트합니다.
      console.log(`ℹ️ API 응답의 chatRoomId가 0입니다. ChatRoomStore의 chatRoomId를 제외한 다른 정보만 업데이트합니다.`);
      setChatRoomDetails(otherDetailsFromApi as Partial<ChatRoomDetails>); // chatRoomId가 없는 부분 객체 전달
    } else {
      // API 응답으로 받은 chatRoomId가 0이 아닌 경우:
      // ChatRoomStore를 모든 정보로 업데이트합니다 (응답받은 chatRoomId 포함).
      console.log(`ℹ️ API 응답의 chatRoomId가 ${apiData.chatRoomId}입니다. ChatRoomStore를 전체 정보로 업데이트합니다.`);
      setChatRoomDetails({
        ...otherDetailsFromApi,
        chatRoomId: apiData.chatRoomId, // API 응답에서 받은 ID 사용
        remainingTimeForTimer: null, // 타이머는 컴포넌트에서 설정
      });
    }

    // 이 함수가 반환하는 객체는 chat/index.tsx에서 HomeStore 업데이트 등에 사용됩니다.
    // 반환 객체의 chatRoomId는 API 응답에서 받은 chatRoomId를 사용합니다.
    const returnedDetails: ChatRoomDetails = {
      ...otherDetailsFromApi,
      chatRoomId: apiData.chatRoomId, // API 응답에서 받은 ID
      remainingTimeForTimer: null, // 초기값은 null로 설정 // Return null for page info
    };
    return returnedDetails;

  } catch (error) {
    // console.error(`🚨 채팅방 상세 정보(요청 ID: ${chatRoomIdFromHomeStore}) 조회 실패:`, error);
    // ChatRoomStore는 에러 발생 시 항상 초기화합니다.
    const { setChatRoomDetails } = useChatRoomStore.getState().actions;
    setChatRoomDetails({ // Clear chatPageInfo
        chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null,
        chats: [], chatParts: [], roomEvents: [], remainingTimeForTimer: null, chatPageInfo: null
    });

    // 만약 HomeStore의 chatRoomId가 이미 0이었고 API 요청에서 에러가 발생했다면,
    // chatRoomId가 0인 ChatRoomDetails 객체를 반환합니다.
    // 이렇게 하면 chat/index.tsx에서 에러 메시지 없이 "참여중인 채팅방이 없습니다."를 표시합니다.
    if (chatRoomIdFromHomeStore === 0) {
      return {
        chatRoomId: 0,
        createdAt: null, // ChatRoomDetails 타입에 맞게 null 또는 기본값 설정
        roomType: null,
        themeId: null,
        themeName: null,
        chats: [],
        chatParts: [],
        roomEvents: [],
        items: [],
        chatPageInfo: null, // Return null for page info
        remainingTimeForTimer: null,
        roomStatus: "ROOM_ACTIVE"
      };
    }
    // 그 외의 에러 (HomeStore의 chatRoomId가 0이 아니었을 때 발생한 에러)는 null을 반환합니다.
    return null;
  }
};