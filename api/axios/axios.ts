import { refreshAccessToken } from "@/api/authApi";
import useAuthStore from "@/zustand/stores/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Base URL을 상단에서 직접 지정
//export const BASE_URL = "https://www.dicetalk.co.kr"; // EC2 서버
export const BASE_URL = "http://172.29.83.105:8080"; // 로컬 개발 서버

// export const BASE_URL = "http://localhost:8080"; // 로컬호스트

// ✅ 기본 axios 인스턴스 (토큰 불필요)
export const axiosWithoutToken: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ✅ 토큰이 필요한 axios 인스턴스
export const axiosWithToken: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터: 모든 요청에 accessToken 추가
axiosWithToken.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("accessToken"); // 요청 시점의 최신 토큰 사용
    // console.log("📄 token:", token ? token.substring(0, 10) + "..." : "No token"); // 디버깅 시 필요하면 주석 해제
    console.log("📡 요청 URL:", config.baseURL + (config.url ?? "")); // 디버깅 시 필요하면 주석 해제

    if (token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 (토큰 만료 시 재발급 로직)

// 여러 요청이 동시에 토큰 재발급을 시도하는 것을 방지하기 위한 변수들
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    } else {
      // 토큰도 없고 에러도 없는 경우는 발생하지 않아야 함
      prom.reject(new Error('Token refresh process queue error: No token and no error.'));
    }
  });
  failedQueue = [];
};

axiosWithToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const { clearAuthInfo } = useAuthStore.getState().actions;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 재발급이 진행 중이면, 현재 요청을 큐에 추가
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(async (newAccessToken) => {
            console.log('axiosWithToken Interceptor (Queue): 새 토큰으로 대기 중이던 요청 재시도.');
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
            return axiosWithToken(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err); // 큐에서 대기 중 재발급 실패 시 에러 전파
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('axiosWithToken Interceptor: AccessToken 만료. 재발급 시도...');
        const refreshedSuccessfully = await refreshAccessToken(); // authApi.ts의 함수

        if (refreshedSuccessfully) {
          const newAccessToken = await AsyncStorage.getItem("accessToken"); // AsyncStorage에서 최신 토큰을 가져옴
          
          if (newAccessToken) {
            console.log('axiosWithToken Interceptor: 토큰 재발급 성공. 원래 요청 재시도.');
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken); // 대기 중이던 요청들 성공 처리
            return axiosWithToken(originalRequest); // 현재 원래 요청 재시도
          } else {
            // refreshAccessToken이 true를 반환했으나 AsyncStorage에 토큰이 없는 극히 드문 경우
            console.error('axiosWithToken Interceptor: 토큰 재발급은 성공했으나 AsyncStorage에서 새 토큰을 찾을 수 없음.');
            await clearAuthInfo(); // 확실하게 하기 위해 호출 (refreshAccessToken 내부에서도 호출됨)
            processQueue(new Error('Failed to retrieve new access token after refresh.'), null);
            return Promise.reject(new Error('토큰 재발급 후 새 토큰 로드 실패'));
          }
        } else {
          console.log('axiosWithToken Interceptor: 토큰 재발급 실패 (refreshAccessToken이 false 반환). 로그아웃 처리.');
          // refreshAccessToken 내부에서 clearAllStores가 호출되어 AsyncStorage와 스토어가 정리됨
          processQueue(new Error('Token refresh failed and logged out.'), null);
          // TODO: 사용자에게 안내 후 로그인 페이지로 리디렉션하는 로직 추가 고려
          return Promise.reject(new Error('토큰 재발급 실패 및 로그아웃됨'));
        }
      } catch (refreshCatchError) {
        console.error('axiosWithToken Interceptor: 토큰 재발급 중 예외 발생:', refreshCatchError);
        // refreshAccessToken 내부에서 clearAllStores가 호출되었을 가능성 높음
        processQueue(refreshCatchError, null);
        // TODO: 사용자에게 안내 후 로그인 페이지로 리디렉션하는 로직 추가 고려
        return Promise.reject(refreshCatchError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
