import { create } from 'zustand';

// API 응답에 따른 타입 정의
export interface Theme {
  themeId: number;
  name: string;
  description: string;
  image: string;
  themeStatus: "THEME_ON" | "THEME_PLANNED" | string; // THEME_OFF 등 다른 상태도 올 수 있음
}

export interface NoticeImage {
  noticeImageId: number;
  noticeId: number;
  imageUrl: string;
  content: string;
  thumbnail?: boolean; // API 응답에 thumbnail이 있으므로 추가
}

export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  noticeImages: NoticeImage[];
  startDate: string;
  endDate: string;
  noticeType: "EVENT" | "NOTICE" | "UPDATE" | string;
  noticeStatus: "ONGOING" | "CLOSED" | "SCHEDULED" | string;
  noticeImportance: number; // API 응답에서는 importance로 되어있을 수 있음 (0 또는 1)
  createdAt: string;
  modifiedAt: string;
}

// 아이템 타입 정의 (제공해주신 정보 기반)
export interface Item {
  itemId: number;
  itemName: string;
  description: string;
  itemImage: string;
  dicePrice: number;
}

export interface HomeState {
  themes: Theme[];
  notices: Notice[]; // Notice 타입이 이미 정의되어 있다고 가정
  hasNewNotifications: boolean;
  initialHomeApiCalled: boolean;
  items: Item[]; // ✅ 아이템 목록 상태 추가
  // ... 기타 상태들 ...
}

export interface HomeActions {
  setThemes: (themes: Theme[]) => void;
  setNotices: (notices: Notice[]) => void;
  setHasNewNotifications: (hasNew: boolean) => void;
  setInitialHomeApiCalled: (called: boolean) => void;
  setItems: (items: Item[]) => void; // ✅ 아이템 설정 액션 추가
  // ... 기타 액션들 ...
}

export interface HomeStore extends HomeState {
  actions: HomeActions;
}

const useHomeStore = create<HomeStore>((set) => ({
  themes: [],
  notices: [],
  hasNewNotifications: false,
  initialHomeApiCalled: false,
  items: [], // ✅ 아이템 초기 상태
  actions: {
    setThemes: (themes) => set({ themes }),
    setNotices: (notices) => set({ notices }),
    setHasNewNotifications: (hasNew) => set({ hasNewNotifications: hasNew }),
    setInitialHomeApiCalled: (called) => set({ initialHomeApiCalled: called }),
    setItems: (items) => set({ items }), // ✅ 아이템 설정 액션 구현
    clearHomeData: () => set({ themes: [], notices: [], hasNewNotifications: false, initialHomeApiCalled: false, items: [] }),
  },
}));

// 스토어의 상태만 선택적으로 사용하고 싶을 때 (컴포넌트 리렌더링 최적화에 도움)
// export const useInitialHomeApiCalled = () => useHomeStore((state) => state.initialHomeApiCalled);

// 스토어의 액션만 쉽게 사용하기 위해 export (선택적)
export const useHomeActions = () => useHomeStore((state) => state.actions);

export default useHomeStore;
