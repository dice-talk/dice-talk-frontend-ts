import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import SelectableOption from "./SelectableOption";

// SVG 파일 import
import DaoSvg from '@/assets/images/dice/dao.svg';
import HanaSvg from '@/assets/images/dice/hana.svg';
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from '@/assets/images/dice/sezzi.svg';
import YukdaengSvg from '@/assets/images/dice/yukdaeng.svg';

// SVG 컴포넌트를 사용하는 OPTIONS 배열
const OPTIONS = [
  { label: "한가로운 하나", svgComponent: HanaSvg },
  { label: "세침한 세찌", svgComponent: SezziSvg },
  { label: "네모지만 부드러운 네몽", svgComponent: NemoSvg },
  { label: "단호한데 다정한 다오", svgComponent: DaoSvg },
  { label: "육감적인 직감파 육댕", svgComponent: YukdaengSvg },
];

interface LoveLetterSelectProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIndex: number) => void;
  themeId?: number;
}

const LoveLetterSelect: React.FC<LoveLetterSelectProps> = ({
  visible,
  onClose,
  onConfirm,
  themeId = 1,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 테마별 색상 설정
  const containerBorderColor = themeId === 2 ? "#9FC9FF" : "#FAD4DC";
  const dividerColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = themeId === 2 ? "#9FC9FF" : "#FEBFC8";
  const confirmButtonBorderColor = themeId === 2 ? "#6DA0E1" : "#FFD9DF";
  const svgColor = "#FFFFFF"; // 기본 흰색
  const selectedSvgColor = "#F9BCC1"; // 선택 시 색상
  const textColor = themeId === 2 ? "#879FC0" : "#A45C73";
  const radioColor = themeId === 2 ? "#879FC0" : "#D6A0B1";
  const checkmarkColor = themeId === 2 ? "#879FC0" : "#E04C65";

  // 선택 토글 처리 함수
  const handleToggleSelection = (index: number) => {
    // 이미 선택된 항목을 다시 클릭하면 선택 취소
    if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      // 다른 항목을 선택하면 해당 항목으로 선택 변경
      setSelectedIndex(index);
    }
  };

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      onConfirm(selectedIndex);
    } else {
      // 아무것도 선택하지 않았다면 모달창만 닫기
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
    <View style={[styles.container, { borderColor: containerBorderColor }]}>
      <Text style={styles.title}>당신의 비밀 메세지를 받을{'\n'}사람을 선택해주세요</Text>
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {OPTIONS.map((option, index) => (
        <SelectableOption
          key={index}
          label={option.label}
              svgComponent={option.svgComponent}
          selected={selectedIndex === index}
              onPress={() => handleToggleSelection(index)}
          svgColor={svgColor}
          selectedSvgColor={selectedSvgColor}
          textColor={textColor}
          radioColor={radioColor}
          checkmarkColor={checkmarkColor}
        />
      ))}
        </View>
      <View style={styles.confirmButtonWrapper}>
          <Pressable style={[styles.confirmButton, { backgroundColor: confirmButtonColor, borderColor: confirmButtonBorderColor }]} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default LoveLetterSelect;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  container: {
    width: '90%',
    padding: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 5,
    borderColor: "#FAD4DC",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F9BCC1",
    marginBottom: 20,
  },
  confirmButtonWrapper: {
    marginTop: 16,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  confirmButton: {
    backgroundColor: '#FEBFC8',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD9DF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});