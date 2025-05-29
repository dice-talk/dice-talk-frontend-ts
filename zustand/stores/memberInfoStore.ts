// src/zustand/stores/memberStore.ts
import { create } from "zustand";

// 회원가입 과정에서 필요한 정보 타입을 명확히 정의
export type UserRegistrationInfo = {
  email: string | null;
  name: string | null;
  phone: string | null;
  gender: 'MALE' | 'FEMALE' | null; // Toss 인증 응답에 맞게
  birth: string | null; // YYYY-MM-DD 또는 YYYYMMDD 형식
  ageGroup: string | null;
  region?: string | null; // region 필드 추가
};

type MemberStore = {
  // 로그인 시 사용
  memberId: number | null;
  token: string | null;
  
  // 회원가입 과정 및 이후 사용자 정보 참조에 사용될 수 있는 정보
  registrationInfo: UserRegistrationInfo;

  // 앱 초기화 관련 상태 추가
  isAutoLoginAttempted: boolean; // 자동 로그인 시도 여부
  isAppInitialized: boolean;     // 앱 최종 준비 완료 여부

  // Setter 함수들
  setMemberId: (id: number | null) => void;
  setToken: (token: string | null) => void;
  setEmail: (email: string | null) => void; // registrationInfo.email을 설정
  setName: (name: string | null) => void;
  setPhone: (phone: string | null) => void;
  setGender: (gender: 'MALE' | 'FEMALE' | null) => void;
  setBirth: (birth: string | null) => void;
  setAgeGroup: (ageGroup: string | null) => void;
  setRegion: (region: string | null) => void; // setRegion 함수 정의 추가
  // 회원가입 정보 한번에 업데이트 (선택적)
  setRegistrationInfo: (info: Partial<UserRegistrationInfo>) => void;

  // 앱 초기화 상태 설정 함수 추가
  setIsAutoLoginAttempted: (status: boolean) => void;
  setIsAppInitialized: (status: boolean) => void;

  clearMember: () => void; // 로그인 정보 및 회원가입 정보 초기화
  clearRegistrationInfo: () => void; // 회원가입 정보만 초기화
  clearStore: () => void; // 로그아웃 시 전체 스토어 초기화를 위한 함수 추가
};

const initialRegistrationInfo: UserRegistrationInfo = {
  email: null,
  name: null,
  phone: null,
  gender: null,
  birth: null,
  ageGroup: null,
  region: null, // region 초기값 추가
};

const initialState = {
  memberId: null,
  token: null,
  registrationInfo: { ...initialRegistrationInfo },
  isAutoLoginAttempted: false, // 초기값 false
  isAppInitialized: false,     // 초기값 false
};

export const useMemberInfoStore = create<MemberStore>((set) => ({
    ...initialState, // 초기 상태 적용

    setMemberId: (id: number | null) => set({ memberId: id }),
    setToken: (token: string | null) => set({ token: token }),
    
    setEmail: (email: string | null) => 
        set((state) => ({ 
            registrationInfo: { ...state.registrationInfo, email } 
        })),
    setName: (name: string | null) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, name }
        })),
    setPhone: (phone: string | null) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, phone }
        })),
    setGender: (gender: 'MALE' | 'FEMALE' | null) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, gender }
        })),
    setBirth: (birth: string | null) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, birth }
        })),
    setAgeGroup: (ageGroup: string | null) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, ageGroup }
        })),

    setRegion: (region: string | null) => // setRegion 함수 구현 추가
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, region }
        })),

    setRegistrationInfo: (info: Partial<UserRegistrationInfo>) =>
        set((state) => ({
            registrationInfo: { ...state.registrationInfo, ...info }
        })),
    
    // 앱 초기화 상태 설정 함수 구현
    setIsAutoLoginAttempted: (status: boolean) => set({ isAutoLoginAttempted: status }),
    setIsAppInitialized: (status: boolean) => set({ isAppInitialized: status }),

    clearMember: () =>
        set({
          ...initialState, // 로그아웃 시 memberId, token, registrationInfo 뿐만 아니라 초기화 상태도 리셋
        }),
    
    clearRegistrationInfo: () => 
        set((state) => ({ 
            registrationInfo: { ...initialRegistrationInfo },
            // 회원가입 정보만 초기화할 때, 다른 로그인/앱초기화 상태는 유지해야 할 수 있음
            // 이 부분은 앱의 구체적인 요구사항에 따라 조정 필요. 
            // 여기서는 일단 registrationInfo만 초기화
         })),

    // clearStore 구현 (로그아웃 시 사용)
    clearStore: () =>
        set({
            ...initialState, // 모든 상태를 초기값으로 리셋
        }),
}));
