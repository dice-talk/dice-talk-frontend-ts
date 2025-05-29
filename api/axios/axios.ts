import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Base URL을 상단에서 직접 지정
// export const BASE_URL = "https://www.dicetalke.co.kr"; // EC2 서버
//export const BASE_URL = "http://192.168.0.5:8080"; // 로컬 개발 서버
export const BASE_URL = "http://192.168.0.6:8080"; // 로컬호스트

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
    const token = "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJVU0VSIl0sInVzZXJuYW1lIjoibWVtYmVyMDFAZ21haWwuY29tIiwibWVtYmVySWQiOjQsInN1YiI6Im1lbWJlcjAxQGdtYWlsLmNvbSIsImlhdCI6MTc0ODQ5MTg1MCwiZXhwIjoxNzQ4NTQ1ODUwfQ.f2--v2EITmKPk3ToDQ3qB8xwIFv-ot3-CULtbMJCpYafmbyr7qTcvcuGVTBCZ04rOe94y8Blgpmx5mhNdOmhBg";
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
