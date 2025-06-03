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
  eventType: string; 
  memberId: number; 
  [key: string]: any;
}


export const sendRoomEvent = async (): Promise<SendRoomEventResponse> => { // eventData 매개변수 제거
  // SecretMessageStore에서 현재 이벤트 메시지 데이터를 가져옵니다.
  const { currentEventMessage } = useEventMessageStore.getState();

  if (!currentEventMessage) {
    const errorMessage = "룸 이벤트를 보낼 데이터가 스토어에 없습니다. 메시지 전송을 진행할 수 없습니다.";
    console.error(`🚨 sendRoomEvent: ${errorMessage}`);
    // 호출하는 쪽에서 이 에러를 잡아서 사용자에게 알릴 수 있도록 에러를 throw 합니다.
    throw new Error(errorMessage);
  }

  // currentEventMessage가 null이 아님을 위에서 확인했으므로, API 요청의 본문으로 사용합니다.
  const payload: EventMessageData = currentEventMessage;

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

/**

 * @param eventTypeFilter
 * @returns
 */
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

    const response = await axiosWithToken.get<{ data: { roomEvents?: RoomEventFromApi[] } }>(
      `/room-event/chat-room/${chatRoomId}`
    );

    // 1. response.data.data가 이미 이벤트 배열이므로 직접 사용합니다.
    const allEvents = (response.data.data ?? []) as RoomEventFromApi[];
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
      // 2. 실제 데이터 필드명인 event.roomEventType를 사용하고, receiverId 존재 여부 확인
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