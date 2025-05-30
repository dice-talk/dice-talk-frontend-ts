import { create } from 'zustand';

// 회원가입 과정에서 페이지 간 전달될 정보 타입
export interface SignupData {
  // Agreement.tsx에서 설정하고 SignupInput.tsx에서 사용
  name: string | null;
  phone: string | null; // Toss 응답에 phone이 없을 수 있음을 명시
  gender: 'MALE' | 'FEMALE' | null;
  birth: string | null; // YYYYMMDD 또는 YYYY-MM-DD 형식
  ageGroup: string | null; 
  email: string | null; // 이메일 필드 추가
  // SignupInput.tsx에서 추가로 설정될 수 있는 정보 (필요하다면)
  // email: string | null; // 이메일은 보통 서버에서 자동 할당되거나, 이전 단계에서 입력받을 수 있음
  // region: string | null;
}

interface SignupProgressState {
  signupData: SignupData;
  actions: {
    updateSignupData: (data: Partial<SignupData>) => void;
    clearSignupData: () => void;
  };
}

const initialSignupData: SignupData = {
  name: null,
  phone: null,
  gender: null,
  birth: null,
  ageGroup: null,
  email: null, // 초기값에 email 추가
};

const useSignupProgressStore = create<SignupProgressState>((set) => ({
  signupData: { ...initialSignupData },
  actions: {
    updateSignupData: (data) => {
      console.log('signupProgressStore: updateSignupData', data);
      set((state) => ({ signupData: { ...state.signupData, ...data } }));
    },
    clearSignupData: () => {
      console.log('signupProgressStore: clearSignupData');
      set({ signupData: { ...initialSignupData } });
    },
  },
}));

export const useSignupProgressActions = () => useSignupProgressStore((state) => state.actions);

export default useSignupProgressStore; 