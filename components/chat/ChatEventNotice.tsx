import CountdownTimer from "@/components/common/CountdownTimer";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { SvgProps } from "react-native-svg";
import {
  SECRET_MESSAGE_START_OFFSET, SECRET_MESSAGE_END_OFFSET,
  CUPID_INTERIM_END_OFFSET, CUPID_MAIN_EVENT_END_OFFSET,
  CHAT_ROOM_END_OFFSET
} from "@/constants/chatEventTimes"; // 시간 상수 임포트
import useHomeStore from "@/zustand/stores/HomeStore";
interface ChatEventNoticeProps {
  icon?: React.FC<SvgProps>;
  backgroundColor?: string;
  createdAt: string | null; // 스토어에서 ISO 문자열 또는 유사한 형식으로 예상
}

const ChatEventNotice = ({
  icon: Icon,
  backgroundColor,
  createdAt,
}: ChatEventNoticeProps) => {
  const [currentTitle, setCurrentTitle] = useState("이벤트 정보 로딩 중...");
  const [currentNoticeText, setCurrentNoticeText] = useState("잠시만 기다려주세요...");
  const [remainingSecondsForDisplay, setRemainingSecondsForDisplay] = useState(0);
  const [eventPhase, setEventPhase] = useState("LOADING"); // LOADING, PRE_SECRET, SECRET, CUPID_INTERIM, PRE_CUPID_MAIN, CUPID_MAIN, COUNTDOWN_TO_END, POST_EVENT, ERROR
  // console.log('createdAt:', createdAt); // 디버깅 완료 후 주석 처리 또는 삭제
  const curThemeId = useHomeStore((state) => state.curThemeId);
  const eventBackgroundColor = backgroundColor || (curThemeId === 2 ? "#9FC9FF" : "#F3D4EE");

  useEffect(() => {
    if (!createdAt) {
      setCurrentTitle("이벤트 정보 없음");
      setCurrentNoticeText("채팅방 생성 시간을 알 수 없습니다.");
      setRemainingSecondsForDisplay(0);
      setEventPhase("ERROR");
      return;
    }

    // 일부 DB에서 날짜 문자열에 공백이 포함되는 경우 처리
    // createdAt 문자열이 시간대 정보를 포함하지 않으면 (예: 'Z' 또는 +09:00)
    // UTC로 간주하고 'Z'를 추가하여 파싱합니다.
    // 서버에서 항상 UTC 시간을 보내지만 'Z'가 누락된 경우에 유효합니다.
    let isoCreatedAt = createdAt.replace(' ', 'T');
    if (!isoCreatedAt.endsWith('Z') && !isoCreatedAt.match(/[+-]\d{2}:\d{2}$/)) {
      isoCreatedAt += 'Z'; // UTC로 명시
    }
    const creationTimestamp = new Date(isoCreatedAt).getTime();
    if (isNaN(creationTimestamp)) {
        setCurrentTitle("오류");
        setCurrentNoticeText("유효하지 않은 생성 시간입니다.");
        setRemainingSecondsForDisplay(0);
        setEventPhase("ERROR");
        return;
    }

    const updateEventState = () => {
      const currentTimestamp = Date.now();
      const elapsedSeconds = Math.floor((currentTimestamp - creationTimestamp) / 1000);

      let newTitle = "";
      let newNoticeText = "";
      let targetTimestamp = 0;
      let newPhase = "";

      if (elapsedSeconds < SECRET_MESSAGE_START_OFFSET) { // 0-1분
        newTitle = "다음 이벤트";
        newNoticeText = "시크릿 메시지 시작까지";
        targetTimestamp = creationTimestamp + SECRET_MESSAGE_START_OFFSET * 1000;
        newPhase = "PRE_SECRET";
      } else if (elapsedSeconds < SECRET_MESSAGE_END_OFFSET) { // 1-2분
        newTitle = "시크릿 메시지";
        newNoticeText = "시크릿 메시지 종료까지";
        targetTimestamp = creationTimestamp + SECRET_MESSAGE_END_OFFSET * 1000;
        newPhase = "SECRET";
      } else if (elapsedSeconds < CUPID_INTERIM_END_OFFSET) { // 2-3분 (시크릿 결과 확인 기간 / 큐피드 시작 전)
        newTitle = curThemeId === 2 ? "우정의 짝대기" : "큐피드의 짝대기";
        newNoticeText = curThemeId === 2 ? "우정의 짝대기 이벤트 시작까지" : "큐피드의 짝대기 이벤트 시작까지";
        targetTimestamp = creationTimestamp + CUPID_INTERIM_END_OFFSET * 1000;
        newPhase = "CUPID_INTERIM";
      } else if (elapsedSeconds < CUPID_MAIN_EVENT_END_OFFSET) { // 3-4분 (큐피드 이벤트 진행)
        newTitle = curThemeId === 2 ? "우정의 짝대기" : "큐피드의 짝대기";
        newNoticeText = curThemeId === 2 ? "우정의 짝대기 선택 종료까지" : "큐피드의 짝대기 선택 종료까지";
        targetTimestamp = creationTimestamp + CUPID_MAIN_EVENT_END_OFFSET * 1000;
        newPhase = "CUPID_MAIN"; // 이전 PRE_CUPID_MAIN, CUPID_MAIN을 통합하여 이벤트 진행 단계로 명확화
      } else if (elapsedSeconds < CHAT_ROOM_END_OFFSET) { // 4-5분 (큐피드 결과 확인 기간 / 채팅방 종료 카운트다운)
        newTitle = "채팅방 종료"; 
        newNoticeText = "채팅방 종료까지";
        targetTimestamp = creationTimestamp + CHAT_ROOM_END_OFFSET * 1000;
        newPhase = "COUNTDOWN_TO_END";
      } else {
        newTitle = "이벤트 종료";
        newNoticeText = "모든 이벤트가 종료되었습니다.";
        targetTimestamp = currentTimestamp; // 카운트다운 불필요
        newPhase = "POST_EVENT";
      }

      setCurrentTitle(newTitle);
      setCurrentNoticeText(newNoticeText);
      setRemainingSecondsForDisplay(Math.max(0, Math.floor((targetTimestamp - currentTimestamp) / 1000)));
      setEventPhase(newPhase);
    };

    updateEventState(); // 즉시 한 번 호출
    const intervalId = setInterval(updateEventState, 1000);

    return () => clearInterval(intervalId);
  }, [createdAt, curThemeId]);

  // 시간 형식을 00:00:00 형태로 변환
  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : `${time}`;
  };

  // 남은 시간 계산
  // console.log(remainingSecondsForDisplay)
  const hours = Math.floor(remainingSecondsForDisplay / 3600);
  const minutes = Math.floor((remainingSecondsForDisplay % 3600) / 60);
  const seconds = remainingSecondsForDisplay % 60;

  if (eventPhase === "LOADING" || eventPhase === "ERROR") {
    return (
      <View style={styles.container}>
        <View style={[styles.noticeBox, { backgroundColor: eventBackgroundColor, height: 'auto', paddingVertical: 10, borderRadius: 15, justifyContent: 'center' }]}>
          <Text style={[styles.noticeText, { textAlign: 'center'}]}>{currentTitle}</Text>
          <Text style={[styles.noticeText, { textAlign: 'center'}]}>{currentNoticeText}</Text>
        </View>
      </View>
    );
  }

  if (eventPhase === "POST_EVENT") {
    return (
     <View style={styles.container}>
       <View style={styles.imageContainer}>
        {Icon ? (
           <View style={styles.svgContainer}><Icon width="100%" height="100%" /></View>
         ) : (
           <Image source={require("@/assets/images/chat/sidebarEvent01.png")} style={styles.image} resizeMode="cover" />
         )}
         <View style={styles.overlay} />
         <View style={styles.timerContainer}>
           <Text style={styles.title}>{currentTitle}</Text>
            <Text style={[styles.title, {fontSize: 28, color: '#ffffff'}]}>종료</Text>
         </View>
       </View>
       <View style={[styles.noticeBox, { backgroundColor: eventBackgroundColor }]}>
         <Text style={styles.noticeText}>{currentNoticeText}</Text>
       </View>
       <View style={[styles.bottomLine, { backgroundColor: eventBackgroundColor }]} />
     </View>
   );
 }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {Icon ? (
          <View style={styles.svgContainer}>
            <Icon width="100%" height="100%" />
          </View>
        ) : (
          <Image
            source={require("@/assets/images/chat/sidebarEvent01.png")}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.overlay} />
        <View style={styles.timerContainer}>
          <Text style={styles.title}>{currentTitle}</Text>
          <CountdownTimer 
            initialSeconds={remainingSecondsForDisplay}
            fontSize={28}
            color="#ffffff"
          />
        </View>
      </View>
      <View style={[styles.noticeBox, { backgroundColor: eventBackgroundColor }]}>
        <Text style={styles.noticeText}>
          {currentNoticeText}: {formatTime(hours)}:{formatTime(minutes)}:{formatTime(seconds)}
        </Text>
      </View>
      <View style={[styles.bottomLine, { backgroundColor: eventBackgroundColor }]} />
    </View>
  );
};

export default ChatEventNotice;

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.215,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60, 60, 60, 0.7)', // 어두운 회색 반투명 오버레이
  },
  timerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  noticeBox: {
    width: width * 0.7,
    height: height * 0.05,
    paddingVertical: 6,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: "center",
  },
  noticeText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomLine: {
    width: width * 0.7,
    height: height * 0.002,
    marginTop: height * 0.015,
  },
});