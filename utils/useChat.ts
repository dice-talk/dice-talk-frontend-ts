import useAuthStore from '@/zustand/stores/authStore'; // AuthStore import
import useChatRoomStore, { ChatMessage } from '@/zustand/stores/ChatRoomStore';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import SockJS from 'sockjs-client';
import { joinMatchingQueue } from '@/api/MatchingApi';
interface UseChatOptions {
  autoConnect?: boolean;
}

export default function useChat(roomId?: number | null, initialMessages: ChatMessage[] = [], options: UseChatOptions = {}) {

  const { autoConnect = true } = options; // 기본값은 true

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newMessagesArrived, setNewMessagesArrived] = useState(false);
  // ① joinQueue 구현 (한 번만 대기열 등록)
  const joinQueue = useCallback(async () => {
    try {
      console.log('useChat: joinQueue – 대기열 등록 HTTP 요청');
      const result = await joinMatchingQueue();
      console.log('useChat: joinQueue 결과', result);
      // 결과 처리(성공 시 바로 채팅방 이동 로직이 있으면 여기에 둘 수도 있음)
    } catch (err) {
      console.error('useChat: joinQueue 오류', err);
    }
  }, []);

  // ① 대기열 상태를 담을 상태 추가
  const [queueStatus, setQueueStatus] = useState<{
    count: number;
    participants: string[];
    message: string;
  }>({ count: 0, participants: [], message: '' });

  type ChatError = {
    message: string;
    code?: string;
  } | null;

  // AuthStore에서 토큰 가져오기
  const token = useAuthStore((state) => state.accessToken);
  const chatParts = useChatRoomStore((state) => state.chatParts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError>(null);

  // 현재 사용자의 닉네임 찾기
  const currentUserNickname = chatParts.find(part => part.memberId === useAuthStore.getState().memberId)?.nickname || '알 수 없음';

  useEffect(() => {
    setNewMessagesArrived(false);
  }, [initialMessages]);

  useEffect(() => {
    if (client && isConnected) {
      // 매칭 상태 토픽 구독
      const sub = client.subscribe('/sub/matching/status', frame => {
        const data = JSON.parse(frame.body);
        if (data.type === 'QUEUE_STATUS') {
          setQueueStatus({
            count: data.participants.length,
            participants: data.participants,
            message: data.message,
          });
        }
      });
      return () => sub.unsubscribe();
    }
  }, [client, isConnected]);

  // 예시 인터페이스 (메시지 타입)
  interface MessageData {
    chatId: number;
    memberId: number;
    nickname: string;
    message: string;
    createdAt: string;
  }

  // 추가 필요:
  interface ChatRoomResponse {
    chatRoomId: number;
    themeId: number;
    createdAt: string;
    roomType: string;
    themeName: string;
    chats: Chat[];
    chatParts: ChatPart[];
    roomEvents: RoomEvent[];
  }

  interface Chat {
    // 채팅 메시지 타입 정의
  }

  interface ChatPart {
    // 채팅 파트 타입 정의
  }

  interface RoomEvent {
    // 룸 이벤트 타입 정의
  }

  // 웹소켓 연결 함수
  const connectSocket = useCallback(async () => {
    if (!token) {
      console.warn('useChat: connectSocket - No auth token, connection not attempted.');
      console.warn('useChat: 인증 토큰이 없어 연결을 시도하지 않습니다.');
      setError({ message: '인증 토큰이 필요합니다.' });
      setIsLoading(false);
      return;
    }
    if (client?.active) {
      console.log('useChat: 이미 STOMP 클라이언트가 활성화되어 있거나 연결 중입니다.');
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log('useChat: connectSocket - Attempting STOMP connection...');

    const newSocket = new SockJS('https://www.dicetalk.co.kr/ws-stomp');
    // const newSocket = new SockJS('http://192.168.0.30:8080/ws-stomp');
    const stompClientInstance = new Client({
      webSocketFactory: () => newSocket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log('✅ useChat: connectSocket - STOMP connection successful.');
        setIsConnected(true);
        setClient(stompClientInstance);
        setIsLoading(false);

        // 채팅방 구독 (roomId가 있을 때)
        if (roomId) {
          stompClientInstance.subscribe(`/sub/chat/${roomId}`, (message) => {
            console.log('📨 메시지 수신:', message.body);
            setNewMessagesArrived(true);
            const receivedMessage: ChatMessage = JSON.parse(message.body);

            // ChatRoomStore의 chats 배열 업데이트
            // 현재 useChat 인스턴스의 roomId와 ChatRoomStore의 chatRoomId가 일치할 때만 업데이트
            const currentRoomIdInStore = useChatRoomStore.getState().chatRoomId;
            if (currentRoomIdInStore === roomId) {
              const { chats: currentChatsInStore, actions: chatRoomActions } = useChatRoomStore.getState();
              // 중복 추가 방지
              if (!currentChatsInStore.some(m => m.chatId === receivedMessage.chatId)) {
                // setChatRoomDetails가 부분 업데이트를 지원한다고 가정
                chatRoomActions.setChatRoomDetails({ chats: [...currentChatsInStore, receivedMessage] });
              }
            } else {
              console.warn(`[useChat] 수신된 메시지 (roomId: ${roomId})가 ChatRoomStore의 현재 채팅방 ID (${currentRoomIdInStore})와 다릅니다. 스토어는 업데이트되지 않았습니다.`);
            }

            // useChat 훅의 내부 messages 상태 업데이트 (ChatRoom.tsx에서 직접 사용)
            setMessages(prev =>
              prev.some(m => m.chatId === receivedMessage.chatId) ? prev : [...prev, receivedMessage]
            );
          });
        }
      },
      onDisconnect: () => {
        console.log('❌ useChat: connectSocket - STOMP connection closed.');
        setIsConnected(false);
        // setClient(null); // 필요에 따라 클라이언트 상태 초기화
        setIsLoading(false);
      },
      onStompError: (frame) => {
        console.error('⚠️ useChat: connectSocket - STOMP error:', frame.headers?.message || 'Unknown STOMP error', frame.body);
        setIsConnected(false);
        setError({ message: frame.headers?.message || 'STOMP 연결 중 오류가 발생했습니다.', code: frame.headers?.['error-code'] });
        setIsLoading(false);
      },
      debug: (str) => {
        // console.log('STOMP DEBUG: ', str); // 개발 중 상세 로그 필요시 활성화
      }
    });

    stompClientInstance.activate();
  }, [token, roomId, client]); // client 의존성 추가

  useEffect(() => {
    if (autoConnect && !client?.active && token) { // 토큰이 있을 때만 자동 연결 시도
      console.log('useChat: useEffect[autoConnect, token] - Calling connectSocket.');
      connectSocket();
    }

    return () => {
      if (client?.active) {
        console.log('useChat: 컴포넌트 언마운트 또는 autoConnect 변경, STOMP 연결 해제 시도');
        client.deactivate();
        setIsConnected(false);
        setClient(null);
      }
    };
  }, [autoConnect, connectSocket, client, token]); // token 의존성 추가

  // 메시지 전송
  const sendMessage = useCallback((message: string) => {
    if (client && isConnected) {
      console.log('📤 메시지 전송 시도:', message);
      client.publish({
        destination: `/pub/chat/${roomId}/sendMessage`,
        body: JSON.stringify({
          chatRoomId: roomId,
          message: message,
          nickname: currentUserNickname,
          memberId: useAuthStore.getState().memberId,
        })
      });
      console.log('✅ 메시지 전송 완료');
    } else {
      console.warn('⚠️ 메시지 전송 실패: STOMP 미연결 또는 roomId 없음');
      setError({ message: '메시지를 보내려면 먼저 연결해야 합니다.' });
    }
  }, [client, isConnected, currentUserNickname, roomId]);

  // 메시지 삭제
  const deleteMessage = useCallback((messageId: number) => {
    if (client && isConnected) {
      const deleteData = {
        type: 'delete',
        messageId,
      };
      client.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify(deleteData)
      });
    } else {
      console.warn('⚠️ 메시지 삭제 실패: STOMP 미연결');
    }
  }, [client, isConnected]);

  return {
    client,
    messages,
    isConnected,
    joinQueue,
    sendMessage,
    deleteMessage,
    newMessagesArrived,
    setNewMessagesArrived, // 추가
    queueStatus,
    connect: autoConnect ? undefined : connectSocket, // autoConnect가 false일 때만 connect 함수 제공
    error,
    isLoading,
  };
}

// 반환 타입 정의 (선택 사항이지만 권장)
export interface UseChatReturnType {
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (message: string) => void;
  deleteMessage: (messageId: number) => void;
  newMessagesArrived: boolean;
  setNewMessagesArrived: React.Dispatch<React.SetStateAction<boolean>>; // 추가
  connect?: () => Promise<void>; // connect 함수는 선택적이며 Promise를 반환할 수 있음
  error: { message: string; code?: string; } | null;
  isLoading: boolean;
}

type Styles = {
  container: ViewStyle;
  chatMainContainer: ViewStyle;
  time: TextStyle;
  loadingContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  noChatRoomContainer: ViewStyle;
  noChatRoomText: TextStyle;
};
