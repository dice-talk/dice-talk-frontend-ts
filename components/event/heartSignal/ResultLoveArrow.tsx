import React from "react";
import { useEffect, useState } from "react";
import { getPickEventsForRoom } from "@/api/EventApi";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import HanaSvg from "@/assets/images/dice/hana.svg";
import NemoSvg from "@/assets/images/dice/nemo.svg";
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import DiceArrowAnimation from "../animation/DiceArrowAnimation";
import DiceIconContainer from "./DiceIconContainer";
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore";

// 주사위 번호와 캐릭터 매핑
const diceCharacterMap: Record<number, React.FC<SvgProps>> = {
  1: HanaSvg,
  2: DoriSvg,
  3: SezziSvg,
  4: NemoSvg,
  5: DaoSvg,
  6: YukdaengSvg
};

interface FetchedSelection {
  fromId: number;
  toId: number;
  fromNickname?: string;
  toNickname?: string;
}

interface ResultLoveArrowProps {
  leftUserIds?: number[]; // 왼쪽 사용자/캐릭터 ID 배열
  rightUserIds?: number[]; // 오른쪽 사용자/캐릭터 ID 배열
  // selections prop은 내부적으로 데이터를 가져오므로 주석 처리하거나 제거할 수 있습니다.
  // selections?: { from: number; to: number }[];
  // onClose prop이 현재 컴포넌트 로직에서 사용되지 않는다면 주석 처리하거나 제거할 수 있습니다.
  // onClose?: () => void;
  onMatchPress?: () => void;  // 매칭 결과 버튼 클릭 핸들러
}

const ResultLoveArrow: React.FC<ResultLoveArrowProps> = ({
  leftUserIds = [1, 3, 5], // 기본값: 하나, 세찌, 다오
  rightUserIds = [2, 4, 6], // 기본값: 두리, 네몽, 육땡
  // selections, // prop을 사용하지 않는다면 제거
  // onClose,    // prop을 사용하지 않는다면 제거
  onMatchPress
}) => {
  const [fetchedSelections, setFetchedSelections] = useState<FetchedSelection[]>([]);
  const chatParts = useChatRoomStore((state) => state.chatParts);

  useEffect(() => {
    const fetchSelectionsAndNicknames = async () => {
      try {
        const events = await getPickEventsForRoom();
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
        console.error("🔥 selections 불러오기 실패:", error);
        setFetchedSelections([]); // 오류 발생 시 빈 배열로 설정
      }
    };
    if (chatParts && chatParts.length > 0) {
      fetchSelectionsAndNicknames();
    } else {
      // chatParts가 없거나 비어있을 경우 fetchedSelections를 초기화합니다.
      setFetchedSelections([]);
    }
  }, [chatParts]); // chatParts가 변경될 때마다 useEffect를 다시 실행합니다.

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/event/heartBoardBase.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      {fetchedSelections.map((selection, index) => {
        // fromNickname과 toNickname이 모두 존재할 때만 DiceArrowAnimation을 렌더링합니다.
        if (selection.fromNickname && selection.toNickname) {
          return (
            <DiceArrowAnimation
              key={`arrow-${index}-${selection.fromId}-${selection.toId}`} // 더 고유한 key 사용
              fromNickname={selection.fromNickname}
              toNickname={selection.toNickname}
            />
          );
        }
        return null; // 닉네임이 없으면 렌더링하지 않음
      })}

      <DiceIconContainer position="right">
        {rightUserIds.map((id) => {
          const SvgComponent = diceCharacterMap[id];
          return SvgComponent ? (
            <View style={styles.diceContainer} key={`right-${id}`}>
              <SvgComponent width={25} height={25} />
            </View>
          ) : null;
        })}
      </DiceIconContainer>
      <DiceIconContainer position="left">
        {leftUserIds.map((id) => {
          const SvgComponent = diceCharacterMap[id];
          return SvgComponent ? (
            <View style={styles.diceContainer} key={`left-${id}`}>
              <SvgComponent width={25} height={25} />
            </View>
          ) : null;
        })}
      </DiceIconContainer>

      {/* 매칭 결과 버튼 */}
      <TouchableOpacity 
        style={styles.matchButton}
        onPress={onMatchPress}
      >
        <Text style={styles.matchButtonText}>매칭 결과 보기</Text>
      </TouchableOpacity>
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
  matchButton: {
    position: 'absolute',
    bottom: height * 0.25,
    alignSelf: 'center',
    backgroundColor: '#FFB6C1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FFD6DD',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  matchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});