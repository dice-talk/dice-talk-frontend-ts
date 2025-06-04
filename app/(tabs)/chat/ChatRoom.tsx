import SideBar from "@/app/(tabs)/chat/SideBar"; // ← 만든 사이드바 컴포넌트 import
import { getFilteredRoomEvents, getPickEventsForRoom, RoomEventFromApi } from "@/api/EventApi"; // getPickEventsForRoom 추가
import Nemo from '@/assets/images/dice/nemo.svg';
import Hana from '@/assets/images/dice/hana.svg'; // HanaSvg로 명확하게
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
import LoveArrowMatch from "@/components/event/heartSignal/LoveArrowMatch";
import LoveLetterSelect from "@/components/event/heartSignal/LoveLetterSelect";
import ResultLoveArrow from "@/components/event/heartSignal/ResultLoveArrow";
import UnmatchedModal from "@/components/event/heartSignal/UnmatchedModal";

// import useArrowEventStore from "@/zustand/stores/ArrowEventStore"; // Result 컴포넌트가 스토어를 직접 사용하지 않으므로 주석 처리 또는 제거 가능
import useAuthStore from "@/zustand/stores/authStore"; // AuthStore 임포트
import useChatRoomStore, { ChatParticipant } from "@/zustand/stores/ChatRoomStore"; // ChatRoomStore 및 ChatParticipant 임포트


import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from "expo-router"; // useRouter 추가
import React, { useEffect, useState } from "react"; // React, useCallback 추가
import { ActivityIndicator, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"; // ActivityIndicator 추가
import { SvgProps } from "react-native-svg";



// LoveArrowMatch에 필요한 ProfileInfo 타입 (LoveArrowMatch.tsx와 동일하게)
import { ProfileInfo } from "@/components/event/heartSignal/LoveArrowMatch";

// ResultLoveArrow.tsx의 diceCharacterMap과 유사하게, 또는 닉네임으로 SVG를 매핑하는 맵
// 실제 프로젝트에서는 이 맵을 공통 파일로 옮기거나, ResultLoveArrow에서 export하여 사용하는 것이 좋습니다.
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import NemoSvg from '@/assets/images/dice/nemo.svg';
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";

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


const ChatRoom = () => {
  const router = useRouter();
  //const params = useLocalSearchParams();
  //const chatRoomIdFromParams = params.id ? parseInt(params.id as string) : null; // URL에서 chatRoomId 가져오기 (경로가 /chat/[id] 형태라고 가정)
  const { chatRoomId } = useLocalSearchParams<{ chatRoomId?: string }>();

  const { setChatRoomDetails, clearChatRoomDetails } = useChatRoomStore((state) => state.actions);
  const themeId = useChatRoomStore((state) => state.themeId) || 1; // 스토어에서 themeId 가져오기
  const currentChatRoomId = useChatRoomStore((state) => state.chatRoomId);
  
  // 테마별 색상 설정
  const alertModalTitleColor = themeId === 2 ? "#5C5279" : "#A45C73";
  const alertModalConfirmButtonColor = themeId === 2 ? "#9FC9FF" : "#FFB6C1";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [scrollViewMarginTop, setScrollViewMarginTop] = useState(SCREEN_HEIGHT * 0.075);
  const [selectedProfile, setSelectedProfile] = useState<{ nickname: string, SvgComponent: React.FC<SvgProps> } | null>(null);
  const [showReadingTag, setShowReadingTag] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showLoveLetterSelect, setShowLoveLetterSelect] = useState(false);
  const [showLoveArrow, setShowLoveArrow] = useState(false);
  const [showResultLoveArrow, setShowResultLoveArrow] = useState(false);
  const [showResultAlertModal, setShowResultAlertModal] = useState(false);
  const [showLoveArrowMatch, setShowLoveArrowMatch] = useState(false);
  const [isEnvelopeReadOnly, setIsEnvelopeReadOnly] = useState(false); // EnvelopeAnimation 읽기 전용 상태
  const [readOnlyEnvelopeMessages, setReadOnlyEnvelopeMessages] = useState<string[]>([]); // 읽기 전용 편지 메시지
  const [showUnmatchedModal, setShowUnmatchedModal] = useState(false);
  const [matchedPair, setMatchedPair] = useState<{ myProfile?: ProfileInfo; partnerProfile?: ProfileInfo } | null>(null);

  // const setSelectionsForAnimation = useArrowEventStore((state) => state.setSelectionsForAnimation); // Result 컴포넌트에서 직접 API 호출하므로 제거
  // const chatParts = useChatRoomStore((state) => state.chatParts); // Result 컴포넌트에서 직접 스토어 사용
  
  // 채팅 메시지 상태 (실제 API 연동 시 변경)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]); 
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (chatRoomId) {
      console.log("ChatRoom.tsx: Mounting with chatRoomId from params:", chatRoomId);
      // 스토어에 chatRoomId와 themeId 설정 (themeId도 params로 받거나, chatRoomId 기반으로 서버에서 받아올 수 있음)
      // 여기서는 params.themeId가 있다고 가정하고, 없다면 기본값 또는 스토어 현재값 사용
      const themeIdFromParamsOrDefault = chatRoomId ? parseInt(chatRoomId as string) : themeId;
      setChatRoomDetails({ chatRoomId: Number(chatRoomId), themeId: themeIdFromParamsOrDefault });
    } else {
      console.warn("ChatRoom.tsx: chatRoomId not found in params. Navigating back or showing error.");
      // router.back(); 또는 에러 처리
    }
    return () => {
      // 컴포넌트 언마운트 시 스토어의 채팅방 정보 클리어 (선택적)
      // clearChatRoomDetails(); 
      // console.log("ChatRoom.tsx: Unmounted, chatRoomId:", chatRoomIdFromParams);
    };
  }, [chatRoomId, setChatRoomDetails, clearChatRoomDetails/*, themeId*/, router]);

  useEffect(() => {
    if (showNotice) { // GptNotice 표시 여부에 따라 스크롤뷰 마진 조정
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.12); 
    } else {
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.075);
    }
  }, [showNotice]);
  
  const sampleMessages: ChatMessage[] = [ // API 연동 전까지 사용할 샘플 메시지
    {
      id: 1,
      profileImage: Hana,
      nickname: "한가로운 하나",
      message: "다들 어제 개봉한 펩시 vs 콜라 영화 보셨나요?",
      time: "오후 6:58",
      isMe: false,
      memberId: 21,
    },
    {
      id: 2,
      profileImage: Hana,
      nickname: "한가로운 하나", // 이전 메시지와 동일한 닉네임
      message: "정말 재밌어서 추천드려요",
      time: "오후 6:58",
      isMe: false,
      memberId:22
    },
    {
      id: 3, profileImage: Nemo, nickname: "네모지만 부드러운 네모", memberId: 102,
      message: "와! 저도 어제 봤는데 사람이 많더라구요", time: "오후 6:59", isMe: true
    },
  ];
  
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
  
  // 사랑의 짝대기 결과 확인 버튼 클릭 핸들러 (바로 결과 표시)
  const handleLoveArrowResultCheck = () => {
    console.log('사랑의 짝대기 결과 확인 모달 표시 요청');
    setShowResultLoveArrow(true); // ResultLoveArrow/ResultFriendArrow 모달 표시
  };

  // 이벤트 수정 버튼 클릭 핸들러 (아이템 필요)
  const handleEventModify = () => {
    // LoveArrow 컴포넌트가 자체적으로 CustomCostModal을 관리하므로,
    // ChatRoom.tsx에서 직접 setShowCustomCostModal(true)를 호출할 필요가 없습니다.
    // 필요하다면 LoveArrow를 표시하는 로직을 여기에 추가할 수 있습니다.
    console.log("GptNotice에서 이벤트 수정 요청. LoveArrow 컴포넌트 내부에서 처리됩니다.");
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
    setShowResultLoveArrow(true); // ResultLoveArrow 모달 표시
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
    setShowResultLoveArrow(false); // ResultLoveArrow 모달 닫기

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
  
  const handleUnmatched = () => {
    setShowUnmatchedModal(true);
  };
  
  const renderMessages = () => {
    const displayMessages = chatMessages.length > 0 ? chatMessages : sampleMessages; // API 연동 후 sampleMessages 제거
    if (isLoadingMessages) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#A45C73" />;

    return displayMessages.map((message, index) => {
      const isConsecutive = index > 0 && 
        displayMessages[index - 1].nickname === message.nickname &&
        displayMessages[index - 1].isMe === message.isMe;
      let showTime = true;
      if (index < displayMessages.length - 1) {
        const nextMessage = displayMessages[index + 1];
        if (message.nickname === nextMessage.nickname && 
            message.time === nextMessage.time &&
            message.isMe === nextMessage.isMe) {
          showTime = false;
        }
      }
      if (message.isMe) {
        return (
          <ChatMessageRight
              key={message.id}
              profileImage={message.profileImage}
              nickname={message.nickname}
              message={message.message}
              time={message.time}
              isConsecutive={isConsecutive}
              showTime={showTime}
              onPressProfile={() => setSelectedProfile({ nickname: message.nickname, SvgComponent: message.profileImage })}
              themeId={themeId}
          />
        );
      } else {
        return (
          <ChatMessageLeft
              key={message.id}
              profileImage={message.profileImage}
              nickname={message.nickname}
              message={message.message}
              time={message.time}
              isConsecutive={isConsecutive}
              showTime={showTime}
              onPressProfile={() => setSelectedProfile({ nickname: message.nickname, SvgComponent: message.profileImage })}
              themeId={themeId}
          />
        );
      }
    });
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
                  themeId={themeId}
              />
            {showNotice && (
              <GptNotice 
                text="[시스템] 시크릿 메시지 이벤트가 시작되었습니다."
                onHide={hideNotice}
                onParticipate={handleSecretMessageParticipate}
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}
            {showNotice && (
              <GptNotice 
                text="[시스템] 시크릿 메시지 결과를 확인해주세요!!"
                onHide={hideNotice}
                onParticipate={handleSecretMessageResultCheck} // 결과 확인 핸들러로 변경
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}
            {showNotice && (
              <GptNotice 
                text="[시스템] 사랑의 짝대기 이벤트가 시작되었습니다."
                onHide={hideNotice}
                onParticipate={handleLoveArrowParticipate}
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}
            {showNotice && (
              <GptNotice 
                text="[시스템] 사랑의 짝대기 결과를 확인해주세요!!"
                onHide={hideNotice}
                onParticipate={handleLoveArrowResultCheck}
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}

        </View>
        <ScrollView 
            style={[styles.scrollView, { marginTop: scrollViewMarginTop }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
          {showReadingTag && <ReadingTag themeId={themeId} />}
          {renderMessages()}
        </ScrollView>
        {/* 사이드바 표시 */}
        <SideBar
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onProfilePress={handleSidebarProfilePress}
        />
        {/* 하단 영역: ChatInput */}
          <View style={styles.inputContainer}>
            <ChatInput themeId={themeId} />
          </View>
        {/* 프로필 팝업 - z-index를 높게 설정하여 최상위에 표시 */}
        {selectedProfile && (
          <View style={styles.profileOverlay}>
            <ChatProfile
              profileImage={selectedProfile.SvgComponent}
              nickname={selectedProfile.nickname}
              onClose={() => setSelectedProfile(null)}
              themeId={themeId}
            />
          </View>
        )}

        {/* 러브레터 선택 모달 */}
        <LoveLetterSelect
          visible={showLoveLetterSelect}
          onClose={handleLoveLetterSelectClose}
          onConfirm={handleLoveLetterSelectConfirm}
          themeId={themeId}
        />
        
        {/* 사랑의 짝대기 모달 */}
        <LoveArrow
          visible={showLoveArrow}
          onClose={handleLoveArrowClose}
          gender="MALE"
          remainingCount={1}
          themeId={themeId}
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
        {/* ResultLoveArrow/ResultFriendArrow 모달 */}
        <Modal
          visible={showResultLoveArrow}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowResultLoveArrow(false)}
        >
          <View style={styles.modalContainer}>
            {themeId === 2 ? (
              <ResultFriendArrow
                onClose={() => setShowResultLoveArrow(false)}
                onMatchPress={handleMatchPress}
                themeId={themeId}
              />
            ) : (
              <ResultLoveArrow
                // onClose={() => setShowResultLoveArrow(false)}
                onMatchPress={handleMatchPress}
              />
            )}
          </View>
        </Modal>
        
        {/* 편지 애니메이션 */}
        {showEnvelope && (
          <View style={styles.envelopeOverlay}>
            <EnvelopeAnimation 
              autoPlay={true}
              onAnimationComplete={handleEnvelopeAnimationComplete}
              themeId={themeId}
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
            themeId={themeId}
            myProfile={matchedPair.myProfile}
            partnerProfile={matchedPair.partnerProfile}
          />
        )}

        {/* UnmatchedModal */}
        <UnmatchedModal
          visible={showUnmatchedModal}
          onClose={() => setShowUnmatchedModal(false)}
          themeId={themeId}
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
  scrollView: {
    flex: 1,
    marginBottom: SCREEN_HEIGHT * 0.07, // ChatInput 높이만큼 여백 추가
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