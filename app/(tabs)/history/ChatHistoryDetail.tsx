import { getChatRoomDetailsForReport, ReportChatMessageDto } from "@/api/reportApi";
import DaoSvg from "@/assets/images/dice/dao.svg";
import DoriSvg from "@/assets/images/dice/dori.svg";
import HanaSvg from "@/assets/images/dice/hana.svg";
import NemoSvg from "@/assets/images/dice/nemo.svg";
import SezziSvg from "@/assets/images/dice/sezzi.svg";
import YukdaengSvg from "@/assets/images/dice/yukdaeng.svg";
import ChatMessageLeft from "@/components/chat/ChatMessageLeft";
import ChatMessageRight from "@/components/chat/ChatMessageRight";
import useAuthStore from "@/zustand/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SvgProps } from "react-native-svg";

const nicknameToSvgMap: Record<string, React.FC<SvgProps>> = {
  "한가로운 하나": HanaSvg,
  "두 얼굴의 매력 두리": DoriSvg,
  "세침한 세찌": SezziSvg,
  "네모지만 부드러운 네몽": NemoSvg,
  "단호한데 다정한 다오": DaoSvg,
  "육감적인 직감파 육땡": YukdaengSvg,
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ParticipantInfo {
  nickname: string;
  profile: string;
}

const ChatHistoryDetailPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const chatRoomId = params.chatRoomId ? parseInt(params.chatRoomId as string) : null;
  const myMemberId = useAuthStore((state) => state.memberId);

  const [messages, setMessages] = useState<ReportChatMessageDto[]>([]);
  const [participants, setParticipants] = useState<Map<number, ParticipantInfo>>(new Map());
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');

  const fetchMessages = useCallback(async () => {
    if (isFetchingMore || !hasNextPage || !chatRoomId) return;
    if (page > 1) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const chatRoomData = await getChatRoomDetailsForReport({
        chatRoomId: chatRoomId,
        page,
        size: 30,
      });

      if (page === 1) {
        setThemeName(chatRoomData.themeName || '');
        const newParticipants = new Map<number, ParticipantInfo>();
        chatRoomData.chatParts.forEach(p => {
          newParticipants.set(p.memberId, { nickname: p.nickname, profile: p.profile });
        });
        setParticipants(newParticipants);
      }
      
      const newMessages = chatRoomData.chats.content;

      setMessages((prev) => [...newMessages, ...prev]);
      setPage((prev) => prev + 1);
      setHasNextPage(!chatRoomData.chats.last);
    } catch (err: any) {
      console.error("Failed to fetch chat messages for history:", err);
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
  }, [chatRoomId]);

  const renderMessageItem = (message: ReportChatMessageDto) => {
    const isMyMessage = message.memberId === myMemberId;
    const senderInfo = participants.get(message.memberId);
    
    const nickname = senderInfo?.nickname || "알 수 없는 사용자";
    const ProfileSvg = nicknameToSvgMap[nickname] || NemoSvg;

    const messageProps = {
        message: message.message,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nickname: nickname,
        profileImage: ProfileSvg,
    };

    return (
      <View style={styles.messageRow}>
        {isMyMessage ? <ChatMessageRight {...messageProps} /> : <ChatMessageLeft {...messageProps} />}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>대화 내역을 불러오는 중...</Text>
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

  return (
    <View style={styles.pageContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{themeName || '대화 내역'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        inverted
        data={[...messages].reverse()}
        renderItem={({ item }) => renderMessageItem(item)}
        keyExtractor={(item) => item.chatId.toString()}
        contentContainerStyle={styles.scrollContainer}
        onEndReached={fetchMessages}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        ListEmptyComponent={() => (
          !isLoading && (
            <View style={styles.centered}>
              <Text style={styles.noMessagesText}>표시할 메시지가 없습니다.</Text>
            </View>
          )
        )}
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
    backgroundColor: 'white',
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#333'
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
    marginVertical: 4,
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

export default ChatHistoryDetailPage; 