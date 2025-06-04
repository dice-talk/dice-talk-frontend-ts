import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const reportReasons = [
  "스팸 · 유사투자자문 등",
  "음란 · 성적 행위",
  "아동 · 청소년 대상 성범죄",
  "욕설 · 폭력 · 혐오",
  "불법 상품 · 서비스",
  "개인정보 무단 수집 · 유포",
  "비정상적인 서비스 이용",
  "자살 · 자해",
  "사기 · 사칭",
  "명예훼손 · 저작권 등 권리침해",
];

interface ReportModalProps {
  visible: boolean;
  onSubmitReport: (reasons: string[]) => void; // 신고 사유를 전달하며 실제 신고 처리 요청
  onDismiss: () => void; // 모달을 단순히 닫는 경우
}

const ReportModal: React.FC<ReportModalProps> = ({ visible, onSubmitReport, onDismiss }) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null); // 단일 선택으로 변경
  const curThemeId = useHomeStore((state) => state.curThemeId);

  useEffect(() => {
    // 모달이 화면에 표시될 때 (visible 프롭이 true가 될 때)
    // 이전에 선택했던 사유들을 초기화합니다.
    if (visible) {
      setSelectedReason(null); // 단일 선택 초기화
    }
  }, [visible]);

  const toggleReason = (reason: string) => {
    // 이미 선택된 사유를 다시 클릭하면 선택 해제, 아니면 새로운 사유로 변경
    setSelectedReason(prevSelectedReason =>
      prevSelectedReason === reason ? null : reason
    ); 
  };

  const handleConfirm = () => {
    // 선택된 항목(selectedReason)으로 실제 신고 처리 로직 호출 (배열로 전달)
    onSubmitReport(selectedReason ? [selectedReason] : []);
  };

  const handleCancel = () => {
    onDismiss();
  };

  // 확인 버튼 활성화 여부
  const isConfirmEnabled = selectedReason !== null; // 단일 선택 여부로 변경
  
  // 테마에 따른 색상 설정
  const confirmButtonColor = curThemeId === 2 ? "#6DA0E1" : "#EF5A52";
  const titleColor = curThemeId === 2 ? "#5C5279" : "#000000";
  const subtitleColor = curThemeId === 2 ? "#5C5279" : "#000000";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={[styles.title, { color: titleColor }]}>신고하기</Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>신고 사유를 선택해주세요</Text>
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              신고 접수 시 신고자의 정보(휴대전화번호, 이메일)는 신고이력 관리,
              부정이용 탐지 목적으로 이용되며, 신고 시점으로부터 1년간 보관 후 파기합니다.
            </Text>
          </View>
          <ScrollView contentContainerStyle={styles.reasonList}>
            {reportReasons.map((reason, idx) => (
              <Pressable
                key={idx}
                style={styles.reasonBox}
                onPress={() => toggleReason(reason)}
              >
                {selectedReason === reason ? ( // 단일 선택 비교로 변경
                  <Ionicons name="checkmark-circle" size={SCREEN_WIDTH * 0.06} color="#EF5A52" />
                ) : (
                  <Ionicons name="ellipse-outline" size={SCREEN_WIDTH * 0.06} color="#EF5A52" />
                )}
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel} // onClose 직접 호출 또는 별도 핸들러
          >
            <Text style={[
              styles.buttonText,
              styles.cancelButtonText
            ]}>취소</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton, !isConfirmEnabled && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={!isConfirmEnabled}
          >
            <Text style={[styles.buttonText, styles.confirmButtonText, !isConfirmEnabled && styles.disabledText]}>확인</Text>
          </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    borderWidth: 1,
    borderColor: "red",
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  noticeBox: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 12,
    color: "#666",
  },
  reasonList: {
    paddingVertical: 10,
    width: "100%",
  },
  reasonBox: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  reasonText: {
    fontSize: 15,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    gap: 10,
  },
  button: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0", // 취소 버튼은 항상 활성화된 스타일
  },
  confirmButton: {
    backgroundColor: "#EF5A52", // 확인 버튼 기본 색상
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  buttonText: {
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#333333", // 취소 버튼 텍스트 색상
  },
  confirmButtonText: {
    color: "white",
  },
  disabledText: {
    color: "#999999",
  },
});