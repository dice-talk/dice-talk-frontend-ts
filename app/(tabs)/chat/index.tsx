import { getCurrentChatRoomId, getChatRoomInfo } from "@/api/ChatApi"; // getCurrentChatRoomId 추가
import ChatCustomButton from "@/components/chat/ChatCustomButton";
import ChatMain from "@/components/chat/ChatMain";
import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent"; // HomeStore는 이미 아래에서 chatRoomIdFromHomeStore로 사용됩니다.
import useChat from '@/utils/useChat'; // useChat 훅 import
import useChatRoomStore, { ChatRoomDetails } from "@/zustand/stores/ChatRoomStore"; 
import useHomeStore, { useHomeActions } from "@/zustand/stores/HomeStore";
import { useRouter, useFocusEffect } from "expo-router"; // useFocusEffect 추가
import { useCallback, useEffect, useMemo, useState } from "react"; // useCallback 추가w
import { Dimensions, StyleSheet, Text, View } from "react-native";

export default function Chat() {
  const router = useRouter();
  const noticesFromStore = useHomeStore((state) => state.notices);
  // HomeStore에서 chatRoomId를 가져옵니다.
  const chatRoomIdFromHomeStore : number | null = useHomeStore((state) => state.chatRoomId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
  // useHomeActions 훅이 안정적인 참조를 반환하도록 보장해야 합니다.
  // 예시: const setHomeChatRoomId = useHomeStore(state => state.setChatRoomId);
  const { setChatRoomId: setHomeChatRoomId } = useHomeActions();

  const [error, setError] = useState<string | null>(null);

  // ChatRoomStore의 상태 및 액션은 채팅방 상세 정보(테마, 남은 시간 등) 관리에 계속 사용됩니다.
  const themeIdFromStore = useChatRoomStore((state) => state.themeId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
  const roomStatusFromChatRoomStore = useChatRoomStore((state) => state.roomStatus);
  // actions 객체가 안정적인 참조를 반환하도록 보장해야 합니다.
  // 예시: const setChatRoomDetails = useChatRoomStore(state => state.setChatRoomDetails);
  // 예시: const setRemainingTimeForTimer = useChatRoomStore(state => state.setRemainingTimeForTimer);
  const { setChatRoomDetails, setRemainingTimeForTimer } = useChatRoomStore((state) => state.actions);

  const CHAT_ROOM_VALID_DURATION_SECONDS = 48 * 60 * 60; // 채팅방 유효 기간 (48시간)

  const eventBannersForDisplay: EventBannerData[] = useMemo(() => {
    if (!noticesFromStore) return [];

    return noticesFromStore
      .filter(notice =>
        notice.noticeStatus === "ONGOING" &&
        notice.noticeType === "EVENT" &&
        notice.noticeImages.some(img => img.thumbnail === true)
      )
      .map(notice => {
        const thumbnailImage = notice.noticeImages.find(img => img.thumbnail === true);
        return {
          id: notice.noticeId,
          imageUrl: thumbnailImage!.imageUrl,
          title: notice.title,
          content: notice.content, // EventBannerData에 필요한 content 속성 추가
        };
      });
  }, [noticesFromStore]);

  // 화면이 포커스될 때마다 실행
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // 컴포넌트 언마운트 또는 포커스 아웃 시 상태 업데이트 방지

      const fetchChatData = async () => {
        console.log('[ChatIndex] Screen focused, fetching chat data...');
        setError(null);
        // ChatRoomStore를 업데이트하기 전에 이전 상태를 클리어할 수 있습니다.
        // 필요에 따라 이 부분을 유지하거나, API 호출 결과에 따라 선택적으로 클리어할 수 있습니다.
        // setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
        // setRemainingTimeForTimer(null);

        try {
          // 1. 현재 채팅방 ID를 가져옵니다. 이 함수는 내부적으로 ChatRoomStore와 HomeStore의 chatRoomId를 업데이트합니다.
          const currentFetchedRoomId = await getCurrentChatRoomId();
          if (!isActive) return;

          // getCurrentChatRoomId 호출 후 HomeStore의 chatRoomId가 업데이트되었으므로,
          // chatRoomIdFromHomeStore를 다시 읽거나 currentFetchedRoomId를 사용합니다.
          // 여기서는 currentFetchedRoomId를 기준으로 로직을 진행합니다.

          if (currentFetchedRoomId !== null && currentFetchedRoomId !== 0) {
            // 사용자가 채팅방에 참여 중인 경우 (currentFetchedRoomId가 실제 방 ID)
            // HomeStore는 getCurrentChatRoomId 내부에서 이미 업데이트되었습니다.

            // 2. 상세 채팅방 정보를 가져옵니다. getChatRoomInfo는 HomeStore의 chatRoomId를 사용합니다.
            // getChatRoomInfo는 HomeStore의 chatRoomId를 사용하므로, currentFetchedRoomId를 인자로 넘길 필요가 없습니다.
            const detailedRoomInfo = await getChatRoomInfo(); 
            if (!isActive) return;

            if (detailedRoomInfo && detailedRoomInfo.chatRoomId === currentFetchedRoomId && typeof detailedRoomInfo.createdAt === 'string') {
              // 성공적으로 상세 정보를 가져왔고, ID가 일치하는 경우
              // getChatRoomInfo 내부에서 ChatRoomStore의 전체 상세 정보가 업데이트됩니다.
              // HomeStore의 chatRoomId는 getCurrentChatRoomId에서 이미 설정됨.

              // 타이머 로직
              const localDate = new Date(detailedRoomInfo.createdAt.replace(' ', 'T'));
              const roomCreationTime = localDate.getTime();
              const currentTime = Date.now();
              const elapsedTimeSeconds = (currentTime - roomCreationTime) / 1000;
              let timeLeftSeconds = CHAT_ROOM_VALID_DURATION_SECONDS - elapsedTimeSeconds;
              timeLeftSeconds = Math.max(0, timeLeftSeconds);
              setRemainingTimeForTimer(timeLeftSeconds);
              setError(null);
            } else if (detailedRoomInfo && detailedRoomInfo.chatRoomId === 0) {
              // getChatRoomInfo가 chatRoomId: 0을 반환한 경우 (예: 방이 방금 종료됨 또는 isPossible에서 false 반환 후 getChatRoomInfo가 0을 반환)
              console.warn(`[ChatIndex] Discrepancy or expected no room: getCurrentChatRoomId gave ${currentFetchedRoomId}, but getChatRoomInfo resulted in chatRoomId 0.`);
              setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
              setRemainingTimeForTimer(null);
              // HomeStore는 getCurrentChatRoomId에서 이미 0으로 설정되었을 수 있음 (만약 isPossible=false이고 chatRoomId=0인 경우)
              // 또는 getChatRoomInfo가 0을 반환했으므로 HomeStore도 0으로 맞춰야 함.
              if (useHomeStore.getState().chatRoomId !== 0) {
                setHomeChatRoomId(0);
              }
              setError(null); // "참여중인 채팅방이 없습니다." 상태
            } else {
              // getChatRoomInfo가 null을 반환했거나 (오류 발생) 또는 데이터가 일관되지 않은 경우
              console.warn(`[ChatIndex] Failed to get consistent detailedRoomInfo for room ${currentFetchedRoomId}. detailedRoomInfo:`, detailedRoomInfo);
              setError("채팅방 상세 정보를 가져오는 데 문제가 발생했습니다.");
              // HomeStore는 getCurrentChatRoomId 또는 getChatRoomInfo 내부에서 이미 0 또는 null로 설정되었을 수 있음
              // 확실하게 0으로 설정
              if (useHomeStore.getState().chatRoomId !== 0) {
                setHomeChatRoomId(0);
              }
            }
          } else {
            // getCurrentChatRoomId가 null 또는 0을 반환한 경우 (참여 중인 채팅방 없음)
            // getCurrentChatRoomId 내부에서 ChatRoomStore.chatRoomId와 HomeStore.chatRoomId는 이미 null 또는 0으로 설정됨
            setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
            setRemainingTimeForTimer(null);
            // HomeStore는 getCurrentChatRoomId에서 이미 0으로 설정됨.
            setError(null); // "참여중인 채팅방이 없습니다." 상태 (오류 아님)
          }
        } catch (apiError) {
          console.error("API 호출 오류 (fetchChatData):", apiError);
          if (isActive) {
            setError("채팅 상태를 확인하는 중 오류가 발생했습니다.");
            setHomeChatRoomId(0); // 오류 발생 시, HomeStore의 chatRoomId를 0으로 설정
            setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
            setRemainingTimeForTimer(null);
          }
        }
      };

      fetchChatData();

      return () => { isActive = false; }; // 클린업 함수
    }, [setHomeChatRoomId, setChatRoomDetails, setRemainingTimeForTimer]) // Zustand setter 함수들은 참조가 안정적이라고 가정
  );
  
  // HomeStore의 chatRoomId를 사용하여 useChat 훅 사용
  const { messages, isConnected, sendMessage } = useChat(chatRoomIdFromHomeStore, [], { autoConnect: true });

  // 테스트용 로그 추가
  useEffect(() => {
    console.log('WebSocket 연결 상태:', isConnected);
  }, [isConnected]);

  useEffect(() => {
    console.log('현재 메시지 목록:', messages);
  }, [messages]);

  return (
    <View style={styles.container}>
      {eventBannersForDisplay.length > 0 && (
        <View style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0}}>
          <EventBannerComponent banners={eventBannersForDisplay} />
        </View>
      )}
      {
      error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>오류: {error}</Text>
        </View>
      ) : chatRoomIdFromHomeStore === 0 || roomStatusFromChatRoomStore === "ROOM_DEACTIVE" ? ( // HomeStore의 chatRoomId가 0이거나 ChatRoomStore의 roomStatus가 "ROOM_DEACTIVE"이면 참여 중인 방이 없음
        <View style={styles.noChatRoomContainer}>
          <Text style={styles.noChatRoomText}>참여중인 채팅방이 없습니다.</Text>
        </View>
      ) : ( // chatRoomIdFromHomeStore에 값이 있으면 기존 방 정보가 로드된 것
        <>
          <View style={styles.chatMainContainer}>
            <ChatMain />
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: height * 0.35 }}>
          <ChatCustomButton
            label="입장"
            onPress={() => {
              if (chatRoomIdFromHomeStore && chatRoomIdFromHomeStore !== 0) { // HomeStore의 ID 사용
                router.push({
                  pathname: '/chat/ChatRoom',
                  params: {
                    chatRoomId: String(chatRoomIdFromHomeStore), // HomeStore ID 사용
                    themeId: String(themeIdFromStore || 1), // ChatRoomStore의 themeId 또는 기본값
                  },
                });
              } else if (!error) { // 기존 방이 없고, API 호출 중 오류도 없었다면 새 방 참여 시도
                // 참여 중인 방이 없고 오류도 없는 경우 (예: 사용자가 아직 어떤 방에도 참여하지 않음)
                // "참여중인 채팅방이 없습니다." UI가 표시되므로, 입장 버튼이 다른 역할을 하거나 비활성화될 수 있습니다.
                alert("참여할 채팅방이 없습니다. 새로운 채팅방을 찾아보세요."); // 또는 다른 UX 제공
              } else {
                alert("참여할 수 있는 채팅방이 없습니다. 잠시 후 다시 시도해주세요.");
                console.warn("입장 버튼 클릭: 참여할 방 없음 또는 오류 발생. Error state:", error);
              }
            }}
          containerStyle={{
            marginBottom: 20,
            borderRadius: 30, // 여기서 굴곡 설정
          }}
          textStyle={{ fontSize: 18 }}
        />
          </View>
        </>
      )}
    </View>
  );
}


const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatMainContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: height * 0.7,
    bottom: width * -0.1,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    fontFamily: 'digital'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  noChatRoomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChatRoomText: {
    fontSize: 18,
    color: 'grey',
    textAlign: 'center',
  },
  testContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    padding: 20,
  },
});