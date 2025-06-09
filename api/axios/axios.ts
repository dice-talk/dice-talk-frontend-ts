// [수정] 순환 참조를 유발하는 authApi import 제거
// import { refreshAccessToken } from "@/api/authApi"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { Platform } from "react-native";

// ✅ Base URL을 상단에서 직접 지정
//export const BASE_URL = "https://www.dicetalk.co.kr"; // EC2 서버
export const BASE_URL = "http://192.168.0.7:8080"; // 로컬 개발 서버

// export const BASE_URL = "http://localhost:8080"; // 로컬호스트

/**
 * [추가] axios 인스턴스의 기본 헤더에 토큰을 설정하거나 제거하는 함수
 * @param token - 설정할 accessToken. null을 보내면 헤더에서 제거됨.
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    console.log("setAuthToken: axios 헤더에 새 토큰 설정.");
    axiosWithToken.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    console.log("setAuthToken: axios 헤더에서 토큰 제거.");
    delete axiosWithToken.defaults.headers.common['Authorization'];
  }
};

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
    if (Platform.OS !== 'web') {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("📡 요청 URL:", config.baseURL + (config.url ?? ""));

      if (token) {
          config.headers = config.headers || {};
          (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    } else {
      console.log("📡 요청 URL (Web):", config.baseURL + (config.url ?? ""));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// [수정] 응답 인터셉터에서 자동 토큰 재발급 로직을 제거하여 순환 참조를 완전히 해결합니다.
// 401 에러 발생 시, 에러를 그대로 반환하여 API를 호출한 상위 로직에서 처리하도록 책임을 위임합니다.
axiosWithToken.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('axiosWithToken Interceptor: 401 에러(토큰 만료 가능성) 감지. 자동 재발급 로직 비활성화 상태. 에러를 그대로 반환합니다.');
      // 여기서 추가적인 처리를 하지 않고 바로 에러를 반환합니다.
    }
    return Promise.reject(error);
  }
);
