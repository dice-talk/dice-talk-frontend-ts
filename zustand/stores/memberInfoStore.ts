// src/zustand/stores/memberStore.ts
import { MemberInfo } from "@/types/MemberInfo";
import { create } from "zustand";

type MemberStore = {
  memberInfo: MemberInfo | null;
  token: string | null;
  setMemberInfo: (info: MemberInfo) => void;
  setToken: (token: string) => void;
  updateMemberInfo: (updates: Partial<MemberInfo>) => void;
  clearMember: () => void;
};

export const useMemberInfoStore = create<MemberStore>((set) => ({ 
    memberInfo: {}, // ✅ 초기값을 빈 객체로 지정 (null 아님)
    token: "",

    setMemberInfo: (info: MemberInfo) =>
        set({
          memberInfo: info,
        }),

    setToken: (token: string) =>
        set({
          token: token,
        }),
    

  updateMemberInfo: (updates) =>
    set((state) => ({
      memberInfo: {
        ...((state.memberInfo ?? {}) as MemberInfo),
        ...updates,
      },
    })),

  clearMember: () =>
    set({
      memberInfo: null,
      token: null,
    }),
}));
