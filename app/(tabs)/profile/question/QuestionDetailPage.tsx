// src/screens/profile/question/QuestionDetailPage.tsx
import { deleteQuestion, getQuestionDetail, Question, QuestionUpdateDto, updateQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import Toast from "@/components/common/Toast";
import Answer from "@/components/profile/question/Answer";
import CancelModal from "@/components/profile/question/CancelModal";
import FileButton, { ExistingImage, ImageChangePayload } from "@/components/profile/question/FileButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

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
  const { questionId: questionIdParam } = useLocalSearchParams();

  // questionIdParam이 undefined일 경우 questionId도 undefined로 설정
  // Number(undefined)는 NaN이 되므로, 초기 상태를 명확히 구분
  const questionId = useMemo(() => {
    if (questionIdParam === undefined) return undefined;
    if (Array.isArray(questionIdParam)) { 
        const firstParam = questionIdParam[0];
        return firstParam !== undefined ? Number(firstParam) : undefined;
    }
    return Number(questionIdParam);
  }, [questionIdParam]);

  const [questionDetail, setQuestionDetail] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDisplayImageUris, setCurrentDisplayImageUris] = useState<string[]>([]);
  const [newImageUrisForUpload, setNewImageUrisForUpload] = useState<string[]>([]);
  const [retainedImageIdsForDto, setRetainedImageIdsForDto] = useState<number[]>([]);
  const [isInvalidIdError, setIsInvalidIdError] = useState(false);
  const loadingTimerIdRef = useRef<number | null>(null);

  const fetchQuestionDetail = useCallback(async (options?: { showLoadingIndicatorAfterMs?: number }) => {
    console.log(`[FETCH_START] Called with options: ${JSON.stringify(options)}`);
    console.log(`[FETCH_STATE] Current isLoading: ${isLoading}, loadingTimerIdRef.current (before clearing): ${loadingTimerIdRef.current}`);

    if (loadingTimerIdRef.current !== null) {
      console.log(`[FETCH_TIMER_CLEAR_AT_START] Clearing existing timer ID from ref: ${loadingTimerIdRef.current}`);
      clearTimeout(loadingTimerIdRef.current);
      loadingTimerIdRef.current = null;
    }

    if (questionId === undefined || questionId === null || isNaN(questionId)) {
      if (questionId !== undefined) {
        console.log("[FETCH_INVALID_ID] Invalid question ID.");
        setIsInvalidIdError(true);
        setToastMessage("잘못된 접근입니다. 유효한 질문 ID가 아닙니다.");
        setShowToast(true);
      }
      console.log("[FETCH_END_INVALID_ID] Setting isLoading to false.");
      setIsLoading(false); 
      return;
    }
    console.log("[FETCH_VALID_ID] Valid question ID, proceeding.");
    setIsInvalidIdError(false);

    const showLoader = () => {
      console.log("[FETCH_SHOW_LOADER] Timer expired, setIsLoading(true).");
      setIsLoading(true);
      loadingTimerIdRef.current = null;
    };

    if (options?.showLoadingIndicatorAfterMs && options.showLoadingIndicatorAfterMs > 0) {
      console.log(`[FETCH_SET_TIMER] Setting ${options.showLoadingIndicatorAfterMs}ms loading delay timer.`);
      const timerId = setTimeout(showLoader, options.showLoadingIndicatorAfterMs);
      loadingTimerIdRef.current = timerId;
    } else {
      console.log("[FETCH_NO_DELAY] No delay, setIsLoading(true) immediately.");
      setIsLoading(true);
    }
    
    console.log(`[FETCH_API_CALL] Calling getQuestionDetail for questionId: ${questionId}`);

    try {
      const response = await getQuestionDetail(questionId);
      console.log("[FETCH_API_SUCCESS] getQuestionDetail API success.");

      if (loadingTimerIdRef.current !== null) {
        console.log(`[FETCH_TIMER_CLEAR_POST_API] API finished before timer. Clearing timer ID from ref: ${loadingTimerIdRef.current}`);
        clearTimeout(loadingTimerIdRef.current);
        loadingTimerIdRef.current = null;
      }

      if (response && typeof response === 'object') {
        console.log("[FETCH_DATA_UPDATE] Updating questionDetail state.");
        setQuestionDetail(response);
        if (!isEditMode) {
            setEditTitle(response.title || "");
            setEditContent(response.content || "");
        }
        setCurrentDisplayImageUris(response.questionImages?.map(img => img.imageUrl) || []);
        setCharCount(response.content?.length || 0);
      } else {
        console.log("[FETCH_DATA_ERROR] Response structure error.");
        setToastMessage("문의 상세 정보를 불러오는 중 오류가 발생했습니다 (응답 구조 오류).");
        setShowToast(true);
        setQuestionDetail(null);
      }
    } catch (error: any) {
      console.error("[FETCH_API_ERROR] getQuestionDetail API error:", error);
      if (loadingTimerIdRef.current !== null) { 
        console.log(`[FETCH_TIMER_CLEAR_ON_ERROR] Clearing timer ID from ref: ${loadingTimerIdRef.current} due to API error.`);
        clearTimeout(loadingTimerIdRef.current);
        loadingTimerIdRef.current = null;
      }
      const errorMessage = error.response?.data?.message || error.message || "문의 상세 정보를 불러오는데 실패했습니다.";
      setToastMessage(errorMessage);
      setShowToast(true);
      setQuestionDetail(null);
    } finally {
      console.log("[FETCH_FINALLY] Entering finally block.");
      if (loadingTimerIdRef.current !== null) { 
        console.log(`[FETCH_TIMER_CLEAR_IN_FINALLY] Clearing timer ID from ref: ${loadingTimerIdRef.current} in finally.`);
        clearTimeout(loadingTimerIdRef.current);
        loadingTimerIdRef.current = null;
      }
      console.log("[FETCH_END] Setting isLoading to false in finally.");
      setIsLoading(false);
    }
  }, [questionId, isEditMode, isLoading]);

  useEffect(() => {
    if (questionId !== undefined) {
      console.log(`📄 QuestionDetailPage mounted or questionId changed to: ${questionId}. Fetching details.`);
      fetchQuestionDetail(); 
    } else {
      console.log("❓ questionId is undefined, waiting for params...");
    }

    return () => {
      if (loadingTimerIdRef.current !== null) {
        console.log(`[EFFECT_CLEANUP] Clearing timer ID from ref: ${loadingTimerIdRef.current} due to questionId change or unmount.`);
        clearTimeout(loadingTimerIdRef.current);
        loadingTimerIdRef.current = null;
      }
    };
  }, [questionId]);

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

   const handleSaveEdit = async () => {
    console.log("handleSaveEdit 시작");
    if (!questionDetail) { // 원본 데이터가 없으면 비교 불가, 오류로 간주
        setToastMessage("수정할 원본 문의 정보가 없습니다.");
        setShowToast(true);
        return;
    }

    const originalImageIds = questionDetail.questionImages?.map(img => img.questionImageId) || [];

    const titleChanged = editTitle !== questionDetail.title;
    const contentChanged = editContent !== questionDetail.content;
    const newImagesAdded = newImageUrisForUpload.length > 0;
    // 기존 이미지가 있었는데, 유지되는 이미지 ID 목록의 길이가 원본 이미지 ID 목록의 길이와 다른 경우 (삭제된 이미지가 있음)
    // 또는, 기존 이미지가 없었는데 새로 추가된 이미지가 없는 경우도 고려해야 하지만, newImagesAdded가 이미 그 경우를 커버함.
    // 좀 더 정확하게는, 원본 ID 목록과 유지 ID 목록의 내용(순서 무관)이 다른지를 봐야 하지만, 길이 비교로 간소화.
    // 더 정확한 비교: originalImageIds.length !== retainedImageIdsForDto.length || !originalImageIds.every(id => retainedImageIdsForDto.includes(id))
    const existingImagesChanged = originalImageIds.length !== retainedImageIdsForDto.length || 
                                  !originalImageIds.every(id => retainedImageIdsForDto.includes(id)) || 
                                  !retainedImageIdsForDto.every(id => originalImageIds.includes(id));


    if (!titleChanged && !contentChanged && !newImagesAdded && !existingImagesChanged) {
      setToastMessage("수정된 내용이 없습니다.");
      setShowToast(true);
      return;
    }

    if (!editTitle?.trim() || !editContent?.trim()) { 
      setToastMessage("제목과 내용을 입력해주세요.");
      setShowToast(true);
      return;
    }

    // questionId 타입 가드 추가
    if (questionId === undefined || isNaN(questionId)) {
        setToastMessage("유효하지 않은 질문 ID입니다. 수정을 진행할 수 없습니다.");
        setShowToast(true);
        return;
    }

    setIsLoading(true); 
    try {
      console.log("try 블록 진입, updateQuestion 호출 전");
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
        newImageUris: newImageUrisForUpload,
      });
      console.log("updateQuestion 성공, setShowToast(true) 호출 전");

      // setToastMessage("문의가 수정되었습니다."); // 토스트 메시지 설정 부분 주석 처리
      // setShowToast(true); // 토스트 표시 부분 주석 처리
      // console.log("setShowToast(true) 및 setToastMessage 호출 완료");

      // fetchQuestionDetail 및 setIsEditMode를 약간 지연시켜 Toast가 먼저 보이도록 함
      setTimeout(async () => { // async 추가
        try {
          console.log("setTimeout 내부: fetchQuestionDetail 호출 전");
          await fetchQuestionDetail({ showLoadingIndicatorAfterMs: 300 }); // await 추가
          console.log("setTimeout 내부: fetchQuestionDetail 호출 완료, setIsEditMode(false) 호출 전");
          setIsEditMode(false); // fetchQuestionDetail 완료 후 수정 모드 해제
          console.log("setTimeout 내부: setIsEditMode(false) 호출 완료");
        } catch (error) {
            console.error("setTimeout 내부 fetchQuestionDetail 또는 setIsEditMode 에러:", error);
            // 에러 발생 시에도 수정 모드는 해제하는 것이 좋을 수 있음 (선택 사항)
            setIsEditMode(false);
        }
      }, 100); 

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
    // questionId 타입 가드 추가
    if (questionId === undefined || isNaN(questionId)) {
      setToastMessage("유효하지 않은 질문 ID입니다. 삭제를 진행할 수 없습니다.");
      setShowToast(true);
      setModalVisible(false); // 모달 닫기
      return;
    }
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
  
  // 렌더링 로직: 모든 Hooks 호출 이후에 조건부 UI 반환
  if (questionId === undefined) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <GradientHeader title="QnA 상세보기" />
        <ActivityIndicator size="large" color="#B28EF8" />
        <Text style={styles.loadingText}>질문 ID를 불러오는 중...</Text>
      </View>
    );
  }

  if (isInvalidIdError) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <GradientHeader title="QnA 상세보기" />
        <Text style={styles.errorText}>{toastMessage || "잘못된 접근입니다."}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#B28EF8" />
        <Text style={styles.loadingText}>문의 내용을 불러오는 중입니다...</Text>
      </View>
    );
  }

  if (!questionDetail && !isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <GradientHeader title="QnA 상세보기" />
        <Text style={styles.errorText}>{toastMessage || "문의 내용을 표시할 수 없습니다."}</Text>
      </View>
    );
  }
  
  if (questionDetail) {
      console.log("✅ Rendering: Displaying question details", JSON.stringify(questionDetail, null, 2));
  }

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
              questionDetail?.questionImages && questionDetail.questionImages.length > 0 ? (
                <FlatList
                  data={questionDetail.questionImages}
                  renderItem={({ item }) => (
                    <View style={styles.flatListImageWrapper}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.flatListImagePreview}
                        resizeMode="cover" // 또는 "contain" 등 선호하는 모드로 변경
                      />
                    </View>
                  )}
                  keyExtractor={(item) => item.questionImageId.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={styles.imageSeparator} />}
                  contentContainerStyle={styles.flatListContainer} // FlatList 내용 컨테이너 스타일
                />
              ) : (
                <Text style={styles.noImageText}>첨부된 이미지가 없습니다.</Text>
              )
            )}
        </View>
        <View style={styles.gradientBorder}/>
        {/* 답변 완료 상태는 questionDetail.answer 유무로 판단하거나, questionStatus 활용 */}
        {questionDetail?.questionStatus !== "QUESTION_ANSWERED" && questionDetail?.answer === null ? (
            <View style={styles.saveButtonContainer}>
            {isEditMode ? (
                <>
                <QuestionButton title="확인" onPress={handleSaveEdit} />
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
      <CancelModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onDelete={handleDeleteConfirm}
        message="정말로 이 문의를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
      />
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
  flatListContainer: { // FlatList의 contentContainerStyle
    paddingVertical: 8, // 위아래 약간의 패딩
  },
  flatListImageWrapper: {
    width: 100, // 이미지 너비
    height: 100, // 이미지 높이
    borderRadius: 8,
    overflow: "hidden", // borderRadius를 적용하기 위해 필요
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  flatListImagePreview: {
    width: "100%",
    height: "100%",
  },
  imageSeparator: { // 이미지 사이 간격 스타일
    width: 10,
  },
});
