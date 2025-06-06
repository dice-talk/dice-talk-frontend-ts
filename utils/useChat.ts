import useAuthStore from '@/zustand/stores/authStore'; // AuthStore import
import useChatRoomStore from '@/zustand/stores/ChatRoomStore';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useState } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import SockJS from 'sockjs-client';

export default function useChat(roomId: number) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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

  // 예시 인터페이스 (메시지 타입)
  interface MessageData {
    id: number;
    content: string;
    sender: string;
    timestamp: string;
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

  // 웹소켓 연결
  useEffect(() => {
    const socket = new SockJS('https://www.dicetalk.co.kr/ws-stomp');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`, 
        // (서버 코드에서 헤더 이름을 "Authorization"으로 감지하고 있으면 이대로,
        //  다르면 StompHandler가 보고 있는 헤더 키 이름과 일치시켜 주세요)
      },
      onConnect: () => {
        console.log('✅ STOMP 연결 성공');
        setIsConnected(true);
        
        // 채팅방 구독
        stompClient.subscribe(`/sub/chat/${roomId}`, (message) => {
          console.log('📨 메시지 수신:', message.body);
          const receivedMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        });
      },
      onDisconnect: () => {
        console.log('❌ STOMP 연결 종료');
        setIsConnected(false);
      },
      onStompError: (error) => {
        console.error('⚠️ STOMP 에러:', error);
        setIsConnected(false);
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [roomId]);

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
      console.log('⚠️ 메시지 전송 실패: STOMP가 연결되지 않음');
    }
  }, [client, isConnected, currentUserNickname]);

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
    }
  }, [client, isConnected]);

  // 메시지 수정
  const editMessage = useCallback((messageId: number, newContent: string) => {
    if (client && isConnected) {
      const editData = {
        type: 'edit',
        messageId,
        content: newContent,
      };
      client.publish({
        destination: `/pub/chat/message`,
        body: JSON.stringify(editData)
      });
    }
  }, [client, isConnected]);

  const handlePress = (): void => {
    if (roomId && roomId !== 0) {
      // ...
    }
  };

  return {
    messages,
    isConnected,
    sendMessage,
    deleteMessage,
    editMessage,
    handlePress,
  };
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