import { create } from 'zustand';

// 스토어에서 관리할 상태의 타입 정의
interface ArrowEventState {
  receiverId: number | null;
  senderId: number | null;
  eventId: number | null;
  chatRoomId: number | null;
  roomEventType: string;
  selectionsForAnimation: Array<{ from: number; to: number }>; // 애니메이션을 위한 선택 정보
  // 상태를 업데이트하는 함수들의 타입 정의
  setArrowEventDetails: (details: Partial<ArrowEventState>) => void;
  resetArrowEventDetails: () => void;
  setSelectionsForAnimation: (selections: Array<{ from: number; to: number }>) => void; // 애니메이션 선택 정보 업데이트 함수
}

// 초기 상태 값
const initialState: Omit<ArrowEventState, 'setArrowEventDetails' | 'resetArrowEventDetails' | 'setSelectionsForAnimation'> = {
  receiverId: null,
  senderId: null,
  eventId: null,
  chatRoomId: null,
  roomEventType: '',
  selectionsForAnimation: [], // 초기값 빈 배열
};

// Zustand 스토어 생성
const useArrowEventStore = create<ArrowEventState>((set) => ({
  ...initialState,
  // 상태 업데이트 함수 구현
  setArrowEventDetails: (details) =>
    set((state) => ({
      ...state,
      ...details,
    })),
  // 상태 초기화 함수 구현
  resetArrowEventDetails: () =>
    set(initialState),
  setSelectionsForAnimation: (selections) =>
    set({ selectionsForAnimation: selections }),
}));

export default useArrowEventStore;