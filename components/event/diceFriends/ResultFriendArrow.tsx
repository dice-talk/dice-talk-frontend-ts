import DaoSvg from "@/assets/images/dice/dao.svg";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import DoriSvg from "@/assets/images/dice/dori.svg";

import HanaSvg from "@/assets/images/dice/hana.svg";

import NemoSvg from "@/assets/images/dice/nemo.svg";

import SezziSvg from "@/assets/images/dice/sezzi.svg";

import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
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

// 닉네임과 ID를 매핑하는 객체 (DiceArrowAnimation의 nicknameToIdMap과 일치하거나, 여기서 ID를 닉네임으로 변환하기 위함)
const idToNicknameMap: Record<number, string> = {
  1: "한가로운 하나",
  2: "두 얼굴의 매력 두리",
  3: "세침한 세찌",
  4: "네모지만 부드러운 네몽",
  5: "단호한데 다정한 다오",
  6: "육감적인 직감파 육땡",
};

interface ResultFriendArrowProps {
  selections?: { fromNickname: string; toNickname: string }[]; // ID 대신 닉네임을 받도록 수정
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
    // 예시: selections prop이 닉네임 기반으로 전달된다고 가정
    { fromNickname: "한가로운 하나", toNickname: "두 얼굴의 매력 두리" },
    { fromNickname: "한가로운 하나", toNickname: "세침한 세찌" },
    // ... 나머지 기본값들도 닉네임으로 변경 필요
    // 또는, selections prop이 ID 기반으로 온다면 내부에서 변환 로직 필요
  ], // selections의 기본값도 닉네임 기반으로 변경하거나, 사용하는 곳에서 닉네임으로 전달해야 함
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

      {selections.map((selection, index) => {
        // fromNickname과 toNickname이 모두 유효한 경우에만 렌더링
        if (selection.fromNickname && selection.toNickname) {
          return (
            <DiceArrowAnimation
              key={`arrow-${index}-${selection.fromNickname}-${selection.toNickname}`}
              fromNickname={selection.fromNickname}
              toNickname={selection.toNickname}
              useHexagonLayout={true} // 6각형 레이아웃 사용 명시
            />
          );
        }
        return null; // 닉네임이 유효하지 않으면 렌더링하지 않음
      })}
      {/* 6각형 형태로 아이콘 배치 */}
      <DiceIconContainer 
        svgComponents={[HanaSvg, DoriSvg, SezziSvg, NemoSvg, DaoSvg, YukdaengSvg]}
        svgColor="#9FC9FF"
        borderColor="#9FC9FF"
        size={40}
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