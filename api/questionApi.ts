import { Platform } from 'react-native';
import { axiosWithToken } from "./axios/axios";

export interface QuestionImage {
  questionImageId: number;
  questionId: number;
  imageUrl: string;
}

interface QuestionPostDto {
  title: string;
  content: string;
  memberId: number;
}

type CreateQuestionParams = {
  dto: QuestionPostDto;
  imageUris?: string[];
}

export interface AnswerImage {
  answerImageId: number;
  imageUrl: string;
}

export interface Answer {
  answerId: number;
  content: string;
  answerImages: AnswerImage[] | null;
  questionId?: number | null;
  memberId?: number | null;
  createdAt: string;
  modifiedAt: string;
}

export interface Question {
  questionId: number;
  title: string;
  content: string;
  questionStatus: "QUESTION_REGISTERED" | "QUESTION_ANSWERED" | "QUESTION_GUEST" | "QUESTION_GUEST_ANSWERED" | "QUESTION_DELETED" | "QUESTION_DEACTIVED";
  memberId: number;
  answer: Answer | null;
  questionImages: QuestionImage[] | null;
  createdAt: string;
  modifiedAt: string;
}

// [추가] 한글 상태를 영문 Enum으로 변환하는 맵과 변환 함수
const statusKoToEnMap: { [key: string]: Question['questionStatus'] | string } = {
  "비회원 문의": "QUESTION_GUEST",
  "비회원 답변 완료": "QUESTION_GUEST_ANSWERED",
  "접수됨": "QUESTION_REGISTERED",
  "답변 완료": "QUESTION_ANSWERED",
  "삭제됨": "QUESTION_DELETED",
  "비활성화": "QUESTION_DEACTIVED",
};

const transformQuestionStatus = (question: Question): Question => {
  const rawStatus = question.questionStatus as string;
  const transformedStatus = statusKoToEnMap[rawStatus] as Question['questionStatus'] | undefined;
  
  if (transformedStatus) {
    return { ...question, questionStatus: transformedStatus };
  }
  
  // 맵에 없는 값이 오면 콘솔에 경고를 남기고 원본 값을 유지
  console.warn(`[transformQuestionStatus] Unknown question status received: "${rawStatus}".`);
  return question;
};

export const createQuestion = async ({ dto, imageUris }: CreateQuestionParams) => {
    const formData = new FormData();

    formData.append('questionPostDto', JSON.stringify(dto));
    console.log("📝 [createQuestion] DTO:", JSON.stringify(dto, null, 2));
    console.log("🖼️ [createQuestion] Image URIs to be processed:", imageUris);

    if (imageUris && imageUris.length > 0) {
        imageUris.forEach((uri, index) => {
            const fileName = uri.split('/').pop() || `photo_${index}.jpg`;
            const fileType = fileName.split('.').pop()?.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
            
            const imageFile = {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: fileName,
                type: fileType,
            };
            formData.append('images', imageFile as any);
            console.log(`📄 [createQuestion] Appended image to FormData: ${fileName}, Type: ${fileType}, URI: ${uri}`);
        });
    }

    // FormData 내용 확인용 로그 (주의: React Native 환경에서는 formData.entries() 등이 제한적일 수 있음)
    // console.log("🔍 [createQuestion] FormData entries (raw):");
    // if (formData.getParts) { // React Native FormData specific method
    //   console.log(JSON.stringify(formData.getParts(), null, 2));
    // } else {
    //   // 일반적인 FormData의 entries()는 React Native에서 직접적으로 로깅하기 어려울 수 있음
    //   // 아래 코드는 웹 환경에서는 동작하나, RN에서는 제한될 수 있습니다.
    //   // for (let pair of (formData as any).entries()) {
    //   //   console.log(pair[0] + ', ' + (typeof pair[1] === 'string' ? pair[1] : '[File Object]'));
    //   // }
    //   console.log("FormData logging for RN might require a different approach or debugging tools.");
    // }
    // 간단하게 FormData 객체 자체를 로깅 (내부 구조 확인은 어려울 수 있음)
    console.log("🔍 [createQuestion] FormData object (may not show all details in RN console):", formData);

    try{
        const response = await axiosWithToken.post("/questions", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("🚨 문의 등록 실패:", error);
        throw error;
    }
};

// 수정 시 사용될 DTO 정의 (기존 QuestionPostDto와 유사하나, keepImageIds 추가)
export interface QuestionUpdateDto {
  title?: string;
  content?: string;
  memberId: number; 
  questionStatus?: "QUESTION_REGISTERED" | "QUESTION_ANSWERED" | "QUESTION_COMPLETED";
  keepImageIds?: number[];
}

// createQuestionParams와 유사하게 updateQuestion 파라미터도 정의
type UpdateQuestionParams = {
  questionId: number;
  dto: QuestionUpdateDto;
  newImageUris?: string[];
}

export const updateQuestion = async ({ questionId, dto, newImageUris }: UpdateQuestionParams) => {
    const formData = new FormData();

    // 1. DTO를 JSON 문자열로 변환하여 FormData에 추가
    // 백엔드에서 받을 DTO 키 이름을 "questionPatchDto" 또는 명세에 따름
    formData.append('questionPatchDto', JSON.stringify(dto));

    // 2. 새로운 이미지 파일들을 FormData에 추가
    if (newImageUris && newImageUris.length > 0) {
        newImageUris.forEach((uri, index) => {
            const fileName = uri.split('/').pop() || `update_photo_${index}.jpg`;
            // 파일 확장자에 따라 정확한 MIME 타입 설정
            let fileType = 'image/jpeg'; // 기본값
            const extension = fileName.split('.').pop()?.toLowerCase();
            if (extension === 'png') {
                fileType = 'image/png';
            } else if (extension === 'gif') {
                fileType = 'image/gif';
            }
            // HEIC/HEIF 등의 경우 적절한 변환 또는 MIME 타입 설정 필요

            formData.append('images', { // 백엔드에서 받을 파일 배열 키 이름, 예시에서는 "images"
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: fileName,
                type: fileType,
            } as any);
        });
    }

    try{
        const response = await axiosWithToken.patch(`/questions/${questionId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error: any) {
        let errorMessage = "질문 수정 중 알 수 없는 오류가 발생했습니다.";
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        console.error("🚨 질문 수정 실패 (updateQuestion):", errorMessage, JSON.stringify(error.response?.data));
        throw error;
    }
}

// API 응답의 pageInfo 타입 정의
interface PageInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// getQuestions 함수는 이미 response.data.data를 사용하고 있어 올바르게 구현됨
export const getQuestions = async (page: number = 1, size: number = 10, sortBy: string = "desc") => {
    try {
      const response = await axiosWithToken.get<{
        data: Question[]; 
        pageInfo: PageInfo; 
    }>(
        `/questions/my-questions?size=${size}&page=${page}&sort=${sortBy}`
      );
      
      // [수정] 응답 받은 각 질문의 상태를 변환
      const transformedQuestions = response.data.data.map(transformQuestionStatus);

      return {
        questions: transformedQuestions, 
        totalElements: response.data.pageInfo.totalElements,
        totalPages: response.data.pageInfo.totalPages,
        currentPage: response.data.pageInfo.page, 
        size: response.data.pageInfo.size
    }
    } catch (error) {
      console.error("🚨 나의 질문 목록 조회 실패:", error);
      throw error;
    }
  };

// getQuestionDetail 함수 수정
export const getQuestionDetail = async (questionId: number): Promise<Question> => {
    try {
      const response = await axiosWithToken.get<{ data: Question }>(`/questions/${questionId}`);
      
      // [수정] 응답 받은 질문 데이터의 상태를 변환 함수를 통해 변환
      return transformQuestionStatus(response.data.data); 
    } catch (error) {
      console.error("🚨 질문 상세 조회 실패:", error);
      throw error;
    }
  };

export const deleteQuestion = async (questionId: number): Promise<void> => {
    try {
        await axiosWithToken.delete(`/questions/${questionId}`);
    } catch (error) {
        console.error("🚨 질문 삭제 실패:", error);
        throw error;
    }
  }

// 비회원 문의 생성을 위한 DTO 타입 정의
interface GuestQuestionPostDto {
  title: string;
  content: string;
  email: string;
}

// 비회원 문의 생성 함수 파라미터 타입 정의
type CreateGuestQuestionParams = {
  dto: GuestQuestionPostDto;
  imageUris?: string[]; // 회원 문의와 동일하게 이미지 URI 배열을 받음
}

// 비회원 문의 생성 함수
export const createGuestQuestion = async ({ dto, imageUris }: CreateGuestQuestionParams) => {
  const formData = new FormData();

  // DTO를 JSON 문자열로 변환하여 FormData에 추가 (백엔드가 받을 키 이름 확인 필요, 예: 'guestQuestionPostDto')
  // 백엔드 Java DTO의 필드명이 title, content, email이므로, JSON.stringify(dto)가 이를 포함해야 함.
  // @RequestPart("guestQuestionPostDto") GuestQuestionDto.GuestPost guestQuestionPostDto 와 같이 받는다면
  // formData.append('guestQuestionPostDto', JSON.stringify(dto)); 와 같이 보내야 함.
  // 만약 @ModelAttribute로 받는다면, 각 필드를 개별적으로 append해야 할 수도 있음.
  // 여기서는 Spring Boot @RequestPart("dtoKeyName") String dtoString, @RequestPart List<MultipartFile> images 형태로 받는다고 가정하고,
  // DTO 객체 전체를 하나의 JSON 문자열로 보내는 방식을 사용. (백엔드와 협의 필요)
  formData.append('guestQuestionPostDto', JSON.stringify(dto)); 
  console.log("📝 [createGuestQuestion] DTO:", JSON.stringify(dto, null, 2));
  console.log("🖼️ [createGuestQuestion] Image URIs to be processed:", imageUris);

  if (imageUris && imageUris.length > 0) {
    imageUris.forEach((uri, index) => {
      const fileName = uri.split('/').pop() || `guest_photo_${index}.jpg`;
      const fileType = fileName.split('.').pop()?.toLowerCase() === 'png' ? 'image/png' : 'image/jpeg';
      
      const imageFile = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: fileType,
      };
      formData.append('images', imageFile as any); // 백엔드가 받을 이미지 파일 배열의 키 이름 (예: 'images')
      console.log(`📄 [createGuestQuestion] Appended image to FormData: ${fileName}, Type: ${fileType}, URI: ${uri}`);
    });
  }
  console.log("🔍 [createGuestQuestion] FormData object:", formData); // FormData 내용 확인

  try {
    // 비회원 문의는 토큰이 필요 없으므로, axiosWithoutToken 또는 별도의 설정된 인스턴스 사용 필요
    // 현재 axiosWithToken만 import 되어 있으므로, axiosWithoutToken을 사용하도록 수정하거나, 해당 인스턴스를 API 파일 내에서 접근 가능하게 해야 함.
    // 여기서는 임시로 axiosWithToken을 사용하지만, 실제로는 토큰 없이 요청 가능한 axios 인스턴스를 사용해야 함을 주석으로 명시.
    // 만약 axios.ts에 axiosWithoutToken이 export 되어 있다면 그것을 사용.
    // 지금은 createQuestion과 동일하게 axiosWithToken을 사용하고, 실제로는 axiosWithoutToken으로 교체해야 함을 주석으로 명시.
    const { axiosWithoutToken } = await import("./axios/axios"); // axiosWithoutToken 동적 import
    const response = await axiosWithoutToken.post("/questions/guest", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("🚨 비회원 문의 등록 실패:", error);
    throw error;
  }
};