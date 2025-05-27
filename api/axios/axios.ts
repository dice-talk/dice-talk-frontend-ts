import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Base URL을 상단에서 직접 지정
export const BASE_URL = "https://www.dicetalk.co.kr"; // EC2 서버
//export const BASE_URL = "http://192.168.0.5:8080"; // 로컬 개발 서버
// export const BASE_URL = "http://localhost:8080"; // 로컬호스트

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
    //const token = await AsyncStorage.getItem("accessToken");
    const token = "eyJhbGciOiJIUzM4NCJ9.eyJyb2xlcyI6WyJBRE1JTiIsIlVTRVIiXSwidXNlcm5hbWUiOiJhZG1pbkBnbWFpbC5jb20iLCJtZW1iZXJJZCI6MSwic3ViIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzQ3NjMyMzEzLCJleHAiOjE3NDc2NDY3MTN9.LFaGutnEVUfkloR_gZtxKm2Lk-uCkgpmPczjIj0NheZaamATm8h5wXsAPbE9aKEn";
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
