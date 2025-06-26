// src/screens/QuestionListScreen.tsx
import { Question as ApiQuestion, getQuestions } from "@/api/questionApi";
import useAuthStore from "@/zustand/stores/authStore";
import { useEffect } from "react";
import { StyleSheet } from "react-native";

// src/types/Question.ts
export type Question = {
    memberId: number;
    title: string;
    content: string;
    createAt: string;
    questionStatus: "QUESTION_REGISTERED" | "QUESTION_ANSWERED";
    questionImage: string | null;
    questionId: number;
};

// QuestionList에서 사용할 아이템 타입 (API 응답을 기반으로 정의)
export type QuestionListItemType = {
    questionId: number;
    title: string;
    createdAt: string; 
    questionStatus: "QUESTION_REGISTERED" | "QUESTION_ANSWERED";
    // API 응답의 questionImages를 사용한다면, 혹은 단일 imageUrl 필드가 있다면 그에 맞게 수정
    // displayImageUrl?: string | null; 
};

interface QuestionListProps {
  currentPage: number; 
  onTotalPagesChanged: (totalPages: number) => void; // 총 페이지 수를 부모로 전달하는 콜백
  onLoadingStateChanged: (isLoading: boolean) => void; // 로딩 상태 변경 콜백
  onQuestionsLoaded: (questions: QuestionListItemType[]) => void; // 로드된 질문 목록을 부모로 전달
}

export default function QuestionList({ 
  currentPage, 
  onTotalPagesChanged, 
  onLoadingStateChanged,
  onQuestionsLoaded
}: QuestionListProps) {
  // const memberId = useAuthStore((state) => state.memberId); // memberId 직접 사용 안 함
  const accessToken = useAuthStore((state) => state.accessToken); // 토큰 존재 여부로 인증 상태 확인 (token -> accessToken)

  useEffect(() => {
    // if (memberId) { // memberId 대신 token 존재 여부 확인
    if (accessToken) { // token -> accessToken
      fetchQuestions(currentPage);
    }
  // }, [memberId, currentPage]);
  }, [accessToken, currentPage]); // 의존성 배열에 accessToken 추가 (token -> accessToken)

  const fetchQuestions = async (page: number) => {
    // if (!memberId) return; // memberId 대신 token 존재 여부 확인
    if (!accessToken) { // token -> accessToken
      onLoadingStateChanged(false); // 로딩 중 아님을 알림
      onQuestionsLoaded([]); // 빈 목록 전달
      onTotalPagesChanged(0); // 페이지 정보 초기화
      return;
    }
    onLoadingStateChanged(true);
    try {
      // const response = await getQuestions(page - 1); // 이전: 0-indexed로 변환하여 전달
      const response = await getQuestions(page); // 수정: API가 1-based page를 기대한다고 가정하고 그대로 전달
      
      const items: QuestionListItemType[] = (response.questions || []).map((q: ApiQuestion) => ({
        questionId: q.questionId,
        title: q.title,
        createdAt: q.createdAt, 
        questionStatus: q.questionStatus as "QUESTION_REGISTERED" | "QUESTION_ANSWERED",
      }));
      onQuestionsLoaded(items);
      // API 응답의 currentPage가 0-based인지 1-based인지 확인 필요.
      // 만약 API 응답의 pageInfo.page가 0-based라면, QuestionPage의 setCurrentPage에는 page + 1을 전달해야 할 수 있음.
      // 현재는 API 응답의 pageInfo.page를 totalPages와 함께 그대로 사용한다고 가정.
      onTotalPagesChanged(response.totalPages || 0);
    } catch (error) {
      console.error("🚨 QuestionList: 나의 질문 목록 조회 실패:", error);
      onQuestionsLoaded([]);
      onTotalPagesChanged(0);
    } finally {
      onLoadingStateChanged(false);
    }
  };
  
  // 렌더링 로직은 QuestionPage로 이동 (QuestionList는 데이터 페칭 및 부모로 전달 역할)
  return null; 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
  },
  latestRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  latestIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  latestText: {
    fontSize: 12,
    color: "rgba(0,0,0,0.6)",
    fontFamily: "Pretendard-Bold",
  },
  questionContainer: {},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: "Pretendard-Medium",
  },
});
