import DaoSvg from "@/assets/images/chat/dao.svg";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import DoriSvg from "@/assets/images/chat/dori.svg";

import HanaSvg from "@/assets/images/chat/hana.svg";

import NemoSvg from "@/assets/images/chat/nemo.svg";

import SezziSvg from "@/assets/images/chat/sezzi.svg";

import YukdaengSvg from "@/assets/images/chat/yukdaeng.svg";
import DiceArrowAnimation from "../animation/DiceArrowAnimation";
import DiceIconContainer from "./DiceIconContainer";

// 주사위 번호와 캐릭터 매핑
const diceCharacterMap: Record<number, React.FC<SvgProps>> = {
  1: HanaSvg,
  2: DoriSvg,
  3: SezziSvg,
  4: NemoSvg,
  5: DaoSvg,
  6: YukdaengSvg
};

interface ResultFriendArrowProps {
  leftUsers?: any[];
  rightUsers?: any[];
  selections?: { from: number; to: number }[];
  onClose?: () => void;
  onMatchPress?: () => void;  // 매칭 결과 버튼 클릭 핸들러
  themeId?: number;
}

interface Position {
  x: number;
  y: number;
}

const ResultFriendArrow: React.FC<ResultFriendArrowProps> = ({
  selections = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 1, to: 5 },
    { from: 1, to: 6 },

  ],
  onClose,
  onMatchPress,
  themeId = 1
}) => {
  // 테마별 색상 설정
  const matchButtonColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const matchButtonBorderColor = themeId === 2 ? "#9FC9FF" : "#FFD6DD";
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/event/heartBoardBase.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      {selections.map((selection, index) => (
        <DiceArrowAnimation
          key={`arrow-${index}`}
          fromId={selection.from}
          toId={selection.to}
          useHexagonLayout={true}
        />
      ))}
      
      {/* 6각형 형태로 아이콘 배치 */}
      <DiceIconContainer 
        svgComponents={[HanaSvg, DoriSvg, SezziSvg, NemoSvg, DaoSvg, YukdaengSvg]}
        svgColor="#9FC9FF"
        borderColor="#9FC9FF"
        size={45}
      />

      {/* 매칭 결과 버튼 */}
      <TouchableOpacity 
        style={[styles.matchButton, { backgroundColor: matchButtonColor, borderColor: matchButtonBorderColor }]}
        onPress={onMatchPress}
      >
        <Text style={styles.matchButtonText}>매칭 결과 보기</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResultFriendArrow;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backgroundImage: {
    width: width * 0.9,
    height: height * 0.9,
    alignSelf: "center",
    marginTop: height * 0.01,
  },
  matchButton: {
    position: 'absolute',
    bottom: height * 0.25,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    zIndex: 10,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});