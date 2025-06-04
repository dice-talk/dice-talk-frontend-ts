import DaoSvg from "@/assets/images/dice/dao.svg";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import DoriSvg from "@/assets/images/dice/dori.svg";

import HanaSvg from "@/assets/images/dice/hana.svg";

import NemoSvg from "@/assets/images/dice/nemo.svg";

import SezziSvg from "@/assets/images/dice/sezzi.svg";

import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import DiceArrowAnimation from "../animation/DiceArrowAnimation";
import DiceIconContainer from "./DiceIconContainer";
import { getPickEventsForRoom } from "@/api/EventApi"; // API 호출 함수 임포트
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 임포트

// 주사위 번호와 캐릭터 매핑
const diceCharacterMap: Record<number, React.FC<SvgProps>> = {
  1: HanaSvg,
  2: DoriSvg,
  3: SezziSvg,
  4: NemoSvg,
  5: DaoSvg,
  6: YukdaengSvg
};

// FetchedSelection 인터페이스 (ResultLoveArrow.tsx 참고)
interface FetchedSelection {
  fromId: number;
  toId: number;
  fromNickname?: string;
  toNickname?: string;
}

interface ResultFriendArrowProps {
  // selections prop은 내부적으로 데이터를 가져오므로 제거
  onClose?: () => void;
  onMatchPress?: () => void;  // 매칭 결과 버튼 클릭 핸들러
  themeId?: number;
}

const ResultFriendArrow: React.FC<ResultFriendArrowProps> = ({
  onClose,
  onMatchPress,
  themeId = 2 // ResultFriendArrow는 themeId 2를 기본값으로 가정
}) => {
  const [fetchedSelections, setFetchedSelections] = useState<FetchedSelection[]>([]);
  const chatParts = useChatRoomStore((state) => state.chatParts);

  useEffect(() => {
    const fetchSelectionsAndNicknames = async () => {
      try {
        const events = await getPickEventsForRoom(); // API 호출
        const mappedSelections: FetchedSelection[] = events.map(event => {
          const sender = chatParts.find((p: ChatParticipant) => p.memberId === event.senderId);
          const receiver = chatParts.find((p: ChatParticipant) => p.memberId === event.receiverId);
          return {
            fromId: event.senderId,
            toId: event.receiverId,
            fromNickname: sender?.nickname,
            toNickname: receiver?.nickname
          };
        });
        setFetchedSelections(mappedSelections);
      } catch (error) {
        console.error("🔥 selections 불러오기 실패 (ResultFriendArrow):", error);
        setFetchedSelections([]); // 오류 발생 시 빈 배열로 설정
      }
    };
    if (chatParts && chatParts.length > 0) {
      fetchSelectionsAndNicknames();
    } else {
      setFetchedSelections([]);
    }
  }, [chatParts]);

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

      {fetchedSelections.map((selection, index) => {
        // fromNickname과 toNickname이 모두 유효한 경우에만 렌더링
        if (selection.fromNickname && selection.toNickname) {
          return (
            <DiceArrowAnimation
              key={`arrow-${index}-${selection.fromId}-${selection.toId}`}
              fromNickname={selection.fromNickname}
              toNickname={selection.toNickname}
              useHexagonLayout={themeId === 2} // themeId에 따라 육각형 레이아웃 사용 결정
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