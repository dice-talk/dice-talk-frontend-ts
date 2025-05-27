import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  onClose: () => void;
  themeId?: number;
}

const ReportModal: React.FC<ReportModalProps> = ({ visible, onClose, themeId = 1 }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleConfirm = () => {
    // 선택된 항목 처리 로직
    onClose();
  };

  // 확인 버튼 활성화 여부
  const isConfirmEnabled = selectedReasons.length > 0;
  
  // 테마에 따른 색상 설정
  const confirmButtonColor = themeId === 2 ? "#6DA0E1" : "#EF5A52";
  const titleColor = themeId === 2 ? "#5C5279" : "#000000";
  const subtitleColor = themeId === 2 ? "#5C5279" : "#000000";

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
                {selectedReasons.includes(reason) ? (
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
            style={[
              styles.confirmButton, 
              !isConfirmEnabled && styles.disabledButton
            ]} 
            onPress={handleConfirm}
            disabled={!isConfirmEnabled}
          >
            <Text style={[
              styles.confirmText,
              !isConfirmEnabled && styles.disabledText
            ]}>확인</Text>
          </Pressable>
          <Pressable 
            style={[
              styles.confirmButton, 
              !isConfirmEnabled && styles.disabledButton
            ]} 
            onPress={handleConfirm}
            disabled={!isConfirmEnabled}
          >
            <Text style={[
              styles.confirmText,
              !isConfirmEnabled && styles.disabledText
              ]}>취소</Text>
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
  confirmButton: {
    marginTop: 16,
    backgroundColor: "#EF5A52",
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#999999",
  },
});