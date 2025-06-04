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

// <<<<<<< HEAD
// // 아이템 타입 정의 (제공해주신 정보 기반)
export interface Item {
  itemId: number;
  itemName: string;
  description: string;
  itemImage: string;
  dicePrice: number;
}
// =======
// interface HomeState {
//   initialHomeApiCalled: boolean;
//   themes: Theme[] | null;
//   notices: Notice[] | null;
//   hasNewNotifications: boolean | null;
//   chatRoomId: number | null; // 추가: 홈 화면 관련 채팅방 ID
// >>>>>>> 48bf35c (사이드바 다음 이벤트 시간 계산이후 출력까지 성공)
// }

export interface HomeState {
  themes: Theme[];
  notices: Notice[]; // Notice 타입이 이미 정의되어 있다고 가정
  hasNewNotifications: boolean;
  initialHomeApiCalled: boolean;
  items: Item[]; // ✅ 아이템 목록 상태 추가
  chatRoomId: number | null; // 추가: 홈 화면 관련 채팅방 ID
  curThemeId: number | null; // 추가: 현재 선택된 또는 API로부터 받은 테마 ID

}

export interface HomeActions {
  setThemes: (themes: Theme[]) => void;
  setNotices: (notices: Notice[]) => void;
  setHasNewNotifications: (hasNew: boolean) => void;
  setInitialHomeApiCalled: (called: boolean) => void;
  setItems: (items: Item[]) => void; // ✅ 아이템 설정 액션 추가
  // ... 기타 액션들 ...
  setChatRoomId: (chatRoomId: number | null) => void; // 추가: chatRoomId 설정 액션
  setCurThemeId: (themeId: number | null) => void; // 추가: curThemeId 설정 액션
  clearHomeData: () => void; // 필요시 홈 데이터 초기화 액션
}

export interface HomeStore extends HomeState {
  actions: HomeActions;
}

const useHomeStore = create<HomeStore>((set) => ({
  themes: [],
  notices: [],
  hasNewNotifications: false,
  initialHomeApiCalled: false,
  chatRoomId: null, // 추가: chatRoomId 초기값

  items: [], // ✅ 아이템 초기 상태

  curThemeId: null, // 추가: curThemeId 초기값

  actions: {
    
    setInitialHomeApiCalled: (called) => {
      console.log(' setInitialHomeApiCalled', called);
      set({ initialHomeApiCalled: called });
    },
    setThemes: (themes) => {
      console.log(' setThemes', themes);
      set({ themes });
    },
    setNotices: (notices) => {
      console.log(' setNotices', notices);
      set({ notices });
    },
    setHasNewNotifications: (hasNew) => {
      console.log(' setHasNewNotifications', hasNew);
      set({ hasNewNotifications: hasNew });
    },
    setChatRoomId: (chatRoomId) => { // 추가: setChatRoomId 액션 구현
      console.log(' setChatRoomId', chatRoomId);
      set({ chatRoomId });
    },
    setCurThemeId: (themeId) => { // 추가: setCurThemeId 액션 구현
      console.log(' setCurThemeId', themeId);
      set({ curThemeId: themeId });
    },

    setItems: (items) => { // ✅ 아이템 설정 액션 구현
      console.log('HomeStore: setItems', items);
      set({ items });
    },
    clearHomeData: () => set({ themes: [], notices: [], hasNewNotifications: false, initialHomeApiCalled: false, chatRoomId: null }), // chatRoomId 초기화 추가

  },
}));

// 스토어의 상태만 선택적으로 사용하고 싶을 때 (컴포넌트 리렌더링 최적화에 도움)
// export const useInitialHomeApiCalled = () => useHomeStore((state) => state.initialHomeApiCalled);

// 스토어의 액션만 쉽게 사용하기 위해 export (선택적)
export const useHomeActions = () => useHomeStore((state) => state.actions);

export default useHomeStore;
