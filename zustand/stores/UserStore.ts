import { create } from 'zustand';

interface UserState {
  region: string | null;
  birth: string | null; // YYYY-MM-DD 형식 또는 다른 string 형식
  // 향후 다른 사용자 관련 정보 추가 가능
  // 예: nickname: string | null;
  // 예: profileImageUrl: string | null;
}

interface UserActions {
  setUserInfo: (data: { region?: string; birth?: string }) => void;
  clearUserInfo: () => void;
}

type UserStoreType = UserState & {
  actions: UserActions;
};

const useUserStore = create<UserStoreType>((set) => ({
  region: null,
  birth: null,
  actions: {
    setUserInfo: ({ region, birth }) => {
      console.log('UserStore: setUserInfo', { region, birth });
      // region이나 birth 중 하나만 업데이트될 수도 있으므로,
      // undefined가 아닐 경우에만 상태를 업데이트하도록 처리합니다.
      set((state) => ({
        region: region !== undefined ? region : state.region,
        birth: birth !== undefined ? birth : state.birth,
      }));
    },
    clearUserInfo: () => {
      console.log('UserStore: clearUserInfo');
      set({ region: null, birth: null });
    },
  },
}));

export const useUserActions = () => useUserStore((state) => state.actions);

export default useUserStore;
