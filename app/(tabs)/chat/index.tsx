import ChatCustomButton from "@/components/chat/ChatCustomButton";
import ChatMain from "@/components/chat/ChatMain";
import EventBannerComponent, { EventBannerData } from "@/components/common/EventBannerComponent";
import useHomeStore from "@/zustand/stores/HomeStore";
import { useRouter, useFocusEffect } from "expo-router"; // useFocusEffect 임포트
import React, { useMemo, useState, useCallback } from "react";
import { Dimensions, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import { getIsPossible, getChatRoomInfo } from "@/api/ChatApi"; // getChatRoomInfo 추가
import useChatRoomStore, { ChatRoomDetails } from "@/zustand/stores/ChatRoomStore"; // ChatRoomDetails 임포트 추가

export default function Chat() {
  const router = useRouter();
  const noticesFromStore = useHomeStore((state) => state.notices);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { actions } = useChatRoomStore();
  // 스토어에서 chatRoomId를 가져와서 렌더링 조건에 사용
  const chatRoomIdFromStore = useChatRoomStore((state) => state.chatRoomId);
  const themeIdFromStore = useChatRoomStore((state) => state.themeId);
  const { setChatRoomDetails, setRemainingTimeForTimer } = actions;

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
        };
      });
  }, [noticesFromStore]);

  // 화면이 포커스될 때마다 실행
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // 컴포넌트 언마운트 시 상태 업데이트 방지

      const fetchChatStatusAndRoomInfo = async () => {
        setIsLoading(true);
        setError(null);
        // 스토어 상태 초기화
        setChatRoomDetails({ chatRoomId: null, themeId: null, createdAt: null, roomType: null, themeName: null, chats: [], chatParts: [], roomEvents: [] });
        setRemainingTimeForTimer(null);

        try {
          const result = await getIsPossible(); // 이 호출이 성공하면 HTTP 200 상태로 간주

          if (!isActive) return; // 컴포넌트 언마운트 시 중단

          if (result) {
            if (result.canJoinNew === true) {
              // 새로운 방 참여 가능: 스토어는 이미 초기화된 상태.
              // "참여중인 채팅방이 없습니다"는 렌더링 로직에서 chatRoomIdFromStore === null로 판단.
            } else if (result.canJoinNew === false) {
              // canJoinNew가 false이면 항상 getChatRoomInfo(1)을 호출합니다.
              const detailedRoomInfo = await getChatRoomInfo(1); // chatRoomId를 1로 하드코딩
                if (!isActive) return;
                if (detailedRoomInfo && typeof detailedRoomInfo.createdAt === 'string') {
                  setChatRoomDetails(detailedRoomInfo as ChatRoomDetails); // 스토어에 방 정보 저장

                  // createdAt을 KST로 변환하여 시간 계산
                  const localDate = new Date(detailedRoomInfo.createdAt.replace(' ', 'T'));
                  const kstDate = new Date(localDate.getTime() + 9 * 60 * 60 * 1000);
                  const roomCreationTime = kstDate.getTime();
                  const currentTime = new Date().getTime();
                  const elapsedTimeSeconds = (currentTime - roomCreationTime) / 1000;
                  let timeLeftSeconds = CHAT_ROOM_VALID_DURATION_SECONDS - elapsedTimeSeconds;

                  timeLeftSeconds = Math.max(0, timeLeftSeconds); // 0 미만이면 0으로
                  setRemainingTimeForTimer(timeLeftSeconds); // 스토어에 남은 시간 저장
                } else {
                  // detailedRoomInfo가 없거나 createdAt이 유효하지 않은 경우
                  setError("채팅방 상세 정보(ID: 1)를 가져오거나 생성 시간을 확인하는 데 실패했습니다.");
                  // 스토어는 이미 초기화되어 chatRoomId가 null일 것이므로, 에러 메시지 또는 "참여중인 방 없음"이 표시됨
                }
            }
          } else { // getIsPossible() 결과가 null 또는 undefined인 경우
            setError("채팅 가능 여부 정보를 가져오는 데 실패했습니다.");
          }
        } catch (apiError) {
          console.error("API 호출 오류 (getIsPossible 또는 getChatRoomInfo):", apiError);
          if (isActive) setError("채팅 상태를 확인하는 중 오류가 발생했습니다.");
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchChatStatusAndRoomInfo();

      return () => { isActive = false; }; // 클린업 함수
    }, [setChatRoomDetails, setRemainingTimeForTimer]) // CHAT_ROOM_VALID_DURATION_SECONDS는 상수이므로 제거 가능
  );
  return (
    <View style={styles.container}>
      {eventBannersForDisplay.length > 0 && (
        <View style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, right: 0}}>
          <EventBannerComponent banners={eventBannersForDisplay} />
        </View>
      )}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>채팅 정보를 확인 중입니다...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>오류: {error}</Text>
        </View>
      ) : chatRoomIdFromStore === null ? ( // 스토어의 chatRoomId가 null이면 참여 중인 방이 없음
        <View style={styles.noChatRoomContainer}>
          <Text style={styles.noChatRoomText}>참여중인 채팅방이 없습니다.</Text>
          <ChatCustomButton
            label="새로운 채팅 시작하기"
            onPress={() => {
              alert("새로운 채팅방에 참여합니다. (실제 방 생성/매칭 로직 연동이 필요합니다)");
              router.push({ pathname: '/chat/ChatRoom', params: { themeId: '1' } });
            }}
            containerStyle={{ marginTop: 20, borderRadius: 30 }}
            textStyle={{ fontSize: 18 }}
          />
        </View>
      ) : ( // chatRoomIdFromStore에 값이 있으면 기존 방 정보가 로드된 것
        <>
          <View style={styles.chatMainContainer}>
            <ChatMain />
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: height * 0.35 }}>
          <ChatCustomButton
            label="입장"
            onPress={() => {
              if (chatRoomIdFromStore) { // 이 시점에는 항상 유효한 ID가 있어야 함
                router.push({
                  pathname: '/chat/ChatRoom',
                  params: {
                    chatRoomId: String(chatRoomIdFromStore),
                    themeId: String(themeIdFromStore || 1), // themeId가 없으면 기본값 1
                  },
                });
              } else if (!error) { // 기존 방이 없고, API 호출 중 오류도 없었다면 새 방 참여 시도
                // 새로운 방 참여 로직 (예: 방 생성 API 호출 후 해당 방으로 이동)
                // 현재는 ChatRoom으로 기본 테마로 이동하도록 단순화되어 있습니다.
                alert("새로운 채팅방에 참여합니다. (실제 방 생성/매칭 로직 연동이 필요합니다)");
                router.push({ pathname: '/chat/ChatRoom', params: { themeId: '1' } }); // 새 방에 대한 기본 테마 또는 다른 로직
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
});