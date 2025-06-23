import { create } from 'zustand';

interface ChatNotificationState {
  hasUnread: boolean;
  setHasUnread: (hasUnread: boolean) => void;
}

/**
 * 앱이 포그라운드에 있을 때 수신된 새로운 채팅 알림 유무를 관리하는 스토어.
 * '읽지 않은 메시지' 상태를 나타내어 UI (예: 탭 아이콘의 빨간 점)에 반영하는 데 사용됩니다.
 */
const useChatNotificationStore = create<ChatNotificationState>((set) => ({
  hasUnread: false,
  setHasUnread: (hasUnread) => set({ hasUnread }),
}));

export default useChatNotificationStore;
