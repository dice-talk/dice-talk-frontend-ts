import { create } from 'zustand';

interface ChatOptionState {
  themeId: number | null;
  region: string | null; // 채팅을 위해 선호하는 지역
  ageGroup: string | null;  // 채팅을 위해 선호하는 연령대 또는 생년월일 관련 문자열 (예: "20대", "1990-01-01")
}

interface ChatOptionActions {
  setThemeId: (themeId: number | null) => void;
  setRegion: (region: string | null) => void;
  setBirth: (ageGroup: string | null) => void;
  setAllChatOptions: (options: Partial<ChatOptionState>) => void;
  clearChatOptions: () => void;
}

type ChatOptionStoreType = ChatOptionState & {
  actions: ChatOptionActions;
};

const initialState: ChatOptionState = {
  themeId: null,
  region: null,
  ageGroup: null,
};

const useChatOptionStore = create<ChatOptionStoreType>((set) => ({
  ...initialState,
  actions: {
    setThemeId: (themeId) => set({ themeId }),
    setRegion: (region) => set({ region }),
    setBirth: (ageGroup) => set({ ageGroup }),
    setAllChatOptions: (options) => set((state) => ({ ...state, ...options })),
    clearChatOptions: () => set({ ...initialState }),
  },
}));

// 상태 값을 쉽게 가져오기 위한 커스텀 훅 (선택 사항이지만 권장)
export const useChatThemeId = () => useChatOptionStore((state) => state.themeId);
export const useChatRegion = () => useChatOptionStore((state) => state.region);
export const useChatBirth = () => useChatOptionStore((state) => state.ageGroup);

// 액션을 쉽게 가져오기 위한 커스텀 훅
export const useChatOptionActions = () => useChatOptionStore((state) => state.actions);

export default useChatOptionStore;