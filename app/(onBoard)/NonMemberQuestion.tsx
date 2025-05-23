import { createQuestion } from "@/api/questionApi";
import GradientHeader from "@/components/common/GradientHeader";
import Toast from "@/components/common/Toast";
import QuestionSuccessModal from "@/components/login/QuestionSuccessModal";
import MediumButton from "@/components/profile/myInfoPage/MediumButton";
import FileButton from "@/components/profile/question/FileButton";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QuestionRegisterPage() {
  const router = useRouter();
  const [titleValue, setTitleValue] = useState<string>("");
  const [emailValue, setEmailValue] = useState<string>("");
  const [contentValue, setContentValue] = useState<string>("");
  const [charCount, setCharCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const height = Dimensions.get("window").height;

  const handleContentChange = (text: string) => {
    if (text.length <= 500) {
      setContentValue(text);
      setCharCount(text.length);
    }
  };

  const handleImageSelect = (images: string[]) => {
    setSelectedImages(images);
  };

  const handlePostQuestion = async () => {
    if (!emailValue.trim()) {
      setToastMessage("이메일을 입력해주세요.");
      setShowToast(true);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      setToastMessage("올바른 이메일 형식을 입력해주세요.");
      setShowToast(true);
      return;
    }
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
        email: emailValue,
        title: titleValue,
        content: contentValue,
        images: selectedImages,
      } as any);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("문의 등록 실패:", error);
      setToastMessage("문의 등록에 실패했습니다.");
      //setShowSuccessModal(true);
      setShowToast(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <GradientHeader title="문의하기" />
      <ScrollView style={[styles.content, { height: height * 0.8 }]} keyboardShouldPersistTaps="handled">
        <Text style={styles.questionText}>문의 내용은 가능한 자세히 작성해주세요</Text>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>이메일</Text>
          <TextInput
            style={styles.input}
            placeholder="본인의 이메일 계정을 입력해주세요."
            placeholderTextColor="#9CA3AF"
            value={emailValue}
            onChangeText={setEmailValue}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.underline} />
        </View>
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

        <FileButton onImageSelect={handleImageSelect} />

        <View style={styles.saveButtonContainer}>
          <MediumButton title="등록" onPress={handlePostQuestion} />
        </View>
      </ScrollView>
 
      <Toast
        visible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
      <QuestionSuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.replace({ pathname: '/(onBoard)' });
        }}
        onGoHome={() => {
          setShowSuccessModal(false);
          router.replace({ pathname: '/(onBoard)' });
        }}
      />
    </SafeAreaView>
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
  },
  questionText: {
    fontSize: 12,
    fontFamily: "Pretendard-Medium",
    color: "#9CA3AF",
    marginBottom: 24,
    marginTop: 10,
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
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  underline: {
    height: 1,
    backgroundColor: "#B28EF8",
    marginTop: Platform.OS === 'ios' ? 4 : 0,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    height: 140,
    textAlignVertical: "top",
    fontSize: 16,
    color: "#1F2937",
  },
  charCount: {
    fontSize: 12,
    color: "#666666",
    textAlign: "right",
    marginTop: 4,
  },
  saveButtonContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});
