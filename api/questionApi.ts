import { axiosWithToken } from "./axios/axios";

type Question = {
    memberId: number;
    questionId: number;
    title: string;
    content: string;
    images: string[];
}

// 회원가입 
export const createQuestion = async (question: Question) => {
    try{
        const response = await axiosWithToken.post("/questions", question);
        return response.data;
    } catch (error) {
        console.error("🚨 회원 정보 생성 실패:", error);
        throw error;
    }
};

export const updateQuestion = async (questionId: number, question: Question) => {
    try{
        const response = await axiosWithToken.patch(`/questions/${questionId}`, question);
        return response.data;
    } catch (error) {
        console.error("🚨 질문 수정 실패:", error);
        throw error;
    }
}

// ✅ 질문 전체 조회 API
export const getQuestions = async (memberId: number, page: number = 1, size: number = 4) => {
    try {
      const response = await axiosWithToken.get(
        `/questions/${memberId}?size=${size}&page=${page}`
      );
      return response.data;
    } catch (error) {
      console.error("🚨 질문 전체 조회 실패:", error);
      throw error;
    }
  };

  // ✅ 질문 상세 조회 API
export const getQuestionDetail = async (memberId: number, questionId: number) => {
    try {
      const response = await axiosWithToken.get(`/questions/${memberId}/${questionId}`);
      return response.data;
    } catch (error) {
      console.error("🚨 질문 상세 조회 실패:", error);
      throw error;
    }
  };

  export const deleteQuestion = async (memberId: number, questionId: number) => {
    try {
        const response = await axiosWithToken.delete(`/questions/${memberId}/${questionId}`);
        return response.data;
    } catch (error) {
        console.error("🚨 질문 삭제 실패:", error);
        throw error;
    }
  }