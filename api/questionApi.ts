import { axiosWithToken } from "./axios/axios";

export interface QuestionImage {
  questionImageId: number;
  questionId: number;
  imageUrl: string;
}

type QuestionData = {
    memberId: number;
    questionId: number;
    title: string;
    content: string;
    questionImages?: QuestionImage[];
}

export interface AnswerImage {
  answerImageId: number;
  answerId: number;
  imageUrl: string;
}

type Answer = {
    answerId: number;
    content: string;
    memberId: number;
    createdAt: string;
    modifiedAt?: string;
    answerImages?: AnswerImage[];
}

export interface Question extends QuestionData {
  questionId: number;
  memberId: number;
  createdAt: string;
  modifiedAt?: string;
  questionStatus?: "QUESTION_REGISTERED" | "QUESTION_ANSWERED" | "QUESTION_DELETED" | "QUESTION_DEACTIVED";
  answer?: Answer;
  questionImages?: QuestionImage[];
}

// 회원가입 
export const createQuestion = async (questionData: QuestionData) => {
    try{
        const response = await axiosWithToken.post("/questions", questionData);
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error);
        throw error;
    }
};

export const updateQuestion = async (questionId: number, questionData: Partial<QuestionData>) => {
    try{
        const response = await axiosWithToken.patch(`/questions/${questionId}`, questionData);
        return response.data;
    } catch (error) {
        console.error("🚨 질문 수정 실패:", error);
        throw error;
    }
}

// ✅ 질문 전체 조회 API
export const getQuestions = async (memberId: number, page: number = 0, size: number = 10) => {
    try {
      const response = await axiosWithToken.get<{
        data: Question[],
        totalElements: number,
        totalPages: number,
        number: number,
        size: number
    }>(
        `/questions/${memberId}?size=${size}&page=${page}`
      );
      return {
        questions: response.data.data,
        totalElements: response.data.totalElements,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        size: response.data.size
    }
    } catch (error) {
      console.error("🚨 질문 전체 조회 실패:", error);
      throw error;
    }
  };

  // ✅ 질문 상세 조회 API
export const getQuestionDetail = async (memberId: number, questionId: number) => {
    try {
      const response = await axiosWithToken.get<Question>(`/questions/${memberId}/${questionId}`);
      return response.data;
    } catch (error) {
      console.error("🚨 질문 상세 조회 실패:", error);
      throw error;
    }
  };

  export const deleteQuestion = async (memberId: number, questionId: number): Promise<void> => {
    try {
        await axiosWithToken.delete(`/questions/${memberId}/${questionId}`);
    } catch (error) {
        console.error("🚨 질문 삭제 실패:", error);
        throw error;
    }
  }