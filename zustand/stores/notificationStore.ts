import { create } from 'zustand';

interface NotificationState {
  initialChatRoomId: string | null;
  setInitialChatRoomId: (chatRoomId: string | null) => void;
}

/**
 * 앱이 종료된 상태에서 알림을 통해 실행될 때,
 * 초기 라우팅에 필요한 chatRoomId를 임시로 저장하는 스토어.
 */
const useNotificationStore = create<NotificationState>((set) => ({
  initialChatRoomId: null,
  setInitialChatRoomId: (chatRoomId) => set({ initialChatRoomId: chatRoomId }),
}));

export default useNotificationStore; 