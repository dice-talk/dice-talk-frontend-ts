import { create } from 'zustand';

// 이벤트 메시지 데이터의 타입을 정의합니다.
export interface EventMessageData { // export 키워드 추가
  receiverId: number | null;
  senderId: number | null;
  eventId: number | null;
  chatRoomId: number | null;
  message: string | null; // message가 null 값을 가질 수 있도록 수정
  roomEventType: string; // 필요에 따라 더 구체적인 타입 (예: "PICK_MESSAGE" | "OTHER_TYPE")으로 변경 가능
}

// 스토어의 상태 및 액션 타입을 정의합니다.
interface EventMessageState {
  currentEventMessage: EventMessageData | null;
  setCurrentEventMessage: (messageData: EventMessageData | null) => void; // null도 받을 수 있도록 수정
  updateEventMessage: (partialMessageData: Partial<EventMessageData>) => void;
  clearEventMessage: () => void;
}

// 초기 상태 값입니다.
const initialState: Pick<EventMessageState, 'currentEventMessage'> = {
  currentEventMessage: null,
};

const useEventMessageStore = create<EventMessageState>((set) => ({
  ...initialState,
  setCurrentEventMessage: (messageData) => set({ currentEventMessage: messageData }),
  updateEventMessage: (partialMessageData) =>
    set((state) => {
      if (state.currentEventMessage) {
        // 기존 메시지가 있으면 부분 업데이트
        return { currentEventMessage: { ...state.currentEventMessage, ...partialMessageData } };
      } else {
        // 기존 메시지가 없으면, partialMessageData가 EventMessageData의 모든 필수 필드를 포함하는지 확인
        const requiredKeys: Array<keyof EventMessageData> = ['receiverId', 'senderId', 'eventId', 'chatRoomId', 'message', 'roomEventType'];
        const hasAllRequiredKeys = requiredKeys.every(
          (key) => key in partialMessageData && partialMessageData[key] !== undefined && partialMessageData[key] !== null
        );
        if (hasAllRequiredKeys) {
          return { currentEventMessage: partialMessageData as EventMessageData };
        }
        // 필수 필드가 모두 제공되지 않으면 상태를 변경하지 않음 (currentEventMessage는 null 유지)
        return {};
      }
    }),
  clearEventMessage: () => set({ currentEventMessage: null }),
}));

export default useEventMessageStore;
