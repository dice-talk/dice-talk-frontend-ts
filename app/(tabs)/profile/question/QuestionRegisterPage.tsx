import { createQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import Toast from "@/components/common/Toast";
import MediumButton from "@/components/profile/myInfoPage/MediumButton";
import FileButton from "@/components/profile/question/FileButton";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

export default function QuestionRegisterPage() {
  const router = useRouter();
  const [titleValue, setTitleValue] = useState<string>("");
  const [contentValue, setContentValue] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const height = Dimensions.get("window").height;
  // ✅ 내용 변경 핸들러 (500자 제한)
  const handleContentChange = (text: string) => {
    if (text.length <= 500) {
      setContentValue(text);
      setCharCount(text.length);
    }
  };

  // ✅ 이미지 등록 핸들러
  const handleImageSelect = (images: string[]) => {
    setSelectedImages(images);
    };

  // ✅ 문의 등록 요청
  const handlePostQuestion = async () => {
    if (!titleValue.trim()) {
      setToastMessage("제목을 입력해주세요.");
      setShowToast(true);
      return;
    }

    if (!contentValue.trim()) {
      setToastMessage("내용을 입력해주세요.");
      setShowToast(true);
      return;
    }

    try {
      await createQuestion({
        memberId: 1,
        questionId: 1,
        title: titleValue,
        content: contentValue,
        images: selectedImages,
      });
      setToastMessage("문의가 등록되었습니다.");
      setShowToast(true);
      setTimeout(() => {
        router.replace({
          pathname: "/profile/QuestionPage",
        });
      }, 1000);
    } catch (error) {
      console.error("문의 등록 실패:", error);
      setToastMessage("문의 등록에 실패했습니다.");
      setShowToast(true);
    }
  };

  return (
    <View style={styles.container}>
        <GradientHeader title="QnA 등록" />
      <ScrollView style={[styles.content, { height: height * 0.9 }]}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="무엇이 궁금하신가요?"
            placeholderTextColor="#9CA3AF"
            value={titleValue}
            onChangeText={setTitleValue}
          />
          <View style={styles.underline} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>내용</Text>
          <TextInput
            style={styles.textArea}
            placeholder="자세한 내용을 적어주시면 더 정확히 답변드릴 수 있어요."
            placeholderTextColor="#9CA3AF"
            value={contentValue}
            onChangeText={handleContentChange}
            multiline={true}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{charCount}/500</Text>
        </View>

        {/* 이미지 첨부 */}
        <FileButton onImageSelect={handleImageSelect} /> {/* ✅ FileButton에서 선택된 이미지 관리 */}

        {/* 등록 버튼 */}
        <View style={styles.saveButtonContainer}>
          <MediumButton title="등록" onPress={handlePostQuestion} />
        </View>
      </ScrollView>
 
      {/* Toast 메시지 */}
      <Toast
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 10,
    marginLeft: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#82ACF1",
  },
  content: {
    padding: 20,
    marginBottom: 20,
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
  },
  underline: {
    height: 1,
    backgroundColor: "#B28EF8",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 140,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
  },
  saveButtonContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
});
