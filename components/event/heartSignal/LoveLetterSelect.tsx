import { useState, useMemo, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import SelectableOption from "./SelectableOption";

// SVG 파일 import
import DaoSvg from '@/assets/images/dice/dao.svg';
import DoriSvg from '@/assets/images/dice/dori.svg'; // 두리 SVG 추가
import HanaSvg from '@/assets/images/dice/hana.svg';
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from '@/assets/images/dice/sezzi.svg';
import YukdaengSvg from '@/assets/images/dice/yukdaeng.svg';

// 조건에 따라 표시될 여성 캐릭터 옵션
const FEMALE_TARGET_OPTIONS = [
  { label: "한가로운 하나", svgComponent: HanaSvg },
  { label: "세침한 세찌", svgComponent: SezziSvg },
  { label: "단호한데 다정한 다오", svgComponent: DaoSvg },
];

// 조건에 따라 표시될 남성 캐릭터 옵션
const MALE_TARGET_OPTIONS = [
  { label: "두 얼굴의 매력 두리", svgComponent: DoriSvg },
  { label: "네모지만 부드러운 네몽", svgComponent: NemoSvg },
  { label: "육감적인 직감파 육댕", svgComponent: YukdaengSvg },
];

// 남성 캐릭터 옵션을 보여줄 트리거가 되는 닉네임 목록
const TRIGGER_NICKNAMES = ["한가로운 하나", "세침한 세찌", "단호한데 다정한 다오"];

interface LoveLetterSelectProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedIndex: number) => void;
  themeId?: number;
  nickname?: string; // 현재 사용자의 닉네임 또는 상대방의 닉네임
}

const LoveLetterSelect: React.FC<LoveLetterSelectProps> = ({
  visible,
  onClose,
  onConfirm,
  themeId = 1,
  nickname,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const optionsToDisplay = useMemo(() => {
    if (nickname && TRIGGER_NICKNAMES.includes(nickname)) {
      return MALE_TARGET_OPTIONS;
    }
    return FEMALE_TARGET_OPTIONS;
  }, [nickname]);


  // 테마별 색상 설정
  const containerBorderColor = themeId === 2 ? "#9FC9FF" : "#FAD4DC";
  const dividerColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = themeId === 2 ? "#9FC9FF" : "#FEBFC8";
  const confirmButtonBorderColor = themeId === 2 ? "#6DA0E1" : "#FFD9DF";

  // 요청에 따라 nickname이 TRIGGER_NICKNAMES에 포함되는지 여부로 SVG 색상 결정
  const shouldUseSpecialNicknameColor = nickname && TRIGGER_NICKNAMES.includes(nickname);
  const svgColor = shouldUseSpecialNicknameColor ? "#9FC9FF" : "#F9BCC1";
  const selectedSvgColor = shouldUseSpecialNicknameColor ? "#9FC9FF" : "#F9BCC1";
  const textColor = themeId === 2 ? "#879FC0" : "#A45C73";
  const radioColor = themeId === 2 ? "#879FC0" : "#D6A0B1";
  const checkmarkColor = themeId === 2 ? "#879FC0" : "#E04C65";

  useEffect(() => {
    // 옵션 목록이 변경되면 선택 상태 초기화
    setSelectedIndex(null);
  }, [optionsToDisplay]);

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

      {optionsToDisplay.map((option, index) => (
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