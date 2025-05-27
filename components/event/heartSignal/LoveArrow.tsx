// 컬러 SVG import
import DaoSvg from "@/assets/images/chat/dao.svg";
import DoriSvg from "@/assets/images/chat/dori.svg";
import HanaSvg from "@/assets/images/chat/hana.svg";
import NemoSvg from "@/assets/images/chat/nemo.svg";
import SezziSvg from "@/assets/images/chat/sezzi.svg";
import YukdaengSvg from "@/assets/images/chat/yukdaeng.svg";
import CountPlusSvg from "@/assets/images/event/countPlus.svg";
import FriendLetterForm from "@/assets/images/event/friend_letterForm.svg";
import LetterForm from "@/assets/images/event/LetterForm.svg";
import ToastMessage from "@/components/common/ToastMessage";
import React, { useState } from "react";
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

interface LoveArrowProps {
  visible: boolean;
  onClose: () => void;
  gender?: "MALE" | "FEMALE";
  remainingCount: number;
  themeId?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CharacterInfo {
  name: string;
  ColoredSvgComponent: React.FC<SvgProps>;
}

const LoveArrow: React.FC<LoveArrowProps> = ({ visible, onClose, gender = "MALE", remainingCount, themeId = 1 }) => {
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleIncrement = () => {
    // TODO: 필요 시 기능 구현
  };

  // themeId와 gender에 따른 색상 설정
  const selectedColor = themeId === 2 
    ? "#9FC9FF" 
    : (gender === "MALE" ? "#F9BCC1" : "#9FC9FF");
  const unselectedColor = "#FFFFFF";
  
  // 테마별 UI 색상 설정
  const titleColor = themeId === 2 ? "#9FC9FF" : "#F9BCC1";
  const confirmButtonColor = themeId === 2 ? "#9FC9FF" : "#FEBFC8";
  const confirmButtonBorderColor = themeId === 2 ? "#9FC9FF" : "#FFD9DF";

  const characters: CharacterInfo[] = gender === "MALE" 
    ? [
        { name: "두 얼굴의 매력 두리", ColoredSvgComponent: DoriSvg },
        { name: "네모지만 부드러운 네몽", ColoredSvgComponent: NemoSvg },
        { name: "육감적인 직감파 육댕", ColoredSvgComponent: YukdaengSvg },
      ] 
    : [
        { name: "한가로운 하나", ColoredSvgComponent: HanaSvg },
        { name: "세침한 세찌", ColoredSvgComponent: SezziSvg },
        { name: "단호한데 다정한 다오", ColoredSvgComponent: DaoSvg },
      ];

  const handleSelectCharacter = (index: number) => {
    setSelectedCharacterIndex(index === selectedCharacterIndex ? null : index);
  };

  const handleConfirm = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1500);
  };
  const width = SCREEN_WIDTH * 0.95;
  const height = SCREEN_WIDTH * 0.95;
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Image 
          source={require('@/assets/images/event/heartBoardBase.png')} 
          resizeMode="contain"
          style={styles.heartboardImage}
        />
                  <Text style={[styles.title, { color: titleColor }]}>좀 더 대화하고 싶은 상대를 선택해주세요</Text>
          {themeId === 2 ? (
            <FriendLetterForm width={width * 0.55} height={height * 0.25} style={{position: 'absolute', top: SCREEN_HEIGHT * 0.37, zIndex: 3}} />
          ) : (
            <LetterForm width={width * 0.55} height={height * 0.25} style={{position: 'absolute', top: SCREEN_HEIGHT * 0.37, zIndex: 3}} />
          )}
        <View style={styles.charactersWrapper}>
          <View style={styles.charactersContainer}>
            {characters.map((character, index) => {
              const isSelected = selectedCharacterIndex === index;
              const SvgComponent = character.ColoredSvgComponent;
              const svgColor = isSelected ? selectedColor : unselectedColor;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.characterItem}
                  onPress={() => handleSelectCharacter(index)}
                >
                  <SvgComponent 
                    width={35} 
                    height={35} 
                    style={styles.characterIcon} 
                    color={svgColor}
                  />
                  <Text style={styles.characterName}>{character.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.remainingCountRow}>
            <Text style={styles.remainingCount}>남은 수정 횟수: {remainingCount}</Text>
            <TouchableOpacity onPress={handleIncrement} style={{transform: [{ translateY: 2 }]}}>
              <CountPlusSvg width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: confirmButtonColor, borderColor: confirmButtonBorderColor },
            selectedCharacterIndex === null && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={selectedCharacterIndex === null}
        >
          <Text style={styles.confirmButtonText}>확인</Text>
        </TouchableOpacity>
        <ToastMessage message="선택이 완료되었습니다" visible={showToast} themeId={themeId} />
      </View>
    </Modal>
  );
};

export default LoveArrow;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "relative",
  },
  title: {
    fontSize: 12,
    fontWeight: "light",
    textAlign: "center",
    zIndex: 2,
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.435,
  },
  heartboardImage: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_WIDTH * 0.95,
    marginBottom: -20,
  },
  charactersWrapper: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.46,
    zIndex: 3,
    alignItems: 'center',
    width: '100%',
  },
  charactersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.85,
  },
  characterItem: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 15,
    width: SCREEN_WIDTH * 0.25,
  },
  characterIcon: {
    marginTop: 5,
    marginBottom: 3,
  },
  characterName: {
    marginTop: 5,
    fontSize: 10,
    color: "white",
    textAlign: "center",
    maxWidth: 80,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 30,
    borderWidth: 2,
    zIndex: 3,
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.25,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  remainingCount: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
  },
  remainingCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 8,
    gap: 8,
  },
  toastContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 10,
  },
  toastText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
});