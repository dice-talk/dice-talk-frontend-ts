import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Base URL을 상단에서 직접 지정
export const BASE_URL =  "http://192.168.0.7:8080" //"http://localhost:8080";

// ✅ 기본 axios 인스턴스 (토큰 불필요)
export const axiosWithoutToken: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ✅ 토큰이 필요한 axios 인스턴스
export const axiosWithToken: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

// ✅ 토큰이 필요한 요청에 대한 인터셉터 설정
axiosWithToken.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("📄 token:", token);
    console.log("📡 요청 URL:", config.baseURL + (config.url ?? ""));
    console.log("📄 Params:", config.params);

    if (token) {
        // ✅ 안전하게 헤더를 추가 (타입 안전성 보장)
        config.headers = config.headers || {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
  
      return config;
    },
  (error) => {
    return Promise.reject(error);
  }
);
