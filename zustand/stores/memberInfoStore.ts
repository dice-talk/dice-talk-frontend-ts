// src/zustand/stores/memberStore.ts
import { MemberInfo } from "@/types/MemberInfo";
import { create } from "zustand";

type MemberStore = {
  memberInfo: MemberInfo | null;
  token: string | null;
  email: string | null;
  setMemberInfo: (info: MemberInfo) => void;
  setToken: (token: string) => void;
  setEmail: (email: string) => void;
  updateMemberInfo: (updates: Partial<MemberInfo>) => void;
  clearMember: () => void;
};

export const useMemberInfoStore = create<MemberStore>((set) => ({
    memberInfo: null,
    token: null,
    email: null,

    setMemberInfo: (info: MemberInfo) =>
        set({
          memberInfo: info,
        }),

    setToken: (token: string) =>
        set({
          token: token,
        }),
    
    setEmail: (email: string) =>
        set({
            email: email,
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
      email: null,
    }),
}));
