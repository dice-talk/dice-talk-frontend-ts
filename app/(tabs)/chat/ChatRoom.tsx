import SideBar from "@/app/(tabs)/chat/SideBar"; // ← 만든 사이드바 컴포넌트 import
import HanaSvg from '@/assets/images/chat/hana.svg';
import Nemo from '@/assets/images/chat/nemo.svg';
import ChatHeader from "@/components/chat/ChatHeader";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessageLeft from "@/components/chat/ChatMessageLeft";
import ChatMessageRight from "@/components/chat/ChatMessageRight";
import ChatProfile from "@/components/chat/ChatProfile";
import GptNotice from "@/components/chat/GptNotice";
import MessageCheckReport from "@/components/chat/MessageCheckReport";
import ReadingTag from "@/components/chat/ReadingTag";
import ReportModal from "@/components/chat/ReportModal";
import EnvelopeAnimation from "@/components/event/heartSignal/EnvelopeAnimation";
import LoveArrow from "@/components/event/heartSignal/LoveArrow";
import LoveArrowMatch from "@/components/event/heartSignal/LoveArrowMatch";
import LoveLetterSelect from "@/components/event/heartSignal/LoveLetterSelect";
import ResultLoveArrow from "@/components/event/heartSignal/ResultLoveArrow";
import { BlurView } from 'expo-blur';
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 채팅 메시지 데이터 타입 정의
interface ChatMessage {
  id: number;
  profileImage: any;
  nickname: string;
  message: string;
  time: string;
  isMe?: boolean; // 내가 보낸 메시지인지 여부
}

const ChatRoom = () => {
  const params = useLocalSearchParams();
  const themeId = parseInt(params.themeId as string) || 1;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(true);
  const [scrollViewMarginTop, setScrollViewMarginTop] = useState(SCREEN_HEIGHT * 0.075);
  const [selectedProfile, setSelectedProfile] = useState<{ nickname: string, SvgComponent: React.FC<SvgProps> } | null>(null);
  const [showReadingTag, setShowReadingTag] = useState(true);
  const [showMessageCheckReport, setShowMessageCheckReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hasCheckedMessage, setHasCheckedMessage] = useState(false);
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [showLoveLetterSelect, setShowLoveLetterSelect] = useState(false);
  const [showLoveArrow, setShowLoveArrow] = useState(false);
  const [showResultLoveArrow, setShowResultLoveArrow] = useState(false);
  const [showResultAlertModal, setShowResultAlertModal] = useState(false);
  const [showLoveArrowMatch, setShowLoveArrowMatch] = useState(false);
  
  // GptNotice의 표시 여부에 따라 ScrollView의 marginTop 조정
  useEffect(() => {
    if (showMessageCheckReport) {
      // 신고 모드일 때는 헤더가 없으므로 상단 여백 줄임
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.02);
    } else if (showNotice) {
      // 헤더와 공지 모두 표시될 때
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.12);
    } else {
      // 헤더만 표시될 때
      setScrollViewMarginTop(SCREEN_HEIGHT * 0.075);
    }
  }, [showNotice, showMessageCheckReport]);
  
  // 샘플 메시지 데이터
  const messages: ChatMessage[] = [
    {
      id: 1,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "다들 어제 개봉한 펩시 vs 콜라 영화 보셨나요?",
      time: "오후 6:58",
      isMe: false
    },
    {
      id: 2,
      profileImage: HanaSvg,
      nickname: "한가로운 하나",
      message: "정말 재밌어서 추천드려요",
      time: "오후 6:58",
      isMe: false
    },
    {
      id: 3,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "와! 저도 어제 봤는데 사람이 많더라구요",
      time: "오후 6:59",
      isMe: true
    },
    {
      id: 4,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "저는 펩시파에요",
      time: "오후 6:59",
      isMe: true
    },
    {
      id: 5,
      profileImage: Nemo,
      nickname: "네모지만 부드러운 네모",
      message: "다오님은요?",
      time: "오후 6:59",
      isMe: true
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
  
  // 사랑의 짝대기 이벤트 참여하기 버튼 클릭 핸들러
  const handleLoveArrowParticipate = () => {
    console.log('사랑의 짝대기 이벤트 참여!');
    setShowLoveArrow(true);
  };
  
  // 사랑의 짝대기 결과 확인 버튼 클릭 핸들러 수정
  const handleLoveArrowResultCheck = () => {
    setShowResultAlertModal(true); // ResultAlertModal을 먼저 표시
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
  
  const handleSirenPress = () => {
    setShowMessageCheckReport(true);
    setShowReadingTag(false);
    setSidebarOpen(false);
    setHasCheckedMessage(false); // 신고 화면 진입 시 체크 상태 초기화
  };
  
  const handleReportConfirm = () => {
    // 신고 확인 로직 - ReportModal 표시
    setShowReportModal(true);
  };

  const handleReportCancel = () => {
    // 신고 취소 로직
    console.log('신고가 취소되었습니다');
    setShowMessageCheckReport(false);
    setShowReadingTag(true);
    setHasCheckedMessage(false); // 체크 상태 초기화
  };
  
  const handleReportModalClose = () => {
    // ReportModal 닫은 후 일반 채팅 화면으로 돌아가기
    setShowReportModal(false);
    setShowMessageCheckReport(false);
    setShowReadingTag(true);
    setHasCheckedMessage(false); // 체크 상태 초기화
  };

  // MessageCheckReport에서 체크 상태 변경 시 호출되는 함수
  const handleCheckedChange = (checked: boolean) => {
    setHasCheckedMessage(checked);
  };
  
  // 메시지 렌더링 함수
  const renderMessages = () => {
    return messages.map((message, index) => {
      // 이전 메시지가 같은 사람인지 확인
      const isConsecutive = index > 0 && 
        messages[index - 1].nickname === message.nickname &&
        messages[index - 1].isMe === message.isMe;
      // 이전 메시지와 시간 및 닉네임이 동일한지 확인 (시간 표시 여부 결정)
      let showTime = true;
      if (index < messages.length - 1) {
        const nextMessage = messages[index + 1];
        // 다음 메시지가 같은 사람이고 시간이 같으면 현재 메시지의 시간은 숨김
        if (message.nickname === nextMessage.nickname && 
            message.time === nextMessage.time &&
            message.isMe === nextMessage.isMe) {
          showTime = false;
        }
      }
      // 내가 보낸 메시지면 오른쪽, 아니면 왼쪽에 표시
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
  
  // 내가 보낸 메시지(ChatMessageRight)만 렌더링하는 함수
  const renderMyMessages = () => {
    return messages
      .filter(message => message.isMe) // 내가 보낸 메시지만 필터링
      .map((message, index) => {
        // 이전 메시지가 같은 사람인지 확인 (필터링 후 인덱스가 달라지므로 재계산)
        const prevMyMessages = messages.filter(msg => msg.isMe);
        const isConsecutive = index > 0 && 
          prevMyMessages[index - 1].nickname === message.nickname;
        
        // 시간 표시 여부 결정
        let showTime = true;
        if (index < prevMyMessages.length - 1) {
          const nextMessage = prevMyMessages[index + 1];
          if (message.time === nextMessage.time) {
            showTime = false;
          }
        }
        
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
      });
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
  };
  
  // 매칭 결과 보기 버튼 클릭 핸들러
  const handleMatchPress = () => {
    setShowResultLoveArrow(false); // ResultLoveArrow 모달 닫기
    setShowLoveArrowMatch(true); // LoveArrowMatch 모달 열기
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
            {/* showMessageCheckReport가 false일 때만 ChatHeader 표시 */}
            {!showMessageCheckReport && (
              <ChatHeader
                  title="하트시그널"
                  fontColor="#A45C73"
                  backgroundColor="#ffffff"
                  onToggleSidebar={() => setSidebarOpen(true)}
                  themeId={themeId}
              />
            )}
            {showNotice && !showMessageCheckReport && (
              <GptNotice 
                text="[시스템] 시크릿 메시지 이벤트가 시작되었습니다."
                onHide={hideNotice}
                onParticipate={handleSecretMessageParticipate}
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}
            {showNotice && !showMessageCheckReport && (
              <GptNotice 
                text="[시스템] 사랑의 짝대기 이벤트가 시작되었습니다."
                onHide={hideNotice}
                onParticipate={handleLoveArrowParticipate}
                hideOnParticipate={false} // 참여하기 클릭 시 공지가 유지되도록 설정
                themeId={themeId}
              />
            )}
            {showNotice && !showMessageCheckReport && (
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
          {showReadingTag && <ReadingTag />}
          
          {showMessageCheckReport ? (
            <>
              <MessageCheckReport 
                onCheckedChange={handleCheckedChange} 
                themeId={themeId}
              />
              {/* 신고 모드에서는 내가 보낸 메시지(ChatMessageRight)만 표시 */}
              {renderMyMessages()}
            </>
          ) : (
            /* 일반 모드에서 모든 메시지 렌더링 */
            renderMessages()
          )}
        </ScrollView>
        {/* 사이드바 표시 */}
        <SideBar
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSirenPress={handleSirenPress}
            onProfilePress={handleSidebarProfilePress}
            themeId={themeId}
        />
        {/* 하단 영역: 신고 중이면 취소/확인 버튼, 아니면 ChatInput */}
        {showMessageCheckReport ? (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleReportCancel}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.confirmButton,
                !hasCheckedMessage && styles.disabledButton
              ]} 
              onPress={handleReportConfirm}
              disabled={!hasCheckedMessage}
            >
              <Text style={[
                styles.confirmButtonText,
                !hasCheckedMessage && styles.disabledText
              ]}>확인</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <ChatInput themeId={themeId} />
          </View>
        )}
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

        {/* 신고 모달 */}
        <ReportModal 
          visible={showReportModal} 
          onClose={handleReportModalClose} 
        />
        
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
              <Text style={styles.alertModalTitle}>매칭 결과 확인</Text>
              <Text style={styles.alertModalText}>매칭 결과를 확인하시겠습니까?</Text>
              <View style={styles.alertModalButtons}>
                <TouchableOpacity 
                  style={[styles.alertModalButton, styles.alertModalCancelButton]}
                  onPress={() => setShowResultAlertModal(false)}
                >
                  <Text style={styles.alertModalButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.alertModalButton, styles.alertModalConfirmButton]}
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
              selections={[
                { from: 1, to: 2 },
                { from: 3, to: 5 },
                { from: 5, to: 2 },
                { from: 2, to: 1 },
                { from: 4, to: 1 },
                { from: 6, to: 3 }
              ]}
              onClose={() => setShowResultLoveArrow(false)}
              onMatchPress={handleMatchPress}
            />
          </View>
        </Modal>
        
        {/* 편지 애니메이션 */}
        {showEnvelope && (
          <View style={styles.envelopeOverlay}>
            <EnvelopeAnimation 
              autoPlay={true}
              onAnimationComplete={handleEnvelopeAnimationComplete}
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
        <LoveArrowMatch 
          isVisible={showLoveArrowMatch}
          onClose={() => setShowLoveArrowMatch(false)}
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
    color: '#A45C73',
    marginBottom: 15,
  },
  alertModalText: {
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#FFB6C1',
  },
  alertModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});