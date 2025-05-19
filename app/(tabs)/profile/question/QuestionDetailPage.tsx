// src/screens/profile/question/QuestionDetailPage.tsx
import Toast from "@/components/common/Toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
//import CancelModal from "@/components/common/CancelModal";
import { deleteQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import Answer from "@/components/profile/question/Answer";
import FileButton from "@/components/profile/question/FileButton";
import QuestionButton from "@/components/profile/question/QuestionButton";

type QuestionDetail = {
  questionId: number;
  title: string;
  content: string;
  createAt: string;
  questionStatus: string;
  questionImage?: string[];
  answer?: {
    content: string;
    createAt: string;
    images: string[] | null;
  } | null;
};

export default function QuestionDetailPage() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams();
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>({
    questionId: 4, title: "하트 받고싶어요.", createAt: "2025-01-22", content: "하트 받고싶어요.", questionStatus: "QUESTION_ANSWERED", questionImage: ["@/assets/images/home/diceFriends.png"],
        answer: {
            content: "다른분들과 이야기를 더 나눠보세요",
            createAt: "2025-05-13",
            images: ["@/assets/images/home/diceFriends.png"]
        }
        //questionId: 4, title: "하트 받고싶어요.", createAt: "2025-01-22", content: "하트 받고싶어요.", questionStatus: "QUESTION_REGISTERED", questionImage: ["@/assets/images/home/diceFriends.png"],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(questionDetail?.title);
  const [editContent, setEditContent] = useState(questionDetail?.content);
  const [charCount, setCharCount] = useState(questionDetail?.content?.length || 0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);



//   useEffect(() => {
//     if (!questionId) return;
//     fetchQuestionDetail();
//   }, [questionId]);

//   const fetchQuestionDetail = async () => {
//     try {
//       const response = await getQuestionDetail(1, Number(questionId));
//       setQuestionDetail(response.data);
//       setEditTitle(response.data.title);
//       setEditContent(response.data.content);
//       setSelectedImages(response.data.questionImage || []);
//     } catch (error) {
//       console.error("🚨 문의 상세 조회 실패:", error);
//     }
//   };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

   const handleSaveEdit = async () => {
    console.log("editTitle", editTitle);
    // if (!editTitle.trim() || !editContent.trim()) {
    //   setToastMessage("제목과 내용을 입력해주세요.");
    //   setShowToast(true);
    //   return;
    // }

//     try {
//       await updateQuestion(Number(questionId), {
//         memberId: 1,
//         questionId: Number(questionId),
//         title: editTitle,
//         content: editContent,
//         images: selectedImages,
//       });
//       setShowToast(true);
//       setToastMessage("문의가 수정되었습니다.");
//       setIsEditMode(false);
//       fetchQuestionDetail();
//     } catch (error) {
//       setToastMessage("문의 수정에 실패했습니다.");
//       setShowToast(true);
//     }
   };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteQuestion(1, Number(questionId));
      setToastMessage("문의가 삭제되었습니다.");
      setShowToast(true);
      setModalVisible(false);
      router.replace("/profile/QuestionPage");
    } catch (error) {
      setToastMessage("문의 삭제에 실패했습니다.");
      setShowToast(true);
    }
  };

  const handleImageSelect = (images: string[]) => {
    setSelectedImages(images);
  };

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
        <Text style={styles.createAt}>{questionDetail?.createAt}</Text>
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
            <FileButton onImageSelect={handleImageSelect} />
            ) : (
            <View style={styles.imagePreviewContainer}>
                {questionDetail?.questionImage?.length ? (
                questionDetail.questionImage.map((imageUri, index) => (
                    <View key={index} style={styles.imageWrapper}>
                    <Image
                        source={{ uri: imageUri }}
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
        {questionDetail?.questionStatus !== "QUESTION_ANSWERED" ? (
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
            <Answer answer={questionDetail?.answer} />
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
    borderWidth: 0.3, // ✅ 0.3px Border 적용
    borderColor: "#B28EF8",
    //borderRadius: 0.5,
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
