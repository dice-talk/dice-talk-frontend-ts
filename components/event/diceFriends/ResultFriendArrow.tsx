import DaoSvg from "@/assets/images/dice/dao.svg";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import DoriSvg from "@/assets/images/dice/dori.svg";

import HanaSvg from "@/assets/images/dice/hana.svg";

import NemoSvg from "@/assets/images/dice/nemo.svg";

import SezziSvg from "@/assets/images/dice/sezzi.svg";

import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import DiceArrowAnimation from "../animation/DiceArrowAnimation";
import FriendsDiceIconContainer from "./FriendsDiceIconContainer"; // <-- 이 부분이 올바른 임포트입니다.
import { getPickEventsForRoom } from "@/api/EventApi"; // API 호출 함수 임포트
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 임포트

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
}

const ResultFriendArrow: React.FC<ResultFriendArrowProps> = ({
  onClose, // onClose prop 추가
  onMatchPress,
}) => {
  const [fetchedSelections, setFetchedSelections] = useState<FetchedSelection[]>([]);
  const chatParts = useChatRoomStore((state) => state.chatParts);
  const curThemeId = useHomeStore((state) => state.curThemeId);

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

  // 매칭 결과 버튼 클릭 핸들러 (모달 닫기 포함)
  const handleButtonPress = () => {
    if (onMatchPress) {
      onMatchPress();
    }
    if (onClose) { // 모달 닫기 콜백 호출
      onClose();
    }
  };
  // 테마별 색상 설정
  // const matchButtonColor = curThemeId === 2 ? "#9FC9FF" : "#FFB6C1";
  // const matchButtonBorderColor = curThemeId === 2 ? "#9FC9FF" : "#FFD6DD";
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/event/heartBoardBase.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      />

      {/* 6각형 형태로 아이콘 배치 */}
      <FriendsDiceIconContainer
        svgComponents={[HanaSvg, DoriSvg, SezziSvg, NemoSvg, DaoSvg, YukdaengSvg]}
        size={40}
      />

      {fetchedSelections.map((selection, index) => {
        // fromNickname과 toNickname이 모두 유효한 경우에만 렌더링
        if (selection.fromNickname && selection.toNickname) {
          return (
            <DiceArrowAnimation
              key={`arrow-${index}-${selection.fromId}-${selection.toId}`}
              fromNickname={selection.fromNickname}
              toNickname={selection.toNickname}
            />
          );
        }
        return null; // 닉네임이 유효하지 않으면 렌더링하지 않음
      })}

      {/* 매칭 결과 버튼 */}
      <TouchableOpacity 
        style={[styles.matchButton, { backgroundColor: '#9FC9FF', borderColor: '#9FC9FF' }]}
        onPress={handleButtonPress} // 수정된 핸들러 사용
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