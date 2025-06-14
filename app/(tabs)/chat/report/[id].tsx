import { createReport, getChatRoomDetailsForReport, ReportChatMessageDto, ReportCreationDto } from "@/api/reportApi";
import ChatMessageLeft from "@/components/chat/ChatMessageLeft"; // 왼쪽 말풍선
import ChatMessageRight from "@/components/chat/ChatMessageRight"; // 오른쪽 말풍선
import ReportModal from "@/components/chat/ReportModal"; // 신고 모달 임포트
import { getProfileComponent } from "@/utils/getProfileComponent"; // 프로필 변환 함수 임포트
import useHomeStore from "@/zustand/stores/HomeStore"; // HomeStore import 추가
import useAuthStore from "@/zustand/stores/authStore"; // 현재 사용자 정보 가져오기
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ReportModal props가 아직 없으므로 임시 타입 정의
interface ReportModalProps {
  visible: boolean;
  onSubmitReport: (reason: string) => void;
  onDismiss: () => void;
  themeId?: number;
}

// 신고 페이지에서 사용할 메시지 타입 (isChecked와 memberId 포함)
interface ReportableChatMessage extends ReportChatMessageDto {
  isChecked: boolean;
  nickName: string | null;
  profileImageUri?: string; // 프로필 이미지 URI (SVG 또는 일반 이미지)
}

// 사용자 정보를 담을 타입
interface ParticipantInfo {
  nickname: string;
  profile: string;
}

const ChatReportPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatRoomId = params.id ? parseInt(params.id as string) : null;
  const themeId = useHomeStore((state) => state.curThemeId) || 1; // HomeStore에서 curThemeId 가져오기
  const myMemberId = useAuthStore((state) => state.memberId); // 현재 사용자 ID

  const [messages, setMessages] = useState<ReportableChatMessage[]>([]);
  const [participants, setParticipants] = useState<Map<number, ParticipantInfo>>(new Map());
  const [page, setPage] = useState(1); // 페이지 번호 상태 (1부터 시작하도록 수정)
  const [hasNextPage, setHasNextPage] = useState(true); // 다음 페이지 존재 여부 상태 추가
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태는 true로 설정
  const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 로딩 상태
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // API를 통해 채팅 메시지 로드 (페이지네이션 적용)
  const fetchMessages = useCallback(async () => {
    if (isFetchingMore || !hasNextPage) return;
    if (page > 1) setIsFetchingMore(true);

    try {
      const chatRoomData = await getChatRoomDetailsForReport({
        chatRoomId: chatRoomId!,
        page,
        size: 30,
      });

      // 참여자 정보 업데이트 (최초 한 번만 실행되도록)
      if (page === 1) {
        const newParticipants = new Map<number, ParticipantInfo>();
        chatRoomData.chatParts.forEach(p => {
          newParticipants.set(p.memberId, { nickname: p.nickname, profile: p.profile });
        });
        setParticipants(newParticipants);
      }
      
      const newMessages = chatRoomData.chats.content.map((chat) => ({
        ...chat,
        isChecked: false,
      }));

      setMessages((prev) => [...newMessages, ...prev]);
      setPage((prev) => prev + 1);
      setHasNextPage(!chatRoomData.chats.last);
    } catch (err: any) {
      console.error("Failed to fetch chat messages for report:", err);
      setError(err.message || "메시지를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [chatRoomId, page, hasNextPage, isFetchingMore]);

  useEffect(() => {
    if (chatRoomId) {
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatRoomId]);

  // 메시지 체크 상태 토글 함수
  const toggleCheck = (chatId: number) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.chatId === chatId
          ? { ...message, isChecked: !message.isChecked }
          : message
      )
    );
  };

  const getSelectedMessages = () => messages.filter(msg => msg.isChecked);

  const handleReportSubmit = async (reasonCode: string[]) => {
    // 모달을 닫고, 이유가 선택되지 않았으면 여기서 중단
    setShowReportModal(false);
    if (reasonCode.length === 0) {
      return;
    }

    const selectedMessages = getSelectedMessages();
    if (selectedMessages.length === 0 || !chatRoomId) {
      Alert.alert("오류", "신고할 메시지를 선택해주세요 또는 채팅방 ID가 유효하지 않습니다.");
      return;
    }

    const reportData: ReportCreationDto = {
      reportReason: reasonCode[0],
      reporterId: myMemberId!,
      chatReports: selectedMessages.map(msg => ({ chatId: msg.chatId })),
      reportedMemberIds: Array.from(new Set(selectedMessages.map(msg => msg.memberId))),
    };

    console.log("Submitting report with data:", JSON.stringify(reportData, null, 2));
    
    try {
      setIsLoading(true);
      await createReport(reportData);
      Alert.alert("신고 완료", "신고가 성공적으로 접수되었습니다.", [
        { text: "확인", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error("Error creating report:", err);
      const errorMessage = err.fieldErrors 
        ? Object.values(err.fieldErrors).join('\\n') 
        : err.message || "신고 중 오류가 발생했습니다.";
      Alert.alert("신고 실패", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmSelection = () => {
    if (getSelectedMessages().length > 0) {
      setShowReportModal(true);
    } else {
      Alert.alert("알림", "신고할 메시지를 하나 이상 선택해주세요.");
    }
  };

  // 각 메시지 렌더링 함수
  const renderMessageItem = (message: ReportableChatMessage) => {
    const isMyMessage = message.memberId === myMemberId;
    const senderInfo = participants.get(message.memberId);
    
    const messageProps = {
        message: message.message,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nickname: senderInfo?.nickname || "알 수 없는 사용자",
        profileImage: getProfileComponent(senderInfo?.profile), // 프로필 이름으로 SVG 컴포넌트 가져오기
    };

    return (
      <View style={styles.messageRow}>
        {!isMyMessage && (
            <TouchableOpacity style={styles.checkCircle} onPress={() => toggleCheck(message.chatId)}>
                {message.isChecked ? <Ionicons name="checkmark-circle" size={24} color="#EF5A52" /> : <Ionicons name="ellipse-outline" size={24} color="#CCCCCC" />}
            </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
            {isMyMessage ? (
                <ChatMessageRight {...messageProps} />
            ) : (
                <ChatMessageLeft {...messageProps} />
            )}
        </View>
        {isMyMessage && (
            <TouchableOpacity style={styles.checkCircle} onPress={() => toggleCheck(message.chatId)}>
                {message.isChecked ? <Ionicons name="checkmark-circle" size={24} color="#EF5A52" /> : <Ionicons name="ellipse-outline" size={24} color="#CCCCCC" />}
            </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={themeId === 2 ? "#6DA0E1" : "#D9B2D3"} />
        <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>오류: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
            <Text style={styles.retryButtonText}>재시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!chatRoomId) {
    return (
        <View style={styles.centered}>
            <Text style={styles.errorText}>채팅방 정보를 찾을 수 없습니다.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                <Text style={styles.retryButtonText}>뒤로가기</Text>
            </TouchableOpacity>
        </View>
    );
  }

  const titleColor = themeId === 2 ? "#5C5279" : "#984A78";
  const confirmButtonColor = themeId === 2 ? "#6DA0E1" : "#D9B2D3";
  const hasCheckedMessages = getSelectedMessages().length > 0;

  return (
    <View style={styles.pageContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={titleColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: titleColor }]}>신고할 메시지 선택</Text>
        <View style={{ width: 24 }} />{/* 오른쪽 정렬을 위한 빈 공간 */}
      </View>

      <FlatList
        inverted
        data={[...messages].reverse()} // Inverted FlatList는 데이터 순서도 뒤집어야 함
        renderItem={({ item }) => renderMessageItem(item)}
        keyExtractor={(item) => item.chatId.toString()}
        contentContainerStyle={styles.scrollContainer}
        onEndReached={fetchMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ marginVertical: 10 }} size="small" color={themeId === 2 ? "#6DA0E1" : "#D9B2D3"} /> : null}
        ListEmptyComponent={() => (
          !isLoading && (
            <View style={styles.centered}>
              <Text style={styles.noMessagesText}>표시할 메시지가 없습니다.</Text>
            </View>
          )
        )}
      />
      
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.footerButton,
            styles.confirmButton,
            { backgroundColor: confirmButtonColor },
            !hasCheckedMessages && styles.disabledButton,
          ]}
          onPress={handleConfirmSelection}
          disabled={!hasCheckedMessages || isLoading}
        >
          <Text style={styles.footerButtonText}>신고하기</Text>
        </Pressable>
      </View>

      <ReportModal
        visible={showReportModal}
        onSubmitReport={handleReportSubmit}
        onDismiss={() => setShowReportModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    height: SCREEN_HEIGHT * 0.08,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: '#555555',
  },
  scrollContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  noMessagesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888888',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkCircle: {
    paddingHorizontal: 8,
  },
  footer: {
    padding: SCREEN_WIDTH * 0.04,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    paddingBottom: 30, // SafeArea 고려
  },
  footerButton: {
    paddingVertical: SCREEN_HEIGHT * 0.018,
    borderRadius: SCREEN_WIDTH * 0.03,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButton: {
    // backgroundColor는 동적으로 설정
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ChatReportPage; 