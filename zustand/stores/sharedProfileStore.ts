import { create } from 'zustand';

// 스토어의 상태 타입을 정의합니다.
interface SharedProfileState {
  nickname: string | null;
  profileImage: string | null; // URL 또는 로컬 이미지 식별자 (타입은 사용에 따라 ImageSourcePropType이 될 수도 있음)
  totalDice: number;
  isInChat: boolean;
  // hasCompletedInitialProfileView: boolean; // "사용자 최초 1번 본인 정보 표시" 요건용 (선택적)
  actions: {
    setSharedProfile: (data: Partial<Omit<SharedProfileState, 'actions'>>) => void;
    setNickname: (nickname: string | null) => void;
    setProfileImage: (profileImage: string | null) => void;
    setTotalDice: (totalDice: number) => void;
    setIsInChat: (isInChat: boolean) => void;
    // setHasCompletedInitialProfileView: (completed: boolean) => void; // 선택적
    clearSharedProfile: () => void;
  };
}

// 스토어를 생성합니다.
const useSharedProfileStore = create<SharedProfileState>((set) => ({
  // 초기 상태 값
  nickname: null,
  profileImage: null, 
  totalDice: 0,
  isInChat: false,
  // hasCompletedInitialProfileView: false, // 선택적

  // 상태를 변경하는 액션들을 정의합니다.
  actions: {
    setSharedProfile: (data) => {
      console.log('sharedProfileStore: setSharedProfile', data);
      set((state) => ({ ...state, ...data }));
    },
    setNickname: (nickname) => {
      console.log('sharedProfileStore: setNickname', nickname);
      set({ nickname });
    },
    setProfileImage: (profileImage) => {
      console.log('sharedProfileStore: setProfileImage', profileImage ? 'Image Present' : 'Image Null');
      set({ profileImage });
    },
    setTotalDice: (totalDice) => {
      console.log('sharedProfileStore: setTotalDice', totalDice);
      set({ totalDice });
    },
    setIsInChat: (isInChat) => {
      console.log('sharedProfileStore: setIsInChat', isInChat);
      set({ isInChat });
    },
    // setHasCompletedInitialProfileView: (completed) => set({ hasCompletedInitialProfileView: completed }), // 선택적
    clearSharedProfile: () => {
      console.log('sharedProfileStore: clearSharedProfile');
      set({
        nickname: null,
        profileImage: null,
        totalDice: 0,
        isInChat: false,
        // hasCompletedInitialProfileView: false, // 필요시 초기화
      });
    },
  },
}));

// 스토어 외부에서 액션만 쉽게 사용하기 위해 export (선택적)
export const useSharedProfileActions = () => useSharedProfileStore((state) => state.actions);

export default useSharedProfileStore; 