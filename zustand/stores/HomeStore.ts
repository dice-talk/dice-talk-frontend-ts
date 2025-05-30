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

interface HomeState {
  initialHomeApiCalled: boolean;
  themes: Theme[] | null;
  notices: Notice[] | null;
  hasNewNotifications: boolean | null;
}

interface HomeActions {
  setInitialHomeApiCalled: (called: boolean) => void;
  setThemes: (themes: Theme[]) => void;
  setNotices: (notices: Notice[]) => void;
  setHasNewNotifications: (hasNew: boolean) => void;
  clearHomeData: () => void; // 필요시 홈 데이터 초기화 액션
}

// 스토어의 전체 타입을 정의합니다 (상태 + 액션).
type HomeStoreType = HomeState & {
  actions: HomeActions;
};

const useHomeStore = create<HomeStoreType>((set) => ({
  initialHomeApiCalled: false, // 기본값은 false
  themes: null,
  notices: null,
  hasNewNotifications: null,
  actions: {
    setInitialHomeApiCalled: (called) => {
      console.log('HomeStore: setInitialHomeApiCalled', called);
      set({ initialHomeApiCalled: called });
    },
    setThemes: (themes) => {
      console.log('HomeStore: setThemes', themes);
      set({ themes });
    },
    setNotices: (notices) => {
      console.log('HomeStore: setNotices', notices);
      set({ notices });
    },
    setHasNewNotifications: (hasNew) => {
      console.log('HomeStore: setHasNewNotifications', hasNew);
      set({ hasNewNotifications: hasNew });
    },
    clearHomeData: () => set({ themes: null, notices: null, hasNewNotifications: null, initialHomeApiCalled: false }),
  },
}));

// 스토어의 상태만 선택적으로 사용하고 싶을 때 (컴포넌트 리렌더링 최적화에 도움)
// export const useInitialHomeApiCalled = () => useHomeStore((state) => state.initialHomeApiCalled);

// 스토어의 액션만 쉽게 사용하기 위해 export (선택적)
export const useHomeActions = () => useHomeStore((state) => state.actions);

export default useHomeStore;
