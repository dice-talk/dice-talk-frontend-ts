import { getReportReasons, ReportReasonDto } from "@/api/reportApi";
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReportModalProps {
  visible: boolean;
  onSubmitReport: (reasonCode: string[]) => void; // 신고 사유를 전달하며 실제 신고 처리 요청
  onDismiss: () => void; // 모달을 단순히 닫는 경우
}

const ReportModal: React.FC<ReportModalProps> = ({ visible, onSubmitReport, onDismiss }) => {
  const [reasons, setReasons] = useState<ReportReasonDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReasonCode, setSelectedReasonCode] = useState<string | null>(null);
  const curThemeId = useHomeStore((state) => state.curThemeId);

  useEffect(() => {
    if (visible) {
      setSelectedReasonCode(null);
      setIsLoading(true);

      const fetchReasons = async () => {
        try {
          const fetchedReasons = await getReportReasons();
          setReasons(fetchedReasons);
        } catch (error) {
          console.error("Failed to load report reasons", error);
          onDismiss(); // 에러 시 모달 닫기
        } finally {
          setIsLoading(false);
        }
      };

      fetchReasons();
    }
  }, [visible, onDismiss]);

  const toggleReason = (reasonCode: string) => {
    setSelectedReasonCode(prev => (prev === reasonCode ? null : reasonCode));
  };

  const handleConfirm = () => {
    onSubmitReport(selectedReasonCode ? [selectedReasonCode] : []);
  };

  const handleCancel = () => {
    onDismiss();
  };

  // 확인 버튼 활성화 여부
  const isConfirmEnabled = selectedReasonCode !== null;
  
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
            {isLoading ? (
              <ActivityIndicator color={confirmButtonColor} style={{ paddingVertical: 20 }} />
            ) : (
              reasons.map((reason) => (
                <Pressable
                  key={reason.code}
                  style={styles.reasonBox}
                  onPress={() => toggleReason(reason.code)}
                >
                  {selectedReasonCode === reason.code ? (
                    <Ionicons name="checkmark-circle" size={SCREEN_WIDTH * 0.06} color="#EF5A52" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={SCREEN_WIDTH * 0.06} color="#CCCCCC" />
                  )}
                  <Text style={styles.reasonText}>{reason.description}</Text>
                </Pressable>
              ))
            )}
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
    borderColor: "#E6543B",
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
    marginVertical: 8,
    width: "100%",
  },
  reasonText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingTop: 10,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
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
    fontSize: 16,
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