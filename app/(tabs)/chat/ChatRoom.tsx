import { getFilteredRoomEvents, getPickEventsForRoom, RoomEventFromApi } from "@/api/EventApi"; // getPickEventsForRoom 추가
import SideBar from "@/app/(tabs)/chat/SideBar"; // ← 만든 사이드바 컴포넌트 import
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import Hana from '@/assets/images/dice/hana.svg'; // HanaSvg로 명확하게
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessageLeft from "@/components/chat/ChatMessageLeft";
import ChatMessageRight from "@/components/chat/ChatMessageRight";
import ChatProfile from "@/components/chat/ChatProfile";
import GptNotice from "@/components/chat/GptNotice";
import ReadingTag from "@/components/chat/ReadingTag";
import EnvelopeAnimation from "@/components/event/animation/EnvelopeAnimation";
import ResultFriendArrow from "@/components/event/diceFriends/ResultFriendArrow";
import LoveArrow from "@/components/event/heartSignal/LoveArrow";
import LoveArrowMatch, { ProfileInfo } from "@/components/event/heartSignal/LoveArrowMatch";
import LoveLetterSelect from "@/components/event/heartSignal/LoveLetterSelect";
import ResultLoveArrow from "@/components/event/heartSignal/ResultLoveArrow";
import UnmatchedModal from "@/components/event/heartSignal/UnmatchedModal";
import useChat from "@/utils/useChat"; // 실제 경로에 맞춰 조정
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore 임포트
import useChatRoomStore from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 및 ChatParticipant 임포트
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore 임포트
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from "expo-router"; // useRouter 추가
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Animated, Dimensions, Keyboard, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, KeyboardEvent } from "react-native";
import { SvgProps } from "react-native-svg";


const nicknameToSvgMap: Record<string, React.FC<SvgProps>> = {
  "한가로운 하나": Hana, "두 얼굴의 매력 두리": DoriSvg, "세침한 세찌": SezziSvg,
  "네모지만 부드러운 네몽": NemoSvg, "단호한데 다정한 다오": DaoSvg, "육감적인 직감파 육땡": YukdaengSvg,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 채팅 메시지 데이터 타입 정의
interface ChatMessage {
  id: number;
  profileImage: any;
  nickname: string;
  message: string;
  time: string;
  isMe?: boolean; // 내가 보낸 메시지인지 여부
  memberId: number; // memberId 추가
}
// ChatEventNotice.tsx 에서 가져온 시간 상수
const SECRET_MESSAGE_START_OFFSET = 23 * 60 * 60; // 시크릿 메시지 시작까지 23시간
const SECRET_MESSAGE_DURATION = 1 * 60 * 60; // 시크릿 메시지 1시간 진행
const SECRET_MESSAGE_END_OFFSET = SECRET_MESSAGE_START_OFFSET + SECRET_MESSAGE_DURATION; // 24시간 시점

// 1단계: 시크릿 메시지 종료 후 ~ 40시간 (총 16시간)
const CUPID_INTERIM_START_OFFSET = SECRET_MESSAGE_END_OFFSET; // 24시간 시점
const CUPID_INTERIM_END_OFFSET = 40 * 60 * 60; // 1단계 종료: 채팅방 생성 후 40시간

// 2단계: 1단계 종료 후 (40시간) ~ 48시간 (총 8시간)
const CUPID_MAIN_EVENT_START_OFFSET = CUPID_INTERIM_END_OFFSET; // 2단계 시작: 1단계 종료 직후 (40시간)
const CUPID_MAIN_EVENT_DURATION = 8 * 60 * 60; // 큐피드 메인 이벤트 8시간 진행
const CUPID_MAIN_EVENT_END_OFFSET = CUPID_MAIN_EVENT_START_OFFSET + CUPID_MAIN_EVENT_DURATION; // 2단계 종료: 채팅방 생성 후 48시간

// 큐피드 메인 이벤트 종료 후 채팅방 종료까지의 유예 시간
const POST_CUPID_MAIN_DURATION = 1 * 60 * 60; // 1시간
const CHAT_ROOM_END_OFFSET = CUPID_MAIN_EVENT_END_OFFSET + POST_CUPID_MAIN_DURATION; // 채팅방 실제 종료 시점: 49시간

// 시간 포맷 함수
const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const ChatRoom = () => {
  const router = useRouter();
  //const params = useLocalSearchParams();
  const { chatRoomId: chatRoomIdFromParams, themeId: themeIdFromParams } = useLocalSearchParams<{ chatRoomId?: string, themeId?: string }>();

  const { setChatRoomDetails, clearChatRoomDetails } = useChatRoomStore((state) => state.actions);
  // const originalThemeIdFromChatRoomStore = useChatRoomStore((state) => state.themeId); // ChatRoomStore에서 가져오던 themeId
  const curThemeId = useHomeStore((state) => state.curThemeId as number | undefined) ?? 1; // HomeStore에서 curThemeId 가져오기, 없으면 기본값 1
  const createdAt = useChatRoomStore((state) => state.createdAt); // 채팅방 생성 시간
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId);
  
  // 테마별 색상 설정
  const alertModalTitleColor = curThemeId === 2 ? "#5C5279" : "#A45C73";
  const alertModalConfirmButtonColor = curThemeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [scrollViewMarginTop, setScrollViewMarginTop] = useState(SCREEN_HEIGHT * 0.075);
  const [selectedProfile, setSelectedProfile] = useState<{ nickname: string, SvgComponent: React.FC<SvgProps> } | null>(null);
  const [showReadingTag, setShowReadingTag] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showLoveLetterSelect, setShowLoveLetterSelect] = useState(false);
  const [showLoveArrow, setShowLoveArrow] = useState(false);
  const [showResultLoveArrow, setShowResultLoveArrow] = useState(false);
  const [showResultFriendArrow, setShowResultFriendArrow] = useState(false); // New state for FriendArrow result
  const [showResultAlertModal, setShowResultAlertModal] = useState(false);
  const [showLoveArrowMatch, setShowLoveArrowMatch] = useState(false);
  const [isEnvelopeReadOnly, setIsEnvelopeReadOnly] = useState(false); // EnvelopeAnimation 읽기 전용 상태
  const [readOnlyEnvelopeMessages, setReadOnlyEnvelopeMessages] = useState<string[]>([]); // 읽기 전용 편지 메시지
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [matchedPair, setMatchedPair] = useState<{ myProfile?: ProfileInfo; partnerProfile?: ProfileInfo } | null>(null); 
  const [fixedReadingTagAtMessageId, setFixedReadingTagAtMessageId] = useState<number | null>(null); // ReadingTag 고정 위치 상태

  const scrollViewRef = useRef<ScrollView>(null); // ScrollView 참조 생성
  // Keyboard offset state for logic (e.g., scrollToEnd dependency)
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Animated values for smooth transition
  const animatedKeyboardOffset = useRef(new Animated.Value(0)).current;
  const baseScrollViewMarginBottom = useMemo(() => SCREEN_HEIGHT * 0.07, []);
  const animatedScrollViewMarginBottom = useRef(new Animated.Value(baseScrollViewMarginBottom)).current;

  // const setSelectionsForAnimation = useArrowEventStore((state) => state.setSelectionsForAnimation); // Result 컴포넌트에서 직접 API 호출하므로 제거
  // const chatParts = useChatRoomStore((state) => state.chatParts); // Result 컴포넌트에서 직접 스토어 사용
  
  // GptNotice 텍스트 업데이트를 위한 상태
  const [currentEventPhase, setCurrentEventPhase] = useState("LOADING");
  const [remainingSecondsForDisplay, setRemainingSecondsForDisplay] = useState(0);
  const [activeNoticeType, setActiveNoticeType] = useState<"SECRET_MESSAGE_START" | "SECRET_MESSAGE_RESULT" | "LOVE_ARROW_START" | "LOVE_ARROW_RESULT" | null>(null);

  // useChat 호출 예시 (chatRoomIdFromParams는 문자열이므로 Number(...) 처리)
  const roomIdNum = chatRoomIdFromParams ? Number(chatRoomIdFromParams) : 0;
  const initialChats = useChatRoomStore((state) => state.chats);
  const { messages, isConnected, sendMessage, newMessagesArrived, setNewMessagesArrived } = useChat(roomIdNum, initialChats); // setNewMessagesArrived 추가


  useEffect(() => {
    let isMounted = true;
    // 입장 시 마지막으로 읽은 ID를 불러오고, ReadingTag 위치를 한 번만 결정합니다.
    const loadAndSetInitialReadingTagPosition = async () => {
      if (currentChatRoomId) {
        try {
          const key = `lastReading_${currentChatRoomId}`;
          const idStr = await AsyncStorage.getItem(key);

          if (isMounted) {
            if (idStr !== null) {
              const loadedId = Number(idStr);
              // newMessagesArrived 상태를 확인하여 ReadingTag를 고정할지 결정합니다.
              // 이 확인은 setNewMessagesArrived(false) 호출 *전에* 이루어져야 합니다.
              if (!newMessagesArrived) { // 현재 세션에서 아직 새 메시지가 없다고 판단될 때
                setFixedReadingTagAtMessageId(loadedId);
              }
              // ReadingTag 표시 여부와 관계없이, 입장 시 newMessagesArrived는 false로 설정합니다.
              setNewMessagesArrived(false);
            } else {
              // 저장된 lastReadMessageId가 없을 경우
              setFixedReadingTagAtMessageId(null);
              setNewMessagesArrived(false);
            }
          }
        } catch (e) {
          console.error('❌ 마지막으로 읽은 메시지 ID 로딩 실패:', e);
          if (isMounted) {
            setNewMessagesArrived(false);
          }
        }
      } else if (isMounted) {
        // currentChatRoomId가 없는 경우 (이론상 발생하기 어려움)
        setFixedReadingTagAtMessageId(null);
        setNewMessagesArrived(false);
      }
    };

    loadAndSetInitialReadingTagPosition();

    return () => {
      isMounted = false;
    };
    // 이 useEffect는 currentChatRoomId가 변경되거나, 컴포넌트가 처음 마운트될 때 실행됩니다.
    // newMessagesArrived는 의존성 배열에 포함하지 않아, 해당 상태 변경으로 이 로직이 재실행되지 않도록 합니다.
  }, [currentChatRoomId, setNewMessagesArrived]);

  // 채팅방 퇴장 시 또는 messages 배열이 업데이트될 때 마지막 메시지 ID 저장
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 (채팅방 퇴장 시) 마지막 메시지 ID 저장
      const saveLastReadOnUnmount = async () => {
        if (messages && messages.length > 0 && currentChatRoomId) {
          const lastMessageInView = messages[messages.length - 1];
          if (lastMessageInView && lastMessageInView.chatId) {
            try {
              const key = `lastReading_${currentChatRoomId}`;
              await AsyncStorage.setItem(key, String(lastMessageInView.chatId));
              console.log(`✅ 채팅방(${currentChatRoomId}) 퇴장. 마지막으로 읽은 메시지 ID(${lastMessageInView.chatId}) 저장.`);
            } catch (e) {
              console.error('❌ 마지막으로 읽은 메시지 ID 저장 실패:', e);
            }
          }
        }
      };
      saveLastReadOnUnmount();
    };
  }, [messages, currentChatRoomId]); // messages나 currentChatRoomId가 변경될 때마다 cleanup 함수가 이전 상태로 저장할 수 있도록 설정

  // 새 메시지 도착 시 스크롤 맨 아래로 이동
  useEffect(() => {
    // 새 메시지가 있거나 키보드 상태가 변경되어 ScrollView의 가용 높이가 변경될 때
    // 맨 아래로 스크롤하여 최신 메시지 또는 변경된 뷰의 하단을 보여줍니다.
    // messages.length > 0 조건은 초기 로드 시 빈 메시지 목록에 대해 스크롤하지 않도록 유지할 수 있습니다.
    if (scrollViewRef.current && (messages && messages.length > 0 || keyboardOffset > 0)) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, keyboardOffset]); // messages 또는 keyboardOffset이 변경될 때마다 실행

  useEffect(() => {
    if (chatRoomIdFromParams) {
      console.log("ChatRoom.tsx: Mounting with chatRoomId from params:", chatRoomIdFromParams);
      // 스토어에 chatRoomId와 themeId 설정 (themeId도 params로 받거나, chatRoomId 기반으로 서버에서 받아올 수 있음)
      // 여기서는 params.themeId가 있다고 가정하고, 없다면 기본값 또는 스토어 현재값 사용
      const themeIdToSetInChatRoomStore = themeIdFromParams ? parseInt(themeIdFromParams) : (useChatRoomStore.getState().themeId || 1);
      setChatRoomDetails({ chatRoomId: Number(chatRoomIdFromParams), themeId: themeIdToSetInChatRoomStore });
    } else {
      console.warn("ChatRoom.tsx: chatRoomId not found in params. Navigating back or showing error.");
      // router.back(); 또는 에러 처리
    }
    return () => {
      // 컴포넌트 언마운트 시 스토어의 채팅방 정보 클리어 (선택적)
      // clearChatRoomDetails();
      // console.log("ChatRoom.tsx: Unmounted, chatRoomId:", chatRoomIdFromParams);
    };
  }, [chatRoomIdFromParams, themeIdFromParams, setChatRoomDetails, clearChatRoomDetails, router]);

  useEffect(() => {
    if (showNotice) { // GptNotice 표시 여부에 따라 스크롤뷰 마진 조정
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.12); 
    } else {
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.075);
    }
  }, [showNotice]);

  useEffect(() => {
    if (!createdAt) {
      setCurrentEventPhase("ERROR");
      return;
    }

    let isoCreatedAt = createdAt.replace(' ', 'T');
    if (!isoCreatedAt.endsWith('Z') && !isoCreatedAt.match(/[+-]\d{2}:\d{2}$/)) {
      isoCreatedAt += 'Z';
    }
    const creationTimestamp = new Date(isoCreatedAt).getTime();

    if (isNaN(creationTimestamp)) {
      setCurrentEventPhase("ERROR");
      return;
    }

    const updateEventStateInChatRoom = () => {
      const currentTimestamp = Date.now();
      const elapsedSeconds = Math.floor((currentTimestamp - creationTimestamp) / 1000);

      let targetTimestamp = 0;
      let newPhase = "";
      let newActiveNoticeType: typeof activeNoticeType = null;

      if (elapsedSeconds < SECRET_MESSAGE_START_OFFSET) {
        targetTimestamp = creationTimestamp + SECRET_MESSAGE_START_OFFSET * 1000;
        newPhase = "PRE_SECRET";
        newActiveNoticeType = "SECRET_MESSAGE_START";
      } else if (elapsedSeconds < SECRET_MESSAGE_END_OFFSET) {
        targetTimestamp = creationTimestamp + SECRET_MESSAGE_END_OFFSET * 1000;
        newPhase = "SECRET";
        newActiveNoticeType = "SECRET_MESSAGE_START";
      } else if (elapsedSeconds < CUPID_INTERIM_END_OFFSET) {
        targetTimestamp = creationTimestamp + CUPID_INTERIM_END_OFFSET * 1000;
        newPhase = "CUPID_INTERIM";
        newActiveNoticeType = "SECRET_MESSAGE_RESULT"; // 시크릿 메시지 결과 확인 우선
      } else if (elapsedSeconds < CUPID_MAIN_EVENT_END_OFFSET) {
        targetTimestamp = creationTimestamp + CUPID_MAIN_EVENT_END_OFFSET * 1000;
        newPhase = "CUPID_MAIN";
        // CUPID_MAIN 단계에서는 짝대기 참여를 우선으로 표시
        // 사용자가 이미 참여했거나, 선택 시간이 종료된 후 결과 확인으로 변경하는 로직은 추가 상태 관리가 필요할 수 있음
        newActiveNoticeType = "LOVE_ARROW_START"; 
      } else if (elapsedSeconds < CHAT_ROOM_END_OFFSET) {
        targetTimestamp = creationTimestamp + CHAT_ROOM_END_OFFSET * 1000;
        newPhase = "COUNTDOWN_TO_END";
        newActiveNoticeType = null; // 이 단계에서는 특정 GptNotice 없음
      } else {
        targetTimestamp = currentTimestamp;
        newPhase = "POST_EVENT";
        newActiveNoticeType = null; // 이벤트 종료 후 GptNotice 없음
      }

      setRemainingSecondsForDisplay(Math.max(0, Math.floor((targetTimestamp - currentTimestamp) / 1000)));
      setCurrentEventPhase(newPhase);
      setActiveNoticeType(newActiveNoticeType);
    };

    updateEventStateInChatRoom();
    const intervalId = setInterval(updateEventStateInChatRoom, 1000);
    return () => clearInterval(intervalId);
  }, [createdAt]);

  // Keyboard listeners for adjusting input position
  useEffect(() => {
    const KEYBOARD_ANIMATION_DURATION = Platform.OS === 'ios' ? 250 : 10; // 애니메이션 속도 조절 (ms)

    const handleKeyboardDidShow = (e: KeyboardEvent) => {
      const keyboardHeight = e.endCoordinates.height;
      setKeyboardOffset(keyboardHeight); // Update state for other logic if needed
      Animated.parallel([
        Animated.timing(animatedKeyboardOffset, {
          toValue: keyboardHeight,
          duration: KEYBOARD_ANIMATION_DURATION,
          useNativeDriver: false, // 'bottom' is a layout property
        }),
        Animated.timing(animatedScrollViewMarginBottom, {
          toValue: baseScrollViewMarginBottom + keyboardHeight,
          duration: KEYBOARD_ANIMATION_DURATION,
          useNativeDriver: false, // 'marginBottom' is a layout property
        }),
      ]).start();
    };

    const handleKeyboardDidHide = () => {
      setKeyboardOffset(0); // Update state for other logic
      Animated.parallel([
        Animated.timing(animatedKeyboardOffset, {
          toValue: 0,
          duration: KEYBOARD_ANIMATION_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(animatedScrollViewMarginBottom, {
          toValue: baseScrollViewMarginBottom,
          duration: KEYBOARD_ANIMATION_DURATION,
          useNativeDriver: false,
        }),
      ]).start();
    };

    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardDidShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [animatedKeyboardOffset, animatedScrollViewMarginBottom, baseScrollViewMarginBottom]);
  
  const hideNotice = () => {
    setShowNotice(false);
  };
  
  // 시크릿 메시지 이벤트 참여하기 버튼 클릭 핸들러
  const handleSecretMessageParticipate = () => {
    console.log('시크릿 메시지 이벤트 참여!');
    setShowLoveLetterSelect(true);
  };
  
  // 시크릿 메시지 결과 확인 버튼 클릭 핸들러
  const handleSecretMessageResultCheck = async () => {
    console.log('시크릿 메시지 결과 확인!');
    try {
      // TODO: "SECRET_MESSAGE_RESULT"를 실제 시크릿 메시지 결과 확인을 위한 eventType으로 변경해주세요.
      // TODO: event 객체에서 실제 메시지 내용이 담긴 필드명 (예: event.messageContent)으로 접근 경로를 수정해주세요.
      const eventTypeForSecretMessageResults = "PICK_MESSAGE"; // 예시: 실제 API와 일치하는 이벤트 타입 사용
      const fetchedEvents: RoomEventFromApi[] = await getFilteredRoomEvents(eventTypeForSecretMessageResults);
      
      // RoomEventFromApi에서 메시지 내용을 추출 (예: event.messageContent)
      const messages = fetchedEvents.map(event =>
        String(event.message || "메시지 내용을 불러올 수 없습니다.") // 실제 필드명인 'message' 사용
      );

      if (messages.length > 0) {
        setReadOnlyEnvelopeMessages(messages);
      } else {
        setReadOnlyEnvelopeMessages(["확인할 수 있는 메시지가 없습니다."]);
      }
      setIsEnvelopeReadOnly(true); // 읽기 전용 모드 활성화
      setShowEnvelope(true); // EnvelopeAnimation 표시
    } catch (error) {
      console.error("시크릿 메시지 결과 로딩 중 오류:", error);
      setReadOnlyEnvelopeMessages(["오류: 메시지를 불러오는 데 실패했습니다."]);
      setIsEnvelopeReadOnly(true); // 오류 시에도 읽기 전용으로 봉투 표시
      setShowEnvelope(true);
    }
  };

  // 사랑의 짝대기 이벤트 참여하기 버튼 클릭 핸들러
  const handleLoveArrowParticipate = () => {
    console.log('사랑의 짝대기 이벤트 참여!');
    setShowLoveArrow(true);
  };
  
  // 사랑의 짝대기 결과 확인 핸들러 (LoveArrow)
  const handleLoveArrowResultCheck = () => {
    console.log('사랑의 짝대기 결과 확인 모달 표시 요청 (LoveArrow)');
    setShowResultLoveArrow(true);
  };

  // 친구의 짝대기 결과 확인 핸들러 (FriendArrow)
  const handleFriendArrowResultCheck = () => {
    console.log('친구의 짝대기 결과 확인 모달 표시 요청 (FriendArrow)');
    setShowResultFriendArrow(true);
  };
  
  const handleLoveLetterSelectClose = () => {
    setShowLoveLetterSelect(false);
  };
  
  const handleLoveLetterSelectConfirm = (selectedIndex: number) => {
    console.log(`선택된 사용자 인덱스: ${selectedIndex}`);
    // LoveLetterSelect 모달 닫기
    setShowLoveLetterSelect(false);
    // 편지 애니메이션 표시
    setShowEnvelope(true);
  };
  
  // 사랑의 짝대기 모달 닫기 핸들러
  const handleLoveArrowClose = () => {
    setShowLoveArrow(false);
  };
  
  // ResultAlertModal의 확인 버튼 클릭 핸들러
  const handleResultAlertConfirm = () => {
    setShowResultAlertModal(false); // ResultAlertModal 닫기
    if (curThemeId === 2) {
      setShowResultFriendArrow(true); // FriendArrow 결과 표시
    } else {
      setShowResultLoveArrow(true); // LoveArrow 결과 표시
    }
  };
  
  // SideBar에서 프로필 클릭 시 처리 함수
  const handleSidebarProfilePress = (nickname: string, SvgComponent: React.FC<SvgProps>) => {
    setSelectedProfile({ nickname, SvgComponent });
    // 필요하다면 사이드바 닫기
    // setSidebarOpen(false);
  };
  
  // 편지 애니메이션 완료 핸들러
  const handleEnvelopeAnimationComplete = () => {
    console.log('편지 애니메이션 완료!');
    setShowEnvelope(false);
    setIsEnvelopeReadOnly(false); // 읽기 전용 상태 초기화
    setReadOnlyEnvelopeMessages([]); // 메시지 목록 초기화
  };
  
  // 매칭 결과 보기 버튼 클릭 핸들러
  const handleMatchPress = async () => {

    const currentMemberId = useAuthStore.getState().memberId;
    const participants = useChatRoomStore.getState().chatParts;

    if (!currentMemberId) {
      console.error("현재 사용자 ID를 찾을 수 없습니다.");
      setShowUnmatchedModal(true);
      return;
    }

    try {
      const events: RoomEventFromApi[] = await getPickEventsForRoom();

      const myEvent = events.find(event => event.senderId === currentMemberId);
      if (!myEvent) {
        console.log("내가 선택한 이벤트가 없습니다.");
        setShowUnmatchedModal(true);
        return;
      }

      const partnerEvent = events.find(event => event.senderId === myEvent.receiverId && event.receiverId === currentMemberId);

      if (partnerEvent) { // 상호 매칭 성공
        const myParticipant = participants.find(p => p.memberId === currentMemberId);
        const partnerParticipant = participants.find(p => p.memberId === myEvent.receiverId);

        if (myParticipant?.nickname && partnerParticipant?.nickname) { // 닉네임 존재 확인
          const mySvg = nicknameToSvgMap[myParticipant.nickname];
          const partnerSvg = nicknameToSvgMap[partnerParticipant.nickname];

          if (mySvg && partnerSvg) { // SVG 컴포넌트 존재 확인
            const myProfileForMatch: ProfileInfo = {
              nickname: myParticipant.nickname,
              SvgComponent: mySvg 
            };
            const partnerProfileForMatch: ProfileInfo = {
              nickname: partnerParticipant.nickname,
              SvgComponent: partnerSvg 
            };
            setMatchedPair({ myProfile: myProfileForMatch, partnerProfile: partnerProfileForMatch });
            setShowLoveArrowMatch(true);
          } else {
            console.error("매칭된 사용자의 프로필 SVG를 찾을 수 없습니다.", myParticipant.nickname, partnerParticipant.nickname);
            setShowUnmatchedModal(true);
          }
        } else {
          console.error("매칭된 사용자의 프로필 정보를 찾을 수 없습니다.");
          setShowUnmatchedModal(true);
        }
      } else { // 매칭 실패
        setShowUnmatchedModal(true);
      }
    } catch (error) {
      console.error("매칭 결과 확인 중 오류 발생:", error);
      setShowUnmatchedModal(true);
    }
  };
  

  const getNoticeText = (noticeType: "SECRET_MESSAGE_START" | "SECRET_MESSAGE_RESULT" | "LOVE_ARROW_START" | "LOVE_ARROW_RESULT"): string => {
    const timeStr = formatTime(remainingSecondsForDisplay);
    const cupidEventName = curThemeId === 2 ? "우정의 짝대기" : "사랑의 짝대기";

    switch (noticeType) {
      case "SECRET_MESSAGE_START":
        return `[시스템] 시크릿 메시지 이벤트가 시작되었습니다.`; // 기본값 또는 해당 페이즈 아닐 때
      
      case "SECRET_MESSAGE_RESULT":
        if (currentEventPhase === "CUPID_INTERIM") { // 시크릿 메시지 종료 후 ~ 짝대기 시작 전
          return `[시스템] 시크릿 메시지 결과를 확인해주세요!!`;
        }
        return `[시스템] 시크릿 메시지 결과를 확인해주세요!!`; // 기본값 또는 해당 페이즈 아닐 때

      case "LOVE_ARROW_START":
        if (currentEventPhase === "CUPID_INTERIM") { // 짝대기 이벤트 시작 전
          return `[시스템] ${cupidEventName} 이벤트가 시작되었습니다.`;
        }
        return `[시스템] ${curThemeId === 2 ? "우정의 짝대기" : "사랑의 짝대기"} 이벤트가 시작되었습니다.`; // 기본값

      case "LOVE_ARROW_RESULT":
        if (currentEventPhase === "CUPID_MAIN") { // 짝대기 이벤트 진행 중 (결과 확인 기간)
          return `[시스템] ${cupidEventName} 결과를 확인해주세요!!`;
        }
        return `[시스템] ${curThemeId === 2 ? "우정의 짝대기" : "사랑의 짝대기"} 결과를 확인해주세요!!`; // 기본값
      default:
        return "[시스템] 공지사항";
    }
  };
  
  return (
    <View style={styles.container}>
        {/* ChatHeader 블러 효과 */}
        {sidebarOpen && (
          <BlurView 
            intensity={20} 
            tint="dark" 
            style={[
              StyleSheet.absoluteFill, 
              { zIndex: 3 }
            ]} 
          />
        )}
        <View style={[styles.headerContainer, { zIndex: sidebarOpen ? 2 : 3 }]}>
            {/* ChatHeader 표시 */}
        <ChatHeader
            title="하트시그널"
            fontColor="#A45C73"
            backgroundColor="#ffffff"
                  onToggleSidebar={() => setSidebarOpen(true)}

            />
            {showNotice && activeNoticeType && (
              <GptNotice 
                text={getNoticeText(activeNoticeType)}
                onHide={hideNotice}
                onParticipate={
                  activeNoticeType === "SECRET_MESSAGE_START" ? handleSecretMessageParticipate :
                  activeNoticeType === "SECRET_MESSAGE_RESULT" ? handleSecretMessageResultCheck :
                  activeNoticeType === "LOVE_ARROW_START" ? handleLoveArrowParticipate :
                  activeNoticeType === "LOVE_ARROW_RESULT" ? (curThemeId === 2 ? handleFriendArrowResultCheck : handleLoveArrowResultCheck) :
                  () => {} // 기본값
                }
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
              />
            )}

        </View>
        <Animated.ScrollView 
          ref={scrollViewRef} // ScrollView에 ref 할당
          style={[styles.scrollViewBase, { marginTop: scrollViewMarginTop, marginBottom: animatedScrollViewMarginBottom }]} // styles.scrollViewBase 사용 및 animated 값 적용
          contentContainerStyle={styles.scrollContent} // styles.scrollView 대신 styles.scrollViewBase 사용
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => {
            // msg 타입은 서버에서 보내준 ChatDto.Response 형태라고 가정
            // 필요하다면 아래처럼 로컬에서 정의한 ChatMessage 타입으로 매핑:
            const isMine = Number(msg.memberId) === Number(useAuthStore.getState().memberId);
            
            // 서버에서 받은 UTC 시간 문자열을 현지 시간으로 변환
            let isoCreatedAt = msg.createdAt.replace(' ', 'T');
            if (!isoCreatedAt.endsWith('Z') && !isoCreatedAt.match(/[+-]\d{2}:\d{2}$/)) {
              isoCreatedAt += 'Z';
            }
            const timeFormatted = new Date(isoCreatedAt).toLocaleTimeString([], {
              hour: "2-digit", minute: "2-digit"
            });
            // 프로필 이미지는 서버에 URL로 내려주지 않으면, 기존 닉네임→SVG 매핑 로직을 재활용
            const ProfileSvg = nicknameToSvgMap[msg.nickname] || NemoSvg; // 기본값

            const messageComponent = isMine ? (
              <ChatMessageRight
                profileImage={ProfileSvg}
                nickname={msg.nickname}
                message={msg.message}
                time={timeFormatted}
                isConsecutive={ // 이전 메시지와 연속 여부 비교
                  index > 0 &&
                  messages[index - 1].nickname === msg.nickname &&
                  messages[index - 1].memberId === msg.memberId
                }
                showTime={true}
                onPressProfile={() => setSelectedProfile({ nickname: msg.nickname, SvgComponent: ProfileSvg })}
              />
            ) : (
              <ChatMessageLeft
                profileImage={ProfileSvg}
                nickname={msg.nickname}
                message={msg.message}
                time={timeFormatted}
                isConsecutive={
                  index > 0 &&
                  messages[index - 1].nickname === msg.nickname &&
                  messages[index - 1].memberId === msg.memberId
                }
                showTime={true}
                onPressProfile={() => setSelectedProfile({ nickname: msg.nickname, SvgComponent: ProfileSvg })}
              />
            );
            
            return (
              <React.Fragment key={msg.chatId}>
                {messageComponent}
                {Number(msg.chatId) === fixedReadingTagAtMessageId && <ReadingTag />}
              </React.Fragment>
            );
          })}
        </Animated.ScrollView>
        {/* 사이드바 표시 */}
        <SideBar
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onProfilePress={handleSidebarProfilePress}
        />
        {/* 하단 영역: ChatInput */}
         <Animated.View style={[styles.inputContainer, { bottom: animatedKeyboardOffset }]}>
            <ChatInput onSendMessage={sendMessage} />
          </Animated.View>
        {/* 프로필 팝업 - z-index를 높게 설정하여 최상위에 표시 */}
        {selectedProfile && (
          <View style={styles.profileOverlay}>
            <ChatProfile
              profileImage={selectedProfile.SvgComponent}
              nickname={selectedProfile.nickname}
              onClose={() => setSelectedProfile(null)}

            />
          </View>
        )}

        {/* 러브레터 선택 모달 */}
        <LoveLetterSelect
          visible={showLoveLetterSelect}
          onClose={handleLoveLetterSelectClose}
          onConfirm={handleLoveLetterSelectConfirm}

        />
        
        {/* 사랑의 짝대기 모달 */}
        <LoveArrow
          visible={showLoveArrow}
          onClose={handleLoveArrowClose}
          gender="MALE"
          remainingCount={1}

        />
    
        {/* ResultAlertModal */}
        <Modal
          visible={showResultAlertModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResultAlertModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.alertModalContent}>
              <Text style={[styles.alertModalTitle, { color: alertModalTitleColor }]}>매칭 결과 확인</Text>
              <Text style={[styles.alertModalText, { color: alertModalTitleColor }]}>매칭 결과를 확인하시겠습니까?</Text>
              <View style={styles.alertModalButtons}>
                <TouchableOpacity 
                  style={[styles.alertModalButton, styles.alertModalCancelButton]}
                  onPress={() => setShowResultAlertModal(false)}
                >
                  <Text style={styles.alertModalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.alertModalButton, styles.alertModalConfirmButton, { backgroundColor: alertModalConfirmButtonColor }]}
                  onPress={handleResultAlertConfirm}
                >
                  <Text style={styles.alertModalButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* ResultLoveArrow 모달 */}
        <Modal
          visible={showResultLoveArrow}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResultLoveArrow(false)}
        >
          <View style={styles.modalContainer}>
              <ResultLoveArrow
                onMatchPress={handleMatchPress}
                onClose={() => setShowResultLoveArrow(false)} // ResultLoveArrow 모달 닫기 콜백 전달
                themeId={curThemeId} // HomeStore의 curThemeId 전달
              />
          </View>
        </Modal>
        {/* ResultFriendArrow 모달 */}
        <Modal
          visible={showResultFriendArrow}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResultFriendArrow(false)}
        >
          <View style={styles.modalContainer}>
            <ResultFriendArrow
              onMatchPress={handleMatchPress}
              onClose={() => setShowResultFriendArrow(false)} // ResultFriendArrow 모달 닫기 콜백 전달
            />
          </View>
        </Modal>
        
        {/* 편지 애니메이션 */}
        {showEnvelope && (
          <View style={styles.envelopeOverlay}>
            <EnvelopeAnimation 
              autoPlay={true}
              onAnimationComplete={handleEnvelopeAnimationComplete}

              isReadOnly={isEnvelopeReadOnly} // 읽기 전용 상태 전달
              messages={readOnlyEnvelopeMessages} // 읽기 전용 메시지 전달
              content={
                <View style={styles.envelopeContent}>
                  <Text style={styles.envelopeTitle}>큐피트의 짝대기 이벤트</Text>
                  <TouchableOpacity 
                    style={styles.envelopeButton}
                    onPress={() => setShowEnvelope(false)}
                  >
                    <Text style={styles.envelopeButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        )}

        {/* LoveArrowMatch 모달 */}
        {showLoveArrowMatch && matchedPair?.myProfile && matchedPair?.partnerProfile && (
          <LoveArrowMatch
            isVisible={showLoveArrowMatch}
            onClose={() => {
              setShowLoveArrowMatch(false);
              setMatchedPair(null); // 상태 초기화
            }}

            myProfile={matchedPair.myProfile}
            partnerProfile={matchedPair.partnerProfile}
          />
        )}

        {/* UnmatchedModal */}
        <UnmatchedModal
          visible={showUnmatchedModal}
          onClose={() => setShowUnmatchedModal(false)}

        />
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#fff',
  },
  scrollViewBase: { // styles.scrollView에서 marginBottom 제거 후 이름 변경
    flex: 1,
    // marginBottom: SCREEN_HEIGHT * 0.07, // 이 부분을 animatedScrollViewMarginBottom으로 대체
  },
  scrollView: { // 기존 스타일 유지 (참조용, 실제 사용은 scrollViewBase)
    flex: 1,
    marginBottom: SCREEN_HEIGHT * 0.07, 
  },
  scrollContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.025, // 양쪽 여백 약간 늘림
    paddingBottom: SCREEN_HEIGHT * 0.05, // 하단 패딩 추가하여 마지막 메시지가 잘 보이도록 함
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.07,
    backgroundColor: "#ffffff",
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    height: SCREEN_HEIGHT * 0.07, // ChatInput과 동일한 높이
  },
  button: {
    width: '48%',
    height: '100%',
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#DDDDDD',
  },
  confirmButton: {
    backgroundColor: '#D75F75',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999999',
  },
  profileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // 매우 높은 z-index로 설정하여 맨 앞에 표시
    elevation: 5, // Android에서 z-index와 유사한 역할
  },
  envelopeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
  },
  envelopeContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envelopeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A45C73',
    marginBottom: 20,
    textAlign: 'center',
  },
  envelopeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  envelopeButton: {
    backgroundColor: '#A45C73',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginTop: 15,
  },
  envelopeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  alertModalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  alertModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  alertModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  alertModalCancelButton: {
    backgroundColor: '#DDDDDD',
    marginRight: 10,
  },
  alertModalConfirmButton: {
    // backgroundColor는 동적으로 적용됨
  },
  alertModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});