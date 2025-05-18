// src/screens/profile/question/QuestionDetailPage.tsx
import Toast from "@/components/common/Toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
//import CancelModal from "@/components/common/CancelModal";
import { deleteQuestion, getQuestionDetail, updateQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import MediumButton from "@/components/profile/myInfoPage/MediumButton";
import FileButton from "@/components/profile/question/FileButton";

type QuestionDetail = {
  title: string;
  content: string;
  createAt: string;
  questionAnswerStatus: string;
  questionImage?: string[];
  answer?: string;
};

export default function QuestionDetailPage() {
  const router = useRouter();
  const { questionId } = useLocalSearchParams();
  const [questionDetail, setQuestionDetail] = useState<QuestionDetail | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!questionId) return;
    fetchQuestionDetail();
  }, [questionId]);

  const fetchQuestionDetail = async () => {
    try {
      const response = await getQuestionDetail(1, Number(questionId));
      setQuestionDetail(response.data);
      setEditTitle(response.data.title);
      setEditContent(response.data.content);
      setSelectedImages(response.data.questionImage || []);
    } catch (error) {
      console.error("🚨 문의 상세 조회 실패:", error);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setToastMessage("제목과 내용을 입력해주세요.");
      setShowToast(true);
      return;
    }

    try {
      await updateQuestion(Number(questionId), {
        memberId: 1,
        questionId: Number(questionId),
        title: editTitle,
        content: editContent,
        images: selectedImages,
      });
      setShowToast(true);
      setToastMessage("문의가 수정되었습니다.");
      setIsEditMode(false);
      fetchQuestionDetail();
    } catch (error) {
      setToastMessage("문의 수정에 실패했습니다.");
      setShowToast(true);
    }
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
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>제목</Text>
          {isEditMode ? (
            <TextInput
              style={styles.input}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="제목을 입력해주세요."
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.input}>{questionDetail?.title}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>내용</Text>
          {isEditMode ? (
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
          ) : (
            <Text style={styles.text}>{questionDetail?.content}</Text>
          )}
          <Text style={styles.charCount}>{charCount}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>첨부 이미지</Text>
          <FileButton onImageSelect={handleImageSelect} />
        </View>

        <View style={styles.saveButtonContainer}>
          {isEditMode ? (
            <MediumButton title="저장" onPress={handleSaveEdit} />
          ) : (
            <>
              <MediumButton title="수정" onPress={handleEdit} />
              <MediumButton title="삭제" onPress={handleDelete} />
            </>
          )}
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontFamily: "Pretendard-Medium",
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
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
  saveButtonContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
