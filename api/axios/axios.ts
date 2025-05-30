import { refreshAccessToken } from "@/api/authApi";
import useAuthStore from "@/zustand/stores/authStore";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Base URL을 상단에서 직접 지정
export const BASE_URL = "https://www.dicetalk.co.kr"; // EC2 서버

// export const BASE_URL = "http://192.168.0.21:8080"; // 로컬 개발 서버

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

// ✅ 토큰이 필요한 요청에 대한 인터셉터 설정
axiosWithToken.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    console.log("📄 token:", token ? token.substring(0, 10) + "..." : "No token");
    console.log("📡 요청 URL:", config.baseURL + (config.url ?? ""));

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

// ✅ 응답 인터셉터 추가 (토큰 만료 시 재발급 로직)
axiosWithToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('axiosWithToken Interceptor: AccessToken 만료. 재발급 시도...');
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          console.log('axiosWithToken Interceptor: 토큰 재발급 성공. 원래 요청 재시도.');
          const newAccessToken = useAuthStore.getState().accessToken;
          if (newAccessToken) {
            // originalRequest.headers가 없을 경우를 대비하여 초기화
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;
          }
          return axiosWithToken(originalRequest);
        } else {
          console.log('axiosWithToken Interceptor: 토큰 재발급 실패. 로그아웃 처리.');
          useAuthStore.getState().actions.clearAuthInfo();
          return Promise.reject(new Error('토큰 재발급 실패 및 로그아웃됨'));
        }
      } catch (refreshError) {
        console.error('axiosWithToken Interceptor: 토큰 재발급 중 오류:', refreshError);
        useAuthStore.getState().actions.clearAuthInfo();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
