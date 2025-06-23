import { getFilteredRoomEvents, getPickEventsForRoom, RoomEventFromApi } from "@/api/EventApi";
import { getChatRoomInfo } from "@/api/ChatApi";
import { getChatMessages } from "@/api/historyApi";
import SideBar from "@/app/(tabs)/chat/SideBar";
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import Hana from '@/assets/images/dice/hana.svg';
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
import useChat from "@/utils/useChat";
import useAuthStore from "@/zustand/stores/authStore";
import useChatRoomStore, { ChatMessage, PageInfo } from "@/zustand/stores/ChatRoomStore";
import useHomeStore from "@/zustand/stores/HomeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Dimensions, Keyboard, KeyboardEvent, Modal, NativeScrollEvent, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import {
  SECRET_MESSAGE_START_OFFSET, SECRET_MESSAGE_END_OFFSET,
  CUPID_INTERIM_END_OFFSET, CUPID_MAIN_EVENT_END_OFFSET,
  CHAT_ROOM_END_OFFSET
} from "@/constants/chatEventTimes";

const nicknameToSvgMap: Record<string, React.FC<SvgProps>> = {
  "한가로운 하나": Hana, "두 얼굴의 매력 두리": DoriSvg, "세침한 세찌": SezziSvg,
  "네모지만 부드러운 네몽": NemoSvg, "단호한데 다정한 다오": DaoSvg, "육감적인 직감파 육땡": YukdaengSvg,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ChatRoom = () => {
  const router = useRouter();
  const { chatRoomId: chatRoomIdFromParams, themeId: themeIdFromParams } = useLocalSearchParams<{ chatRoomId?: string, themeId?: string }>();

  const { setChatRoomDetails, clearChatRoomDetails, prependPastChats } = useChatRoomStore((state) => state.actions);
  const chatPageInfo = useChatRoomStore((state) => state.chatPageInfo);
  const curThemeId = useHomeStore((state) => state.curThemeId as number | undefined) ?? 1;
  const themeName = useChatRoomStore((state) => state.themeName);
  const createdAt = useChatRoomStore((state) => state.createdAt);
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId);
  
  const alertModalTitleColor = curThemeId === 2 ? "#5C5279" : "#A45C73";
  const alertModalConfirmButtonColor = curThemeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [scrollViewMarginTop, setScrollViewMarginTop] = useState(SCREEN_HEIGHT * 0.075);
  const [selectedProfile, setSelectedProfile] = useState<{ nickname: string, SvgComponent: React.FC<SvgProps> } | null>(null);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showLoveLetterSelect, setShowLoveLetterSelect] = useState(false);
  const [showLoveArrow, setShowLoveArrow] = useState(false);
  const [showResultLoveArrow, setShowResultLoveArrow] = useState(false);
  const [showResultFriendArrow, setShowResultFriendArrow] = useState(false);
  const [showResultAlertModal, setShowResultAlertModal] = useState(false);
  const [showLoveArrowMatch, setShowLoveArrowMatch] = useState(false);
  const [isEnvelopeReadOnly, setIsEnvelopeReadOnly] = useState(false);
  const [readOnlyEnvelopeMessages, setReadOnlyEnvelopeMessages] = useState<string[]>([]);
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [matchedPair, setMatchedPair] = useState<{ myProfile?: ProfileInfo; partnerProfile?: ProfileInfo } | null>(null); 
  const [fixedReadingTagAtMessageId, setFixedReadingTagAtMessageId] = useState<number | null>(null);

  const readingTagCalculatedForRoom = useRef<number | null>(null); // ReadingTag 계산 여부 추적
  const [isLoadingPast, setIsLoadingPast] = useState(false);
  const prevContentHeight = useRef(0);
  const shouldMaintainScroll = useRef(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const animatedKeyboardOffset = useRef(new Animated.Value(0)).current;
  const baseScrollViewMarginBottom = useMemo(() => SCREEN_HEIGHT * 0.07, []);
  const animatedScrollViewMarginBottom = useRef(new Animated.Value(baseScrollViewMarginBottom)).current;
  
  const [currentEventPhase, setCurrentEventPhase] = useState("LOADING");
  const [remainingSecondsForDisplay, setRemainingSecondsForDisplay] = useState(0);
  const [activeNoticeType, setActiveNoticeType] = useState<"SECRET_MESSAGE_START" | "SECRET_MESSAGE_RESULT" | "LOVE_ARROW_START" | "LOVE_ARROW_RESULT" | null>(null);

  const roomIdNum = chatRoomIdFromParams ? Number(chatRoomIdFromParams) : 0;
  const initialChats = useChatRoomStore((state) => state.chats);
  const { messages, sendMessage, newMessagesArrived, setNewMessagesArrived } = useChat(roomIdNum, initialChats);

  const loadPastMessages = useCallback(async () => {
    if (isLoadingPast || !chatPageInfo || chatPageInfo.page >= chatPageInfo.totalPages - 1) {
      return;
    }

    setIsLoadingPast(true);
    shouldMaintainScroll.current = true;

    try {
      const nextPageToFetch = chatPageInfo.page + 1;
      const response = await getChatMessages(roomIdNum, nextPageToFetch, 30);

      if (response.content && response.content.length > 0) {
        const pastMessages: ChatMessage[] = response.content.map((dto) => ({
          chatId: dto.chatId,
          message: dto.message,
          memberId: dto.memberId,
          nickname: dto.nickName || '알 수 없는 사용자',
          createdAt: dto.createdAt,
        }));
        
        const newPageInfo: PageInfo = {
            page: response.number,
            size: response.size,
            totalElements: response.totalElements,
            totalPages: response.totalPages,
        };

        prependPastChats(pastMessages, newPageInfo);
      }
    } catch (error) {
      console.error("🚨 과거 메시지 로드 중 오류 발생:", error);
    } finally {
      setIsLoadingPast(false);
    }
  }, [isLoadingPast, chatPageInfo, roomIdNum, prependPastChats]);

  useEffect(() => {
    // currentChatRoomId가 유효하고, 해당 방에 대해 ReadingTag가 아직 계산되지 않았다면 실행
    if (currentChatRoomId && readingTagCalculatedForRoom.current !== currentChatRoomId) {
      const loadAndSetInitialReadingTagPosition = async () => {
        // 메시지가 아직 로드되지 않았다면, 다음 렌더링 사이클을 기다립니다.
        if (messages.length === 0) {
          return;
        }

        try {
          const key = `lastReading_${currentChatRoomId}`;
          const idStr = await AsyncStorage.getItem(key);
          let lastReadMessageIdFromStorage: number | null = idStr !== null ? Number(idStr) : null;

          let tagMessageId: number | null = null;

          // 저장된 마지막 읽은 메시지 ID보다 큰 첫 번째 메시지를 찾습니다.
          const firstUnreadMessage = messages.find(msg => msg.chatId > (lastReadMessageIdFromStorage || 0));

          if (firstUnreadMessage) {
            tagMessageId = firstUnreadMessage.chatId;
            console.log(`[ReadingTag] 새로운 메시지 발견. 첫 번째 읽지 않은 메시지 ID: ${tagMessageId}`);
          } else {
            tagMessageId = null;
            console.log(`[ReadingTag] 읽지 않은 메시지 없음. 태그 표시 안 함.`);
          }

          setFixedReadingTagAtMessageId(tagMessageId);
          setNewMessagesArrived(false); // ReadingTag 로직 처리 후 플래그 초기화

          // 이 채팅방에 대해 ReadingTag 계산이 완료되었음을 표시
          readingTagCalculatedForRoom.current = currentChatRoomId;

        } catch (e) {
          console.error('❌ 마지막으로 읽은 메시지 ID 로딩 실패:', e);
          setFixedReadingTagAtMessageId(null);
          setNewMessagesArrived(false);
        }
      };
      loadAndSetInitialReadingTagPosition();
    }
  }, [currentChatRoomId, messages.length, setNewMessagesArrived]); // messages.length를 의존성으로 추가하여 초기 메시지 로드 후 실행 보장

  useEffect(() => {
    return () => {
      const saveLastReadOnUnmount = async () => {
        if (messages && messages.length > 0 && currentChatRoomId) {
          const lastMessageInView = messages[messages.length - 1];
          if (lastMessageInView && lastMessageInView.chatId) {
            try {
              const key = `lastReading_${currentChatRoomId}`;
              await AsyncStorage.setItem(key, String(lastMessageInView.chatId));
            } catch (e) {
              console.error('❌ 마지막으로 읽은 메시지 ID 저장 실패:', e);
            }
          }
        }
      };
      saveLastReadOnUnmount();
    };
  }, [messages, currentChatRoomId]);

  useEffect(() => {
    if (scrollViewRef.current && (messages && messages.length > 0 || keyboardOffset > 0)) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages, keyboardOffset]);

  useEffect(() => {
    if (chatRoomIdFromParams) {
      const themeIdToSetInChatRoomStore = themeIdFromParams ? parseInt(themeIdFromParams) : (useChatRoomStore.getState().themeId || 1);
      setChatRoomDetails({ chatRoomId: Number(chatRoomIdFromParams), themeId: themeIdToSetInChatRoomStore });
    } else {
      console.warn("ChatRoom.tsx: chatRoomId not found in params.");
    }
  }, [chatRoomIdFromParams, themeIdFromParams, setChatRoomDetails]);

  useEffect(() => {
    if (showNotice) {
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
        newActiveNoticeType = null;
      } else if (elapsedSeconds < SECRET_MESSAGE_END_OFFSET) {
        targetTimestamp = creationTimestamp + SECRET_MESSAGE_END_OFFSET * 1000;
        newPhase = "SECRET";
        newActiveNoticeType = "SECRET_MESSAGE_START";
      } else if (elapsedSeconds < CUPID_INTERIM_END_OFFSET) {
        targetTimestamp = creationTimestamp + CUPID_INTERIM_END_OFFSET * 1000;
        newPhase = "CUPID_INTERIM";
        newActiveNoticeType = "SECRET_MESSAGE_RESULT";
      } else if (elapsedSeconds < CUPID_MAIN_EVENT_END_OFFSET) {
        targetTimestamp = creationTimestamp + CUPID_MAIN_EVENT_END_OFFSET * 1000;
        newPhase = "CUPID_MAIN";
        newActiveNoticeType = "LOVE_ARROW_START"; 
      } else if (elapsedSeconds < CHAT_ROOM_END_OFFSET) {
        targetTimestamp = creationTimestamp + CHAT_ROOM_END_OFFSET * 1000;
        newPhase = "COUNTDOWN_TO_END";
        newActiveNoticeType = "LOVE_ARROW_RESULT"; 
      } else {
        targetTimestamp = currentTimestamp;
        newPhase = "POST_EVENT";
        newActiveNoticeType = null;
      }

      setRemainingSecondsForDisplay(Math.max(0, Math.floor((targetTimestamp - currentTimestamp) / 1000)));
      setCurrentEventPhase(newPhase);
      setActiveNoticeType(newActiveNoticeType);
    };

    updateEventStateInChatRoom();
    const intervalId = setInterval(updateEventStateInChatRoom, 1000);
    return () => clearInterval(intervalId);
  }, [createdAt]);

  useEffect(() => {
    const KEYBOARD_ANIMATION_DURATION = Platform.OS === 'ios' ? 250 : 10;

    const handleKeyboardDidShow = (e: KeyboardEvent) => {
      const keyboardHeight = e.endCoordinates.height;
      setKeyboardOffset(keyboardHeight);
      Animated.parallel([
        Animated.timing(animatedKeyboardOffset, { toValue: keyboardHeight, duration: KEYBOARD_ANIMATION_DURATION, useNativeDriver: false }),
        Animated.timing(animatedScrollViewMarginBottom, { toValue: baseScrollViewMarginBottom + keyboardHeight, duration: KEYBOARD_ANIMATION_DURATION, useNativeDriver: false }),
      ]).start();
    };

    const handleKeyboardDidHide = () => {
      setKeyboardOffset(0);
      Animated.parallel([
        Animated.timing(animatedKeyboardOffset, { toValue: 0, duration: KEYBOARD_ANIMATION_DURATION, useNativeDriver: false }),
        Animated.timing(animatedScrollViewMarginBottom, { toValue: baseScrollViewMarginBottom, duration: KEYBOARD_ANIMATION_DURATION, useNativeDriver: false }),
      ]).start();
    };

    const showSubscription = Keyboard.addListener("keyboardDidShow", handleKeyboardDidShow);
    const hideSubscription = Keyboard.addListener("keyboardDidHide", handleKeyboardDidHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [animatedKeyboardOffset, animatedScrollViewMarginBottom, baseScrollViewMarginBottom]);
  
  const handleScroll = (event: NativeScrollEvent) => {
    if (event.contentOffset.y < 100 && !isLoadingPast) {
      prevContentHeight.current = event.contentSize.height;
      loadPastMessages();
    }
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    if (shouldMaintainScroll.current && prevContentHeight.current > 0) {
      const heightDiff = contentHeight - prevContentHeight.current;
      scrollViewRef.current?.scrollTo({ y: heightDiff, animated: false });
      shouldMaintainScroll.current = false;
      prevContentHeight.current = 0;
    }
  };

  const hideNotice = () => setShowNotice(false);
  
  const handleSecretMessageParticipate = () => setShowLoveLetterSelect(true);
  
  const handleSecretMessageResultCheck = async () => {
    try {
      const eventTypeForSecretMessageResults = "PICK_MESSAGE";
      const fetchedEvents: RoomEventFromApi[] = await getFilteredRoomEvents(eventTypeForSecretMessageResults);
      
      const messages = fetchedEvents.map(event => String(event.message || "메시지 내용을 불러올 수 없습니다."));

      if (messages.length > 0) {
        setReadOnlyEnvelopeMessages(messages);
      } else {
        setReadOnlyEnvelopeMessages(["확인할 수 있는 메시지가 없습니다."]);
      }
      setIsEnvelopeReadOnly(true);
      setShowEnvelope(true);
    } catch (error) {
      console.error("시크릿 메시지 결과 로딩 중 오류:", error);
      setReadOnlyEnvelopeMessages(["오류: 메시지를 불러오는 데 실패했습니다."]);
      setIsEnvelopeReadOnly(true);
      setShowEnvelope(true);
    }
  };

  const handleLoveArrowParticipate = () => setShowLoveArrow(true);
  
  const handleLoveArrowResultCheck = () => setShowResultLoveArrow(true);

  const handleFriendArrowResultCheck = () => setShowResultFriendArrow(true);
  
  const handleLoveLetterSelectClose = () => setShowLoveLetterSelect(false);
  
  const handleLoveLetterSelectConfirm = (selectedIndex: number) => {
    setShowLoveLetterSelect(false);
    setShowEnvelope(true);
  };
  
  const handleLoveArrowClose = () => setShowLoveArrow(false);
  
  const handleResultAlertConfirm = () => {
    setShowResultAlertModal(false);
    if (curThemeId === 2) {
      setShowResultFriendArrow(true);
    } else {
      setShowResultLoveArrow(true);
    }
  };
  
  const handleSidebarProfilePress = (nickname: string, SvgComponent: React.FC<SvgProps>) => {
    setSelectedProfile({ nickname, SvgComponent });
  };
  
  const handleEnvelopeAnimationComplete = () => {
    setShowEnvelope(false);
    setIsEnvelopeReadOnly(false);
    setReadOnlyEnvelopeMessages([]);
  };
  
  const handleMatchPress = async () => {
    const currentMemberId = useAuthStore.getState().memberId;
    const participants = useChatRoomStore.getState().chatParts;

    if (!currentMemberId) {
      setShowUnmatchedModal(true);
      return;
    }

    try {
      const events: RoomEventFromApi[] = await getPickEventsForRoom();
      const myEvent = events.find(event => event.senderId === currentMemberId);
      if (!myEvent) {
        setShowUnmatchedModal(true);
        return;
      }

      const partnerEvent = events.find(event => event.senderId === myEvent.receiverId && event.receiverId === currentMemberId);

      if (partnerEvent) {
        const myParticipant = participants.find(p => p.memberId === currentMemberId);
        const partnerParticipant = participants.find(p => p.memberId === myEvent.receiverId);

        if (myParticipant?.nickname && partnerParticipant?.nickname) {
          const mySvg = nicknameToSvgMap[myParticipant.nickname];
          const partnerSvg = nicknameToSvgMap[partnerParticipant.nickname];

          if (mySvg && partnerSvg) {
            const myProfileForMatch: ProfileInfo = { nickname: myParticipant.nickname, SvgComponent: mySvg };
            const partnerProfileForMatch: ProfileInfo = { nickname: partnerParticipant.nickname, SvgComponent: partnerSvg };
            setMatchedPair({ myProfile: myProfileForMatch, partnerProfile: partnerProfileForMatch });
            setShowLoveArrowMatch(true);
          } else {
            setShowUnmatchedModal(true);
          }
        } else {
          setShowUnmatchedModal(true);
        }
      } else {
        setShowUnmatchedModal(true);
      }
    } catch (error) {
      console.error("매칭 결과 확인 중 오류 발생:", error);
      setShowUnmatchedModal(true);
    }
  };

  const handleToggleSidebar = async () => {
    try {
      await getChatRoomInfo();
    } catch (error) {
      console.error("사이드바 열기 중 채팅방 정보 갱신 실패:", error);
    } finally {
      setSidebarOpen(true);
    }
  };
  
  const getNoticeText = (noticeType: "SECRET_MESSAGE_START" | "SECRET_MESSAGE_RESULT" | "LOVE_ARROW_START" | "LOVE_ARROW_RESULT" | null): string => {
    if (!noticeType) return "[시스템] 공지사항";
    const cupidEventName = curThemeId === 2 ? "우정의 짝대기" : "사랑의 짝대기";

    switch (noticeType) {
      case "SECRET_MESSAGE_START":
        return currentEventPhase === "SECRET" ? `[시스템] 시크릿 메시지 이벤트 진행 중! 지금 참여하기` : `[시스템] 시크릿 메시지 이벤트가 곧 시작됩니다.`;
      case "SECRET_MESSAGE_RESULT":
        return `[시스템] 시크릿 메시지 결과 확인하기 (${cupidEventName} 이벤트가 곧 시작됩니다.)`;
      case "LOVE_ARROW_START":
        return `[시스템] ${cupidEventName} 이벤트 진행 중! 지금 참여하기`;
      case "LOVE_ARROW_RESULT":
        return `[시스템] ${cupidEventName} 결과 확인하기 (채팅방이 곧 종료됩니다.)`;
      default:
        return "[시스템] 현재 진행중인 이벤트가 없습니다.";
    }
  };
  
  return (
    <View style={styles.container}>
        {sidebarOpen && <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFill, { zIndex: 3 }]} />}
        <View style={[styles.headerContainer, { zIndex: sidebarOpen ? 2 : 3 }]}>
          <ChatHeader
            title={themeName || (curThemeId === 2 ? "다이스 프렌즈" : "하트시그널")}
            fontColor={curThemeId === 2 ? "#6DA0E1" : "#A45C73"}
            backgroundColor="#ffffff"
            onToggleSidebar={handleToggleSidebar}
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
                () => {}
              }
              hideOnParticipate={false}
            />
          )}
        </View>
        <Animated.ScrollView 
          ref={scrollViewRef}
          style={[styles.scrollViewBase, { marginTop: scrollViewMarginTop, marginBottom: animatedScrollViewMarginBottom }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={(e) => handleScroll(e.nativeEvent)}
          onContentSizeChange={handleContentSizeChange}
          scrollEventThrottle={16}
        >
          {isLoadingPast && <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#B28EF8" />}
          {messages.map((msg, index) => {
            const isMine = Number(msg.memberId) === Number(useAuthStore.getState().memberId);
            
            let isoCreatedAt = msg.createdAt.replace(' ', 'T');
            if (!isoCreatedAt.endsWith('Z') && !isoCreatedAt.match(/[+-]\d{2}:\d{2}$/)) {
              isoCreatedAt += 'Z';
            }
            const timeFormatted = new Date(isoCreatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const ProfileSvg = nicknameToSvgMap[msg.nickname] || NemoSvg;

            const messageComponent = isMine ? (
              <ChatMessageRight
                profileImage={ProfileSvg} nickname={msg.nickname} message={msg.message} time={timeFormatted}
                isConsecutive={index > 0 && messages[index - 1].memberId === msg.memberId}
                showTime={true} onPressProfile={() => setSelectedProfile({ nickname: msg.nickname, SvgComponent: ProfileSvg })}
              />
            ) : (
              <ChatMessageLeft
                profileImage={ProfileSvg} nickname={msg.nickname} message={msg.message} time={timeFormatted}
                isConsecutive={index > 0 && messages[index - 1].memberId === msg.memberId}
                showTime={true} onPressProfile={() => setSelectedProfile({ nickname: msg.nickname, SvgComponent: ProfileSvg })}
              />
            );
            
            return (
              <React.Fragment key={msg.chatId}>
                {Number(msg.chatId) === fixedReadingTagAtMessageId && <ReadingTag />}
                {messageComponent}
              </React.Fragment>
            );
          })}
        </Animated.ScrollView>
        <SideBar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} onProfilePress={handleSidebarProfilePress} />
        <Animated.View style={[styles.inputContainer, { bottom: animatedKeyboardOffset }]}>
          <ChatInput onSendMessage={sendMessage} />
        </Animated.View>
        {selectedProfile && (
          <View style={styles.profileOverlay}>
            <ChatProfile profileImage={selectedProfile.SvgComponent} nickname={selectedProfile.nickname} onClose={() => setSelectedProfile(null)} />
          </View>
        )}
        <LoveLetterSelect visible={showLoveLetterSelect} onClose={handleLoveLetterSelectClose} onConfirm={handleLoveLetterSelectConfirm} />
        <LoveArrow visible={showLoveArrow} onClose={handleLoveArrowClose} remainingCount={1} />
        <Modal visible={showResultAlertModal} transparent={true} animationType="fade" onRequestClose={() => setShowResultAlertModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.alertModalContent}>
              <Text style={[styles.alertModalTitle, { color: alertModalTitleColor }]}>매칭 결과 확인</Text>
              <Text style={[styles.alertModalText, { color: alertModalTitleColor }]}>매칭 결과를 확인하시겠습니까?</Text>
              <View style={styles.alertModalButtons}>
                <TouchableOpacity style={[styles.alertModalButton, styles.alertModalCancelButton]} onPress={() => setShowResultAlertModal(false)}>
                  <Text style={styles.alertModalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.alertModalButton, styles.alertModalConfirmButton, { backgroundColor: alertModalConfirmButtonColor }]} onPress={handleResultAlertConfirm}>
                  <Text style={styles.alertModalButtonText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal visible={showResultLoveArrow} transparent={true} animationType="fade" onRequestClose={() => setShowResultLoveArrow(false)}>
          <View style={styles.modalContainer}>
              <ResultLoveArrow onMatchPress={handleMatchPress} onClose={() => setShowResultLoveArrow(false)} themeId={curThemeId} />
          </View>
        </Modal>
        <Modal visible={showResultFriendArrow} transparent={true} animationType="fade" onRequestClose={() => setShowResultFriendArrow(false)}>
          <View style={styles.modalContainer}>
            <ResultFriendArrow onMatchPress={handleMatchPress} onClose={() => setShowResultFriendArrow(false)} />
          </View>
        </Modal>
        {showEnvelope && (
          <View style={styles.envelopeOverlay}>
            <EnvelopeAnimation autoPlay={true} onAnimationComplete={handleEnvelopeAnimationComplete} isReadOnly={isEnvelopeReadOnly} messages={readOnlyEnvelopeMessages}
              content={
                <View style={styles.envelopeContent}>
                  <Text style={styles.envelopeTitle}>큐피트의 짝대기 이벤트</Text>
                  <TouchableOpacity style={styles.envelopeButton} onPress={() => setShowEnvelope(false)}>
                    <Text style={styles.envelopeButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        )}
        {showLoveArrowMatch && matchedPair?.myProfile && matchedPair?.partnerProfile && (
          <LoveArrowMatch isVisible={showLoveArrowMatch} onClose={() => { setShowLoveArrowMatch(false); setMatchedPair(null); }} myProfile={matchedPair.myProfile} partnerProfile={matchedPair.partnerProfile} />
        )}
        <UnmatchedModal visible={showUnmatchedModal} onClose={() => setShowUnmatchedModal(false)} />
    </View>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, backgroundColor: '#fff' },
  scrollViewBase: { flex: 1 },
  scrollContent: { paddingHorizontal: SCREEN_WIDTH * 0.025, paddingBottom: SCREEN_HEIGHT * 0.05 },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_HEIGHT * 0.07, backgroundColor: "#ffffff" },
  profileOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, elevation: 5 },
  envelopeOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, elevation: 5 },
  envelopeContent: { flex: 1, padding: 10, justifyContent: 'center', alignItems: 'center' },
  envelopeTitle: { fontSize: 20, fontWeight: 'bold', color: '#A45C73', marginBottom: 20, textAlign: 'center' },
  envelopeButton: { backgroundColor: '#A45C73', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, marginTop: 15 },
  envelopeButtonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  alertModalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '80%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  alertModalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  alertModalText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  alertModalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
  alertModalButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 25, minWidth: 100, alignItems: 'center' },
  alertModalCancelButton: { backgroundColor: '#DDDDDD', marginRight: 10 },
  alertModalConfirmButton: {},
  alertModalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
});
