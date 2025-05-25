import DaoSvg from "@/assets/images/chat/dao.svg";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";

import DoriSvg from "@/assets/images/chat/dori.svg";

import HanaSvg from "@/assets/images/chat/hana.svg";

import NemoSvg from "@/assets/images/chat/nemo.svg";

import SezziSvg from "@/assets/images/chat/sezzi.svg";

import YukdaengSvg from "@/assets/images/chat/yukdaeng.svg";
import DiceArrowAnimation from "./DiceArrowAnimation";
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

interface ResultLoveArrowProps {
  leftUsers?: any[];
  rightUsers?: any[];
  selections?: { from: number; to: number }[];
}

interface Position {
  x: number;
  y: number;
}

const ResultLoveArrow: React.FC<ResultLoveArrowProps> = ({

  selections = [
    { from: 1, to: 2 }, // 왼쪽 Hana → 오른쪽 Nemo (파란색)
    { from: 1, to: 4 }, // 오른쪽 Dao → 왼쪽 Sezzi (빨간색)
    { from: 1, to: 6 }  // 왼쪽 Dori → 오른쪽 Yukdaeng (파란색)
  ]
}) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/event/heartBoardBase.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      
      {/* 모든 화살표 애니메이션을 동시에 표시 */}
      {selections.map((selection, index) => (
        <DiceArrowAnimation
          key={`arrow-${index}`}
          fromId={selection.from}
          toId={selection.to}
          // 색상은 화살표 방향에 따라 자동 결정됨
        />
      ))}
      
      <DiceIconContainer position="right">
        <View style={styles.diceContainer}><DoriSvg width={25} height={25} /></View>
        <View style={styles.diceContainer}><NemoSvg width={25} height={25} /></View>
        <View style={styles.diceContainer}><YukdaengSvg width={25} height={25} /></View>
      </DiceIconContainer>
      <DiceIconContainer position="left">
        <View style={styles.diceContainer}><HanaSvg width={25} height={25} /></View>
        <View style={styles.diceContainer}><SezziSvg width={25} height={25} /></View>
        <View style={styles.diceContainer}><DaoSvg width={25} height={25} /></View>
      </DiceIconContainer>
    </View>
  );
};

export default ResultLoveArrow;

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  leftColumn: {
    position: "absolute",
    left: width * 0.1,
    top: height * 0.2,
    height: height * 0.6,
    justifyContent: "space-around",
    zIndex: 10,
  },
  rightColumn: {
    position: "absolute",
    right: width * 0.1,
    top: height * 0.2,
    height: height * 0.6,
    justifyContent: "space-around",
    zIndex: 10,
  },
  iconWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  diceContainer: {
    width: 45,
    height: 45,
    backgroundColor: "white",
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
  },
  backgroundImage: {
    width: width * 0.9,
    height: height * 0.9,
    alignSelf: "center",
    marginTop: height * 0.01,
  },
});