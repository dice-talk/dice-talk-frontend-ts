import { getChatRoomInfo, getCurrentChatRoomId } from "@/api/ChatApi"; // getCurrentChatRoomId 추가
import ChatCustomButton from "@/components/chat/ChatCustomButton";
import ChatMain from "@/components/chat/ChatMain";
import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent"; // HomeStore는 이미 아래에서 chatRoomIdFromHomeStore로 사용됩니다.
import useChat from '@/utils/useChat'; // useChat 훅 import
import useChatNotificationStore from "@/zustand/stores/chatNotificationStore";
import useChatRoomStore from "@/zustand/stores/ChatRoomStore";
import useHomeStore, { useHomeActions } from "@/zustand/stores/HomeStore";
import { useFocusEffect, useRouter } from "expo-router"; // useFocusEffect 추가
import { useCallback, useEffect, useMemo, useState } from "react"; // useCallback 추가w
import { CHAT_ROOM_END_OFFSET } from "@/constants/chatEventTimes"; // 채팅방 총 시간 상수 임포트
import { Dimensions, StyleSheet, Text, View } from "react-native";

export default function Chat() {
  const router = useRouter();
  const setHasUnread = useChatNotificationStore((state) => state.setHasUnread);
  const noticesFromStore = useHomeStore((state) => state.notices);
  // HomeStore에서 chatRoomId를 가져옵니다.
  const chatRoomIdFromHomeStore : number | null = useHomeStore((state) => state.chatRoomId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
  const { setCurThemeId, setChatRoomId: setHomeChatRoomId } = useHomeActions(); // setCurThemeId 추가
  // 예시: const setHomeChatRoomId = useHomeStore(state => state.setChatRoomId);

  const [error, setError] = useState<string | null>(null);

  // ChatRoomStore의 상태 및 액션은 채팅방 상세 정보(테마, 남은 시간 등) 관리에 계속 사용됩니다.
  const themeIdFromStore = useChatRoomStore((state) => state.themeId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
  const roomStatusFromChatRoomStore = useChatRoomStore((state) => state.roomStatus);
  // actions 객체가 안정적인 참조를 반환하도록 보장해야 합니다.
  // 예시: const setChatRoomDetails = useChatRoomStore(state => state.setChatRoomDetails);
  // 예시: const setRemainingTimeForTimer = useChatRoomStore(state => state.setRemainingTimeForTimer);
  const { setChatRoomDetails, setRemainingTimeForTimer } = useChatRoomStore((state) => state.actions);

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
      // [추가] 화면에 들어오면 '읽지 않음' 상태를 해제합니다.
      setHasUnread(false);

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

              // 타이머 로직
              // createdAt (예: "YYYY-MM-DD HH:MM:SS")이 UTC 시간 문자열이라고 가정합니다.
              // 'Z'를 추가하여 JavaScript Date 객체가 이를 UTC로 명시적으로 파싱하도록 합니다.
              // 이렇게 하지 않으면, 클라이언트의 로컬 시간대(예: KST)로 해석되어
              // UTC와의 시간 차이(KST의 경우 +9시간)만큼 오차가 발생하여 타이머가 짧게 표시될 수 있습니다.
              const createdAtUTC = detailedRoomInfo.createdAt.replace(' ', 'T') + 'Z';
              const localDate = new Date(createdAtUTC);
              const roomCreationTime = localDate.getTime();
              const currentTime = Date.now();
              const elapsedTimeSeconds = Math.floor((currentTime - roomCreationTime) / 1000);

              if (elapsedTimeSeconds >= CHAT_ROOM_END_OFFSET) {
                // 방이 49시간 경과로 만료됨
                if (isActive) {
                  console.log(`[ChatIndex] Room ${currentFetchedRoomId} has expired. Elapsed: ${elapsedTimeSeconds}s. Max lifespan: ${CHAT_ROOM_END_OFFSET}s.`);
                  setHomeChatRoomId(0); // HomeStore에서 방이 없는 것으로 처리
                  setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
                  setRemainingTimeForTimer(null); // 타이머 정보 없음
                  setError(null); // 오류 상태는 아님
                }
              } else {
                // 방이 아직 유효함
                let timeLeftSeconds = CHAT_ROOM_END_OFFSET - elapsedTimeSeconds;
                timeLeftSeconds = Math.max(0, timeLeftSeconds);
                setRemainingTimeForTimer(timeLeftSeconds); // ChatRoomStore의 타이머 업데이트
                // HomeStore의 chatRoomId는 currentFetchedRoomId로 이미 설정되어 있어야 함
                setCurThemeId(detailedRoomInfo.themeId ?? 1); // HomeStore의 curThemeId 업데이트
                // ChatRoomStore의 상세 정보는 getChatRoomInfo에 의해 이미 업데이트됨
                setError(null);
              }
            } else if (detailedRoomInfo && detailedRoomInfo.chatRoomId === 0) {
              // getChatRoomInfo가 chatRoomId: 0을 반환한 경우 (예: 방이 방금 종료됨 또는 isPossible에서 false 반환 후 getChatRoomInfo가 0을 반환)
              console.warn(`[ChatIndex] Discrepancy or expected no room: getCurrentChatRoomId gave ${currentFetchedRoomId}, but getChatRoomInfo resulted in chatRoomId 0.`);
              setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
              setRemainingTimeForTimer(null);
              // HomeStore는 getCurrentChatRoomId에서 이미 0으로 설정되었을 수 있음 (만약 isPossible=false이고 chatRoomId=0인 경우)
              setCurThemeId(1); // 방이 없으므로 기본 테마로 설정
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
              setCurThemeId(1); // 오류 발생 시 기본 테마로 설정
            }
          } else {
            // getCurrentChatRoomId가 null 또는 0을 반환한 경우 (참여 중인 채팅방 없음)
            // getCurrentChatRoomId 내부에서 ChatRoomStore.chatRoomId와 HomeStore.chatRoomId는 이미 null 또는 0으로 설정됨
            setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
            setRemainingTimeForTimer(null);
            setCurThemeId(1); // 참여중인 방이 없으므로 기본 테마로 설정
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
            setCurThemeId(1); // 오류 발생 시 기본 테마로 설정
          }
        }
      };

      fetchChatData(); // fetchChatData 함수 호출

      return () => { isActive = false; }; // 클린업 함수
    }, [setCurThemeId, setHomeChatRoomId, setChatRoomDetails, setRemainingTimeForTimer, setHasUnread]) // Zustand setter 함수들은 참조가 안정적이라고 가정
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
              (async () => { // 비동기 로직을 위해 async 함수로 변경
                if (chatRoomIdFromHomeStore && chatRoomIdFromHomeStore !== 0) { // HomeStore의 ID 사용
                  try {
                    // getChatRoomInfo를 호출하여 모든 채팅방 상세 정보(메시지 포함)를 가져오고 ChatRoomStore를 업데이트합니다.
                    const roomDetails = await getChatRoomInfo(); // <-- 이 부분이 요청하신 내용입니다.

                    if (roomDetails) { // roomDetails가 성공적으로 불러와졌는지 확인
                      router.push({
                        pathname: '/chat/ChatRoom',
                        params: { chatRoomId: String(chatRoomIdFromHomeStore), themeId: String(themeIdFromStore || 1) },
                      });
                    } else {
                      alert("채팅방 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.");
                      console.error("Failed to fetch room details via getChatRoomInfo.");
                    }
                  } catch (loadError) {
                    console.error("채팅 메시지 로드 실패:", loadError);
                    alert("채팅 메시지를 불러오는 데 실패했습니다. 다시 시도해주세요.");
                  }
                } else if (!error) {
                  alert("참여할 채팅방이 없습니다. 새로운 채팅방을 찾아보세요.");
                } else {
                  alert("참여할 수 있는 채팅방이 없습니다. 잠시 후 다시 시도해주세요.");
                  console.warn("입장 버튼 클릭: 참여할 방 없음 또는 오류 발생. Error state:", error);
                }
              })(); // 즉시 실행
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