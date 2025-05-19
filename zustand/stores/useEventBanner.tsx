// import { create } from 'zustand';

// interface ResponseState {
//   data: any;
//   loading: boolean;
//   error: string | null;

//   // 액션
//   setData: (data: any) => void;
//   setLoading: (loading: boolean) => void;
//   setError: (error: string | null) => void;
//   reset: () => void;
// }

// const useResponseStore = create<ResponseState>((set) => ({
//   data: null,
//   loading: false,
//   error: null,

//   setData: (data) => set({ data }),
//   setLoading: (loading) => set({ loading }),
//   setError: (error) => set({ error }),

//   reset: () => set({ data: null, loading: false, error: null }),
// }));

// export default useResponseStore;