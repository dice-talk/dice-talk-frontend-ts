import { getChatRoomInfo } from "@/api/ChatApi"; // getCurrentChatRoomId 제거
import ChatCustomButton from "@/components/chat/ChatCustomButton";
import ChatMain from "@/components/chat/ChatMain";
import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent"; // HomeStore는 이미 아래에서 chatRoomIdFromHomeStore로 사용됩니다.
import useChat from '@/utils/useChat'; // useChat 훅 import
import useChatRoomStore, { ChatRoomDetails } from "@/zustand/stores/ChatRoomStore"; // ChatRoomDetails 임포트 추가
import useHomeStore, { useHomeActions } from "@/zustand/stores/HomeStore";
import { useRouter } from "expo-router"; // useFocusEffect 제거
import { useEffect, useMemo, useState } from "react"; // useCallback 제거 (useEffect 내부에서 직접 함수 정의), useEffect 추가
import { ActivityIndicator, Button, Dimensions, StyleSheet, Text, View } from "react-native";

export default function Chat() {
  const router = useRouter();
  const noticesFromStore = useHomeStore((state) => state.notices);
  // HomeStore에서 chatRoomId를 가져옵니다.
  const chatRoomIdFromHomeStore = useHomeStore((state) => state.chatRoomId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
  // useHomeActions 훅이 안정적인 참조를 반환하도록 보장해야 합니다.
  // 예시: const setHomeChatRoomId = useHomeStore(state => state.setChatRoomId);
  const { setChatRoomId: setHomeChatRoomId } = useHomeActions();

  const [error, setError] = useState<string | null>(null);

  // ChatRoomStore의 상태 및 액션은 채팅방 상세 정보(테마, 남은 시간 등) 관리에 계속 사용됩니다.
  const themeIdFromStore = useChatRoomStore((state) => state.themeId);
  // Zustand 액션 함수들의 참조 안정성을 위해 직접 선택하거나,
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

  // chatRoomIdFromHomeStore 또는 관련 setter 함수들이 변경될 때마다 실행
  useEffect(() => {
    let isActive = true; // 컴포넌트 언마운트 시 상태 업데이트 방지

      const fetchChatData = async () => {
        setError(null);
        // ChatRoomStore 상태 초기화 (HomeStore의 chatRoomId는 유지)
        // ChatRoomStore를 업데이트하기 전에 이전 상태를 클리어합니다.
        setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
        setRemainingTimeForTimer(null);

        try {
          if (!isActive) return; // 컴포넌트 언마운트 시 중단

          // chatRoomIdFromHomeStore 값과 관계없이 항상 getChatRoomInfo 호출
          // getChatRoomInfo API는 내부적으로 HomeStore의 chatRoomId를 사용하거나,
          // null 또는 0과 같은 값을 적절히 처리할 수 있어야 합니다.
          const detailedRoomInfo = await getChatRoomInfo();
          if (!isActive) return;

          if (detailedRoomInfo && detailedRoomInfo.chatRoomId === 0) {
            // Case 1: API 응답의 chatRoomId가 0인 경우 ("참여중인 채팅방이 없습니다." 표시)
            if (isActive) {
              setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
              setRemainingTimeForTimer(null);
              setHomeChatRoomId(0); // HomeStore의 ID를 0으로 설정
              setError(null);       // 에러 상태는 없음
            }
          } else if (detailedRoomInfo && typeof detailedRoomInfo.createdAt === 'string' && detailedRoomInfo.chatRoomId) {
            // Case 2: 유효한 채팅방 정보 (chatRoomId가 0이 아님)를 성공적으로 가져온 경우
            // 유효한 채팅방 정보를 성공적으로 가져온 경우
            setChatRoomDetails(detailedRoomInfo as ChatRoomDetails); // ChatRoomStore에 방 정보 저장

            // HomeStore의 chatRoomId를 API 응답의 ID와 동기화
            if (chatRoomIdFromHomeStore !== detailedRoomInfo.chatRoomId) {
              setHomeChatRoomId(detailedRoomInfo.chatRoomId); // 실제 채팅방 ID로 설정
            }
            // 타이머 로직
            const localDate = new Date(detailedRoomInfo.createdAt.replace(' ', 'T'));
            const kstDate = new Date(localDate.getTime() + (9 * 60 * 60 * 1000)); // KST 변환
            const roomCreationTime = kstDate.getTime();
            const currentTime = Date.now();
            const elapsedTimeSeconds = (currentTime - roomCreationTime) / 1000;
            let timeLeftSeconds = CHAT_ROOM_VALID_DURATION_SECONDS - elapsedTimeSeconds;
            timeLeftSeconds = Math.max(0, timeLeftSeconds); // 0 미만이면 0으로
            setRemainingTimeForTimer(timeLeftSeconds); // ChatRoomStore에 남은 시간 저장
            setError(null); // 성공 시 이전 오류 메시지 제거
          } else {
            // Case 3: getChatRoomInfo가 null을 반환했거나 (예: HomeStore의 ID가 null이었음),
            // 또는 응답 데이터 형식이 올바르지 않은 경우 (chatRoomId가 0인 경우는 이미 위에서 처리됨)
            // ChatRoomStore 초기화
            setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
            setRemainingTimeForTimer(null);
            if (isActive) {
              setHomeChatRoomId(0); // UI는 "참여중인 방 없음" 또는 에러를 표시하도록 ID를 0으로 설정
              setError(`채팅방 정보를 가져올 수 없거나 형식이 올바르지 않습니다.`);
            }
          }
        } catch (apiError) {
          console.error("API 호출 오류 (fetchChatData):", apiError);
          if (isActive) {
            setError("채팅 상태를 확인하는 중 오류가 발생했습니다.");
            setHomeChatRoomId(0); // 오류 발생 시, HomeStore의 chatRoomId를 0으로 설정
          }
        }
      };
      fetchChatData();

      return () => { isActive = false; }; // 클린업 함수
  }, [
        chatRoomIdFromHomeStore, // HomeStore의 ID가 변경되면 재실행
        setHomeChatRoomId,       // HomeStore 액션 (참조 안정성 중요)
        setChatRoomDetails,      // ChatRoomStore 액션 (참조 안정성 중요)
        setRemainingTimeForTimer // ChatRoomStore 액션 (참조 안정성 중요)
  ]);
  
  // 테스트용 useChat 훅 사용 (roomId: 1로 고정)
  const { messages, isConnected, sendMessage } = useChat(4);

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
      ) : chatRoomIdFromHomeStore === 0 ? ( // HomeStore의 chatRoomId가 0이면 참여 중인 방이 없음
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