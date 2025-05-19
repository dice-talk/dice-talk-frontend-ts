// src/screens/QuestionListScreen.tsx
import QuestionItem from "@/components/profile/question/QuestionItem";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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


export default function QuestionList() {
  //const [questions, setQuestions] = useState<Question[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const questions = [
    { questionId: 1, title: "욕설 신고합니다.",  createAt: "2025-03-16", questionStatus: "QUESTION_REGISTERED" },
    { questionId: 2, title: "네모지만 부드러운 네몽님이..", createAt: "2025-02-13", questionStatus: "QUESTION_REGISTERED" },
    { questionId: 3, title: "이게 맞는건가요?", createAt: "2025-02-03", questionStatus: "QUESTION_ANSWERED", answeId: 1, cotnet: "맞습니다~"},
    { questionId: 4, title: "하트 받고싶어요.", createAt: "2025-01-22", questionStatus: "QUESTION_ANSWERED", answeId: 1, cotnet: "다른분들과 이야기를 더 나눠보세요"},
  ];

  // useEffect(() => {
  //   fetchQuestions();
  // }, [currentPage]);

  // const fetchQuestions = async () => {
  //   try {
  //     const memberId = 1; // ✅ 실제로는 로그인된 사용자의 ID로 변경 필요
  //     const data = await getQuestions(memberId, currentPage);
  //     setQuestions(data.data);
  //     setTotalPages(data.pageinfo.totalPages);
  //   } catch (error) {
  //     console.error("🚨 질문 전체 조회 실패:", error);
  //   }
  // };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <View style={styles.latestRow}>
        <Image source={require('@/assets/images/profile/ic-latest.png')} style={styles.latestIcon} />
        <Text style={styles.latestText}>최신순</Text>
      </View>
      <View style={styles.questionContainer}>
        {questions.map((question, index) => (
          <QuestionItem
            key={index}
            title={question.title}
            createAt={question.createAt}
            answered={question.questionStatus === "QUESTION_ANSWERED"}
            questionId={question.questionId}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#FFFFFF",
    //paddingHorizontal: 16,
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
  questionContainer: {
   // paddingBottom: 24,
  },
});
