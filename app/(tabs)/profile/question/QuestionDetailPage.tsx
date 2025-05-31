// src/screens/profile/question/QuestionDetailPage.tsx
import Toast from "@/components/common/Toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
//import CancelModal from "@/components/common/CancelModal";
import { deleteQuestion, getQuestionDetail, Question, QuestionUpdateDto, updateQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import Answer from "@/components/profile/question/Answer";
import FileButton, { ExistingImage, ImageChangePayload } from "@/components/profile/question/FileButton";

import QuestionButton from "@/components/profile/question/QuestionButton";
import { Dimensions } from "react-native";

// QuestionDetail 타입을 API 응답에 맞게 Question 인터페이스로 대체
// export type QuestionDetail = Question; // Question 인터페이스를 직접 사용

// 날짜 포맷팅 함수
const formatDateToYYYYMMDD = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.error("날짜 형식 변환 오류 (formatDateToYYYYMMDD):", e);
        // 원본 문자열에서 날짜 부분만이라도 추출 시도 (T 이전 부분)
        return dateString.split('T')[0] || ""; 
    }
};

export default function QuestionDetailPage() {
  const router = useRouter();
  const { questionId: questionIdParam } = useLocalSearchParams(); // 파라미터 이름 변경 (string | string[]일 수 있음)
  const questionId = Number(questionIdParam); // 숫자로 변환

  const [questionDetail, setQuestionDetail] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 추가
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(""); // 초기값 비우기
  const [editContent, setEditContent] = useState(""); // 초기값 비우기
  const [charCount, setCharCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // const [selectedImages, setSelectedImages] = useState<string[]>([]); // FileButton 변경으로 이 상태는 직접 사용 안 함
  const [modalVisible, setModalVisible] = useState(false);

  // FileButton으로부터 받을 이미지 관련 상태
  const [currentDisplayImageUris, setCurrentDisplayImageUris] = useState<string[]>([]);
  const [newImageUrisForUpload, setNewImageUrisForUpload] = useState<string[]>([]);
  const [retainedImageIdsForDto, setRetainedImageIdsForDto] = useState<number[]>([]);

  useEffect(() => {
    if (!questionId || isNaN(questionId)) { // isNaN 체크 추가
        console.error("🚨 Invalid questionId:", questionIdParam);
        setToastMessage("잘못된 접근입니다. 유효한 질문 ID가 아닙니다.");
        setShowToast(true);
        setIsLoading(false);
        return;
    }
    console.log(`📄 QuestionDetailPage mounted, fetching details for questionId: ${questionId}`);
    fetchQuestionDetail();
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    console.log(`🚀 fetchQuestionDetail called for questionId: ${questionId}`);
    setIsLoading(true);
    try {
      const response = await getQuestionDetail(questionId);
      console.log("✅ API Response (getQuestionDetail):", JSON.stringify(response, null, 2)); // 응답 전체를 자세히 로그
      
      if (response && typeof response === 'object') { // 응답이 유효한 객체인지 확인
        setQuestionDetail(response);
        setEditTitle(response.title || ""); // title이 없을 경우 대비
        setEditContent(response.content || ""); // content가 없을 경우 대비
        // 수정 모드 진입 시 FileButton 초기화를 위해 현재 표시될 이미지 URI 설정
        setCurrentDisplayImageUris(response.questionImages?.map(img => img.imageUrl) || []);
        setCharCount(response.content?.length || 0);
        console.log("👍 State updated with question details.");
      } else {
        console.error("🚨 Invalid API response structure:", response);
        setToastMessage("문의 상세 정보를 불러오는 중 오류가 발생했습니다 (응답 구조 오류).");
        setShowToast(true);
        setQuestionDetail(null); // 데이터가 유효하지 않으므로 null 처리
      }
    } catch (error: any) {
      console.error("🚨 문의 상세 조회 실패 (catch block):", JSON.stringify(error, null, 2));
      // Axios 에러인 경우 error.response.data를 확인할 수 있음
      const errorMessage = error.response?.data?.message || error.message || "문의 상세 정보를 불러오는데 실패했습니다.";
      setToastMessage(errorMessage);
      setShowToast(true);
      setQuestionDetail(null); // 에러 발생 시 null 처리
    } finally {
      setIsLoading(false);
      console.log("🏁 fetchQuestionDetail finished. isLoading:", false);
    }
  };

  const handleEdit = () => {
    if (!questionDetail) return;
    setEditTitle(questionDetail.title);
    setEditContent(questionDetail.content);
    // FileButton 초기화를 위해, questionDetail에서 ExistingImage[] 형식으로 변환
    const initialImagesForFileButton: ExistingImage[] = questionDetail.questionImages?.map(img => ({
      id: img.questionImageId,
      url: img.imageUrl,
    })) || [];
    // handleImagesChange 콜백을 통해 FileButton이 내부 상태를 설정하고 그 결과를 전달할 것임.
    // 따라서 여기서는 FileButton에 initialExistingImages만 전달하면 됨.
    // setCurrentDisplayImageUris, setNewImageUrisForUpload, setRetainedImageIdsForDto는
    // handleImagesChange 콜백에서 FileButton이 주는 정보로 업데이트될 것.
    // 명시적으로 초기화한다면:
    setCurrentDisplayImageUris(initialImagesForFileButton.map(img => img.url));
    setNewImageUrisForUpload([]);
    setRetainedImageIdsForDto(initialImagesForFileButton.map(img => img.id));

    setCharCount(questionDetail.content?.length || 0);
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (questionDetail) {
        setEditTitle(questionDetail.title);
        setEditContent(questionDetail.content);
        // 수정 취소 시, FileButton에 전달될 초기 이미지도 원래대로 복원
        const initialImages = questionDetail.questionImages?.map(img => img.imageUrl) || [];
        setCurrentDisplayImageUris(initialImages);
        // 업로드/유지할 ID 목록도 초기화
        setNewImageUrisForUpload([]);
        setRetainedImageIdsForDto(questionDetail.questionImages?.map(img => img.questionImageId) || []);
        setCharCount(questionDetail.content?.length || 0);
    }
  };

  // FileButton의 onImagesChange 콜백 함수
  const handleImagesChange = useCallback((payload: ImageChangePayload) => {
    console.log("📸 [QuestionDetailPage] FileButton onImagesChange payload:", payload);
    setCurrentDisplayImageUris(payload.currentDisplayUris);
    setNewImageUrisForUpload(payload.newlyAddedUris);
    setRetainedImageIdsForDto(payload.retainedImageIds);
  }, []);

   const handleSaveEdit = async () => {
    if (!editTitle?.trim() || !editContent?.trim()) { 
      setToastMessage("제목과 내용을 입력해주세요.");
      setShowToast(true);
      return;
    }

    if (!questionDetail) {
        setToastMessage("수정할 문의 정보가 없습니다.");
        setShowToast(true);
        return;
    }

    setIsLoading(true); 
    try {
      const dto: QuestionUpdateDto = {
        title: editTitle,
        content: editContent,
        memberId: questionDetail.memberId, 
        questionStatus: questionDetail.questionStatus, 
        keepImageIds: retainedImageIdsForDto, // FileButton에서 관리된 유지할 ID 목록
      };

      await updateQuestion({
        questionId: questionId,
        dto: dto,
        newImageUris: newImageUrisForUpload, // FileButton에서 관리된 새로 추가된 URI 목록
      });

      setShowToast(true);
      setToastMessage("문의가 수정되었습니다.");
      setIsEditMode(false);
      fetchQuestionDetail(); 
    } catch (error: any) {
      console.error("🚨 문의 수정 실패 (handleSaveEdit):", error);
      const errorMessage = error.response?.data?.errorMessage || error.message || "문의 수정에 실패했습니다.";
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setIsLoading(false); 
    }
   };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!questionId) return;
    try {
      await deleteQuestion(questionId); 
      setToastMessage("문의가 삭제되었습니다.");
      setShowToast(true);
      setModalVisible(false);
      router.replace("/profile/QuestionPage"); 
    } catch (error) {
      setToastMessage("문의 삭제에 실패했습니다.");
      setShowToast(true);
    }
  };

  // const handleImageSelect = (images: string[]) => { // 이전 로직, FileButton 변경으로 사용 안 함
  //   setSelectedImages(images);
  // };
  
  if (isLoading) {
    console.log("🔄 Rendering: Loading state");
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#B28EF8" />
        <Text style={styles.loadingText}>문의 내용을 불러오는 중입니다...</Text>
      </View>
    );
  }

  if (!questionDetail && !isLoading) {
    console.log("🚫 Rendering: No question detail and not loading");
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <GradientHeader title="QnA 상세보기" />
        {/* 토스트 메시지가 이미 표시될 것이므로, 여기서는 간단한 메시지만 표시하거나 아무것도 표시 안 함 */}
        <Text style={styles.errorText}>문의 내용을 표시할 수 없습니다.</Text>
      </View>
    );
  }
  
  if (questionDetail) {
      console.log("✅ Rendering: Displaying question details", JSON.stringify(questionDetail, null, 2));
  }

  // FileButton에 전달할 initialExistingImages 가공 (수정 모드일 때만)
  const initialImagesForFileButton = useMemo<ExistingImage[]>(() => {
    console.log("📝 Recalculating initialImagesForFileButton, isEditMode:", isEditMode, "questionDetail exists:", !!questionDetail);
    if (isEditMode && questionDetail && questionDetail.questionImages) {
      return questionDetail.questionImages.map(img => ({
        id: img.questionImageId,
        url: img.imageUrl,
      }));
    }
    return []; // 기본값은 빈 배열
  }, [isEditMode, questionDetail?.questionImages]); // 의존성 배열을 questionDetail.questionImages로 더 명확히 함

  return (
    <View style={styles.container}>
      <GradientHeader title="QnA 상세보기" />
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>제목</Text>
          {isEditMode ? (
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.input}>{questionDetail?.title}</Text>
          )}
          {/* createdAt 날짜 포맷팅 적용 */}
          <Text style={styles.createAt}>{formatDateToYYYYMMDD(questionDetail?.createdAt)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>내용</Text>
          {isEditMode ? (
            <>
            <TextInput
              style={styles.textArea}
              value={editContent}
              onChangeText={(text) => {
                setEditContent(text);
                setCharCount(text.length);
              }}
              multiline={true}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{charCount}/500</Text>
            </>
          ) : (
            <View style={styles.contentContainer}>
                <Text style={styles.text}>{questionDetail?.content}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionLabel}>첨부 이미지</Text>
            {isEditMode ? (
              <FileButton 
                onImagesChange={handleImagesChange} 
                initialExistingImages={initialImagesForFileButton}
                maxImages={5} // 최대 이미지 개수 설정
              />
            ) : (
            <View style={styles.imagePreviewContainer}>
                {questionDetail?.questionImages && questionDetail.questionImages.length > 0 ? (
                questionDetail.questionImages.map((imageObj, index) => (
                    <View key={index} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: imageObj.imageUrl }} 
                        style={styles.imagePreview}
                        resizeMode="contain"
                    />
                    </View>
                ))
                ) : (
                <Text style={styles.noImageText}>첨부된 이미지가 없습니다.</Text>
                )}
            </View>
            )}
        </View>
        <View style={styles.gradientBorder}/>
        {/* 답변 완료 상태는 questionDetail.answer 유무로 판단하거나, questionStatus 활용 */}
        {questionDetail?.questionStatus !== "QUESTION_ANSWERED" && questionDetail?.answer === null ? (
            <View style={styles.saveButtonContainer}>
            {isEditMode ? (
                <>
                <QuestionButton title="수정" onPress={handleSaveEdit} />
                <QuestionButton title="취소" onPress={handleCancelEdit} />
                </>
            ) : (
                <>
                <QuestionButton title="수정" onPress={handleEdit} />
                <QuestionButton title="삭제" onPress={handleDelete} />
                </>
            )}
            </View>
        ) : (
            // questionDetail.answer가 null이 아니거나, questionStatus가 QUESTION_ANSWERED인 경우
            questionDetail?.answer && (
                <Answer 
                    answer={{
                        content: questionDetail.answer.content,
                        // Answer 컴포넌트에서도 createdAt 날짜 포맷팅 적용
                        createdAt: formatDateToYYYYMMDD(questionDetail.answer.createdAt),
                        // API 명세에 따르면 answer.answerImages는 AnswerImage[] 타입
                        images: questionDetail.answer.answerImages?.map(img => img.imageUrl) || [] 
                    }}
                />
            )
        )}
      </ScrollView>
      {/* Toast 메시지 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
      {/* 삭제 확인 모달 */}
      {/* <CancelModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onDelete={handleDeleteConfirm}
      /> */}
    </View>
  );
}

const { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: { // 로딩 컨테이너 스타일 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { // 로딩 텍스트 스타일 추가
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: "#6B7280",
  },
  errorText: { // 에러 텍스트 스타일 추가
    textAlign: 'center',
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: "red",
    marginTop: 20,
  },
  content: {
    padding: 20,
  },
  scrollContent: {
    paddingBottom: height * 0.15, // Footer와의 간격 유지
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: "#4B5563",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    fontSize: 16,
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#B28EF8",
    paddingBottom: 10,
    marginTop: 10,
  },
  createAt: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 140,
    textAlignVertical: "top",
    fontSize: 14, // 내용 폰트 크기 통일
    color: "#4B5563", // 내용 폰트 색상 통일
    lineHeight: 20, // 내용 줄 간격 통일
  },
  text: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  charCount: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  contentContainer: {
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 140,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  noImageText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  gradientBorder: {
    width: "100%",
    borderWidth: 0.3,
    borderColor: "#B28EF8",
  },
  saveButtonContainer: {
    marginTop: 16,
    marginBottom: 10,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 30,
  },
});
