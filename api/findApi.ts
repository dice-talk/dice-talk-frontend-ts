import { axiosWithoutToken } from "./axios/axios";

export interface FindEmailResponse {
    email: string;
  }

export interface ResetPasswordParams {
    email: string;
    newPassword: string;
  }
  
  export interface ResetPasswordResponse {
    message: string; // 성공 메시지 또는 기타 응답 데이터
  }
  
  export const resetPasswordAfterTossAuth = async (memberId: number, params: ResetPasswordParams): Promise<ResetPasswordResponse> => {
      try {
          const response = await axiosWithoutToken.post<ResetPasswordResponse>(
              `/auth/resetting/password/${memberId}`,
              params // { email, newPassword }
          );
          console.log(`비밀번호 재설정 API 응답 (memberId: ${memberId}):`, response.data);
          return response.data; // 성공 시 { message: "..." } 또는 API 명세에 따른 응답
      } catch (error: any) {
          console.error(`🚨 비밀번호 재설정 실패 (memberId: ${memberId}):`, error.response?.data || error.message);
          if (error.response && error.response.data) {
              throw error.response.data; // 서버에서 보낸 오류 객체 throw
          }
          // 일반적인 네트워크 오류 등
          throw new Error("비밀번호 재설정 중 오류가 발생했습니다.");
      }
  };
  
  // 아이디(이메일) 찾기 API (Toss 인증 후 txId 사용)
export const findEmailByTxId = async (txId: string): Promise<FindEmailResponse> => {
    try {
        const params = new URLSearchParams();
        params.append('txId', txId);
        const response = await axiosWithoutToken.post<FindEmailResponse>(
            "/auth/recover/email", 
            params, 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log('아이디(이메일) 찾기 API 응답 (POST, form-urlencoded):', response.data);
        return response.data;
    } catch (error: any) {
        console.error("🚨 아이디(이메일) 찾기 실패:", error.response?.data || error.message);
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        } else if (error.response?.data) {
            throw error.response.data;
        }
        throw new Error(error.message || "아이디(이메일)를 찾는 중 오류가 발생했습니다.");
    }
};

// Toss 인증 후 비밀번호 재설정 URI 요청 관련 인터페이스 및 함수 (신규 추가)
export interface RecoverPasswordWithTossParams {
  txId: string;
  email: string;
}

export interface RecoverPasswordWithTossResponse {
  resetUri: string; // 예: "/auth/recover/password/1"
  email: string;
  memberId: number; // URI에서 추출한 memberId (필수값으로 변경)
}

export const requestPasswordResetUriAfterToss = async (params: RecoverPasswordWithTossParams): Promise<RecoverPasswordWithTossResponse> => {
    try {
        const formParams = new URLSearchParams();
        formParams.append('txId', params.txId);
        formParams.append('email', params.email);

        const apiResponse = await axiosWithoutToken.post< { email: string } | string >( // 바디 타입 수정
            "/auth/recover/password", 
            formParams, 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('Toss 인증 후 비밀번호 재설정 URI 요청 - 전체 API 응답:', apiResponse);
        console.log('Toss 인증 후 비밀번호 재설정 URI 요청 - 응답 데이터(바디):', apiResponse.data);
        console.log('Toss 인증 후 비밀번호 재설정 URI 요청 - 응답 헤더:', apiResponse.headers);

        // 헤더에서 resetUri 추출 (실제 헤더 이름은 백엔드 확인 필요)
        // 예시: 'location', 'reset-uri', 'x-reset-uri' 등. 백엔드에서 알려준 정확한 헤더 이름으로 변경하세요.
        const resetUriHeaderKey = Object.keys(apiResponse.headers).find(
            key => key.toLowerCase() === 'reseturi' || // 사용자가 언급한 "resetUri"를 소문자로
                   key.toLowerCase() === 'reset-uri' || 
                   key.toLowerCase() === 'location' // 일반적인 경우
        );
        const resetUri = resetUriHeaderKey ? apiResponse.headers[resetUriHeaderKey] : null;

        if (!resetUri || typeof resetUri !== 'string') { // 문자열인지도 확인
            console.error("응답 헤더에서 resetUri를 찾을 수 없거나 유효하지 않습니다. Headers:", apiResponse.headers);
            throw new Error("서버 응답 헤더에서 resetUri를 찾을 수 없거나 유효하지 않습니다.");
        }

        // 바디에서 email 추출
        let responseEmail: string | undefined;
        if (typeof apiResponse.data === 'string') {
            responseEmail = apiResponse.data;
        } else if (typeof apiResponse.data === 'object' && apiResponse.data !== null && 'email' in apiResponse.data) {
            // apiResponse.data가 { email: string } 형태일 경우
            responseEmail = (apiResponse.data as { email: string }).email;
        } else {
            console.error("응답 바디에서 email 정보를 찾을 수 없습니다. Body:", apiResponse.data);
            throw new Error("서버 응답 바디에서 이메일 정보를 찾을 수 없습니다.");
        }

        if (!responseEmail) { // 최종적으로 이메일이 추출되었는지 한번 더 확인
             console.error("이메일 정보가 비어있습니다. Body:", apiResponse.data);
             throw new Error("서버로부터 유효한 이메일 정보를 받지 못했습니다.");
        }

        // URI에서 memberId 추출
        const parts = resetUri.split('/');
        const memberIdStr = parts.pop();
        const memberId = memberIdStr ? parseInt(memberIdStr, 10) : NaN;

        if (isNaN(memberId)) {
            console.error(`resetUri '${resetUri}'에서 유효한 memberId를 추출하지 못했습니다.`);
            throw new Error(`유효한 사용자 ID를 확인할 수 없습니다.`);
        }

        return { resetUri: resetUri, email: responseEmail, memberId };

    } catch (error: any) {
        // Axios 에러인 경우, error.response 객체가 존재할 수 있음
        if (error.response) {
            console.error("🚨 API 요청 실패 (서버 응답 있음):", 
                          { status: error.response.status, data: error.response.data, headers: error.response.headers });
        } else if (error.request) {
            // 요청은 이루어졌으나 응답을 받지 못한 경우 (네트워크 문제 등)
            console.error("🚨 API 요청 실패 (응답 없음):", error.request);
        } else {
            // 요청 설정 중 에러 발생 또는 기타 에러
            console.error("🚨 API 요청 실패 (기타 에러):", error.message);
        }

        // 사용자에게 보여줄 에러 메시지 결정
        let clientErrorMessage = "Toss 인증 후 비밀번호 재설정 URI를 요청하는 중 오류가 발생했습니다.";
        if (error.message.startsWith("서버 응답") || error.message.startsWith("유효한 사용자 ID")) {
            clientErrorMessage = error.message; // 함수 내부에서 생성된 특정 오류 메시지
        } else if (error.response?.data?.message) {
            clientErrorMessage = error.response.data.message; // 서버가 제공하는 에러 메시지 (JSON 형태)
        } else if (typeof error.response?.data === 'string' && error.response.data.length < 100) { // 너무 길지 않은 문자열 에러
            clientErrorMessage = error.response.data;
        }
        throw new Error(clientErrorMessage);
    }
};
  