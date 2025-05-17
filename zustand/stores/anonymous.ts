import { create } from "zustand";

type AnonymousStore = {
    memberId: number;
    nickname: string;
    profileImage: string;
    diceCount: number;
    isInChat: boolean;
    setMemberInfo: (
      nickname: string,
      profileImage: string,
      diceCount: number,
      isInChat: boolean
    ) => void;
    clearMemberInfo: () => void; // 회원 정보 초기화 함수
  };

// ✅ Zustand 상태 관리 스토어 생성 (useMemberStore)
  export const useAnonymousStore = create<AnonymousStore>((set) => ({
    // ✅ 초기 상태값 설정
    memberId: 0,
    nickname: "",
    profileImage: "",
    diceCount: 0,
    isInChat: false,
  // ✅ 회원 정보 설정 함수 (nickname, profileImage, diceCount, isInChat 업데이트) - 파라미터로 받은 값 즉시 반영
    setMemberInfo: (nickname, profileImage, diceCount, isInChat) =>
      set({
        nickname,
        profileImage,
        diceCount,
        isInChat,
      }),
  // ✅ 회원 정보 초기화 함수 (모든 값 초기 상태로 리셋) - 로그아웃
    clearMemberInfo: () =>
      set({
        memberId: 0,
        nickname: "",
        profileImage: "",
        diceCount: 0,
        isInChat: false,
      }),
  }));