import { axiosWithToken, axiosWithoutToken } from './axios/axios'; // 인증 필요 여부에 따라 선택
// EventMessageData 타입을 SecretMessageStore에서 가져옵니다.
// SecretMessageStore.ts 파일이 EventMessageData 인터페이스를 export 하고 있어야 합니다.
// 만약 SecretMessageStore.ts에서 EventMessageData를 export 하지 않았다면,
// 해당 파일에 export 키워드를 추가하거나, useEventMessageStore.ts에서 가져오도록 경로를 수정해야 합니다.
import useEventMessageStore, { EventMessageData } from '@/zustand/stores/SecretMessageStore'; // 스토어 훅 및 타입 임포트
import useAuthStore from '@/zustand/stores/authStore';
import useChatRoomStore from '@/zustand/stores/ChatRoomStore';
import axios from 'axios'; // axios.isAxiosError 사용을 위해 임포트

interface SendRoomEventResponse {
  // 서버 응답에 따른 실제 타입으로 정의하는 것이 좋습니다.
  message?: string;
  data?: any; // 서버가 추가 데이터를 반환할 경우를 위함
}



export interface RoomEventFromApi {
  roomEventType: string; // "PICK", "PICK_MESSAGE" 등 이벤트 타입
  senderId: number;      // 이벤트를 보낸 사람의 memberId
  receiverId: number;    // 이벤트를 받은 사람의 memberId (PICK 이벤트의 경우 선택된 대상)
  memberId?: number;     // 기존 호환성을 위해 유지 (또는 senderId/receiverId로 대체 고려)
  [key: string]: any;    // 그 외 추가적인 필드들
}


export const sendRoomEvent = async (eventData: EventMessageData): Promise<SendRoomEventResponse> => {
  if (!eventData) {
    const errorMessage = "룸 이벤트를 보낼 데이터가 제공되지 않았습니다. 메시지 전송을 진행할 수 없습니다.";
    console.error(`🚨 sendRoomEvent: ${errorMessage}`);
    // 호출하는 쪽에서 이 에러를 잡아서 사용자에게 알릴 수 있도록 에러를 throw 합니다.
    throw new Error(errorMessage);
  }

  // 전달받은 eventData를 API 요청의 본문으로 사용합니다.
  const payload: EventMessageData = eventData;

  try {
    
    // 현재는 axiosWithoutToken을 사용하고 있습니다.
    const response = await axiosWithoutToken.post<SendRoomEventResponse>('/room-event', payload); // payload를 요청 본문으로 사용
    
    // 성공적인 응답 (HTTP 2xx 상태 코드)일 경우 response.data를 반환합니다.
    // 서버에서 success: true와 함께 201 상태 코드를 반환한다고 가정합니다.
    console.log(`🎉 Room event API response:`, { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    console.error("🚨 Failed to send room event via API:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("🚨 API Error Response:", error.response.data, error.response.status);
      // 실패 시에도 서버가 SendRoomEventResponse 형식의 오류 메시지를 보낼 수 있다면 여기서 반환할 수 있습니다.
      // 그렇지 않다면, 에러를 그대로 던지거나 커스텀 에러 객체를 반환합니다.
    }
    throw error; // 오류를 호출한 쪽에서 처리할 수 있도록 다시 던집니다.
  }
};

// 기존 getFilteredRoomEvents 함수 (특정 eventType 및 receiverId로 필터링)
// 이 함수는 그대로 유지됩니다.


export const getFilteredRoomEvents = async (eventTypeFilter: string): Promise<RoomEventFromApi[]> => {
  const { chatRoomId } = useChatRoomStore.getState();
  const { memberId: currentMemberId } = useAuthStore.getState();

  if (chatRoomId === null || chatRoomId === undefined) {
    console.error("🚨 getFilteredRoomEvents: ChatRoomStore에 chatRoomId가 없습니다. 이벤트를 가져올 수 없습니다.");
    return [];
  }

  if (currentMemberId === null || currentMemberId === undefined) {
    console.error("🚨 getFilteredRoomEvents: AuthStore에 memberId가 없습니다. 멤버별로 이벤트를 필터링할 수 없습니다.");
    return [];
  }

  try {
    // 제네릭 타입을 API 응답 구조에 맞게 수정: response.data.data가 이벤트 배열이라고 가정
    const response = await axiosWithToken.get<{ data: RoomEventFromApi[] }>(
      `/room-event/chat-room/${chatRoomId}`
    );

    // response.data.data가 이벤트 배열이므로 직접 사용
    const allEvents = response.data.data ?? [];
    console.log('올바르게 가져온 이벤트 목록:', allEvents); // 수정된 allEvents 확인용 로그

    if (!Array.isArray(allEvents)) {
      console.warn(
        `🚨 getFilteredRoomEvents: chatRoomId ${chatRoomId}에 대한 API의 roomEvents가 배열이 아니거나 누락되었습니다. 수신된 값:`,
        allEvents
      );
      return [];
    }

    const filteredEvents = allEvents.filter(event => {
      console.log('단일 이벤트',event)
      // event.eventType 대신 event.roomEventType 사용
      if (event && event.roomEventType && event.receiverId !== undefined) {
        // event.eventType 대신 event.roomEventType 사용
        return event.roomEventType === eventTypeFilter && event.receiverId === currentMemberId;
      }
      return false;
    });

    console.log(
      `🔍 getFilteredRoomEvents: chatRoomId ${chatRoomId}에 대해 ${allEvents.length}개의 이벤트를 가져왔고, eventType "${eventTypeFilter}" 및 memberId ${currentMemberId}와 일치하는 ${filteredEvents.length}개의 이벤트를 찾았습니다.`
    );
    return filteredEvents;

  } catch (error) {
    console.error(`🚨 getFilteredRoomEvents: chatRoomId ${chatRoomId}에 대한 채팅방 이벤트를 가져오거나 필터링하는 데 실패했습니다:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("🚨 API 오류 응답:", { status: error.response.status, data: error.response.data });
    }

    return [];
  }
};

// getAllRoomEvents 함수의 반환 타입을 위한 인터페이스 정의
export interface FormattedSelection {
  from: number;
  to: number;
}

export interface AllRoomEventsResult {
  allEvents: RoomEventFromApi[];
  pickSelections: FormattedSelection[];
}

// 새로 추가된 getAllRoomEvents 함수 (필터링 없이 모든 이벤트 반환)
/**
 * 특정 채팅방의 모든 룸 이벤트를 가져오는 API 함수.
 * 모든 이벤트와 함께 "PICK" 타입 이벤트를 `ResultLoveArrow`의 `selections` 프롭 형식에 맞게 가공하여 반환합니다.
 * ChatRoomStore에서 현재 chatRoomId를 가져와 사용합니다.
 * @returns 모든 이벤트와 가공된 "PICK" 선택 정보를 담은 객체. 에러 발생 시 빈 배열들을 담은 객체 반환.
 */
export const getAllRoomEvents = async (): Promise<AllRoomEventsResult> => {
  const { chatRoomId } = useChatRoomStore.getState();

  if (chatRoomId === null || chatRoomId === undefined) {
    console.error("🚨 getAllRoomEvents: ChatRoomStore에 chatRoomId가 없습니다. 이벤트를 가져올 수 없습니다.");
    return { allEvents: [], pickSelections: [] };
  }

  try {
    // API 엔드포인트는 getFilteredRoomEvents와 동일하지만, 필터링 로직은 클라이언트에서 수행하지 않습니다.
    // 제네릭 타입을 API 응답 구조에 맞게 수정: response.data.data가 이벤트 배열이라고 가정
    const response = await axiosWithToken.get<{ data: RoomEventFromApi[] }>(
      `/room-event/chat-room/${chatRoomId}`
    );

    const eventsFromApi = response.data.data ?? []; // response.data.data가 이벤트 배열이므로 직접 사용
    console.log(`🔍 getAllRoomEvents: chatRoomId ${chatRoomId}에 대해 ${eventsFromApi.length}개의 이벤트를 가져왔습니다.`, eventsFromApi);

    // "PICK" 타입 이벤트만 필터링하여 selections 형식으로 변환
    const pickSelections: FormattedSelection[] = eventsFromApi
      .filter(event => event.roomEventType === "PICK")
      .map(event => ({
        from: event.senderId,
        to: event.receiverId,
      }));
    
    console.log(`🔍 getAllRoomEvents: 추출된 PICK 선택 정보 (${pickSelections.length}개):`, pickSelections);

    return { allEvents: eventsFromApi, pickSelections };

  } catch (error) {
    console.error(`🚨 getAllRoomEvents: chatRoomId ${chatRoomId}에 대한 채팅방 이벤트를 가져오는 데 실패했습니다:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("🚨 API 오류 응답:", { status: error.response.status, data: error.response.data });
    }
    return { allEvents: [], pickSelections: [] }; // 에러 발생 시 빈 배열들을 담은 객체 반환
  }
};

/**
 * 특정 채팅방의 모든 "PICK" 타입 룸 이벤트를 가져오는 API 함수.
 * ChatRoomStore에서 현재 chatRoomId를 가져와 사용하고, 클라이언트에서 필터링합니다.
 * @returns 해당 채팅방의 "PICK" 이벤트 배열 또는 에러 발생 시 빈 배열
 */
export const getPickEventsForRoom = async (): Promise<RoomEventFromApi[]> => {
  const { chatRoomId } = useChatRoomStore.getState();

  if (chatRoomId === null || chatRoomId === undefined) {
    console.error("🚨 getPickEventsForRoom: ChatRoomStore에 chatRoomId가 없습니다. 이벤트를 가져올 수 없습니다.");
    return [];
  }

  try {
    // 제네릭 타입을 API 응답 구조에 맞게 수정: response.data.data가 이벤트 배열이라고 가정
    const response = await axiosWithToken.get<{ data: RoomEventFromApi[] }>(
      `/room-event/chat-room/${chatRoomId}`
    );

    const allEvents = response.data.data ?? []; // response.data.data가 이벤트 배열이므로 직접 사용
    console.log('필터링 전 데이터', allEvents);
    // "PICK" 타입 이벤트만 필터링
    const pickEvents = allEvents.filter(event => event.roomEventType === "PICK");

    console.log(`🔍 getPickEventsForRoom: chatRoomId ${chatRoomId}에 대해 ${allEvents.length}개의 전체 이벤트 중 ${pickEvents.length}개의 "PICK" 이벤트를 가져왔습니다.`);
    console.log("✅ getPickEventsForRoom 최종 반환 값 (pickEvents):", pickEvents); // 최종 반환 값 로깅

    return pickEvents;

  } catch (error) {
    console.error(`🚨 getPickEventsForRoom: chatRoomId ${chatRoomId}에 대한 "PICK" 이벤트를 가져오는 데 실패했습니다:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("🚨 API 오류 응답:", { status: error.response.status, data: error.response.data });
    }
    return []; // 에러 발생 시 빈 배열 반환
  }
};