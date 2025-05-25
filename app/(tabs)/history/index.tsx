import { ChatRoomItem, HeartHistoryItem, PageInfo, defaultProfilePng, getChatHistory, getHeartHistory } from "@/api/historyApi";
import EventBannerComponent from "@/components/common/EventBannerComponent";
import Pagination from "@/components/common/Pagination";
import Tab from "@/components/common/Tab";
import HistoryItem, { HistoryItemProps } from "@/components/history/HistoryItem";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const ITEMS_PER_PAGE = 5;
const DUMMY_MEMBER_ID = 1;

export default function HistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'chat' | 'heart'>('chat');
  
  const [chatHistory, setChatHistory] = useState<ChatRoomItem[]>([]);
  const [chatPageInfo, setChatPageInfo] = useState<PageInfo | null>(null);
  const [currentChatPage, setCurrentChatPage] = useState(1);

  const [heartHistory, setHeartHistory] = useState<HeartHistoryItem[]>([]);
  const [currentHeartPage, setCurrentHeartPage] = useState(1);
  const [totalHeartPages, setTotalHeartPages] = useState(1);

  const [loading, setLoading] = useState(false);

  const loadChatHistory = useCallback(async (page: number) => {
    setLoading(true);
    console.log(`채팅 내역 로딩 중... page: ${page}`);
    try {
      const dummyResponse = await getChatHistory(DUMMY_MEMBER_ID, page, ITEMS_PER_PAGE);
      setChatHistory(dummyResponse.data);
      setChatPageInfo(dummyResponse.pageInfo);
      setCurrentChatPage(dummyResponse.pageInfo.page);

    } catch (error) {
      console.error("채팅 내역 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHeartHistory = useCallback(async () => {
    setLoading(true);
    console.log("하트 히스토리 로딩 중...");
    try {
      const dummyResponse = await getHeartHistory(DUMMY_MEMBER_ID);
      setHeartHistory(dummyResponse.data);
      setTotalHeartPages(Math.ceil(dummyResponse.data.length / ITEMS_PER_PAGE));
      setCurrentHeartPage(1);

    } catch (error) {
      console.error("하트 히스토리 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      loadChatHistory(currentChatPage);
    } else {
      loadHeartHistory();
    }
  }, [activeTab, currentChatPage, loadChatHistory, loadHeartHistory]);

  const handleTabChange = (tabName: string) => {
    if (tabName === '1 대 1 채팅 내역') {
      setActiveTab('chat');
      setCurrentChatPage(1);
    } else if (tabName === '하트 히스토리') {
      setActiveTab('heart');
      setCurrentHeartPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (activeTab === 'chat') {
      setCurrentChatPage(page);
    } else {
      setCurrentHeartPage(page);
    }
  };

  const handleChatItemPress = (chatRoomId: number | string) => {
    console.log("채팅방 이동:", chatRoomId);
    router.push({ pathname: '/(tabs)/chat', params: { chatRoomId: chatRoomId.toString() } });
  };

  let currentData: HistoryItemProps[] = [];
  let currentPage = 1;
  let totalPages = 1;

  if (activeTab === 'chat') {
    currentData = chatHistory.map(item => ({
      id: item.chatRoomId,
      type: 'chat',
      profileImage: item.opponentProfileSvg || defaultProfilePng,
      name: item.opponentName || '알 수 없는 상대',
      content: item.lastChat,
      createdAt: item.createdAt,
      onPress: handleChatItemPress,
    }));
    currentPage = currentChatPage;
    totalPages = chatPageInfo?.totalPages || 1;
  } else {
    const startIndex = (currentHeartPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedHearts = heartHistory.slice(startIndex, endIndex);

    currentData = paginatedHearts.map(item => ({
      id: item.roomEventId,
      type: 'heart',
      profileImage: item.senderProfileSvg || defaultProfilePng,
      name: item.senderName || '알 수 없는 사용자',
      content: item.message,
      createdAt: item.createdAt,
    }));
    currentPage = currentHeartPage;
    totalPages = totalHeartPages;
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.topFixedContent}>
        <EventBannerComponent />
        <Tab
          tabs={['1 대 1 채팅 내역', '하트 히스토리']}
          activeTab={activeTab === 'chat' ? '1 대 1 채팅 내역' : '하트 히스토리'}
          onTabChange={handleTabChange}
        />
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#B28EF8" />
        </View>
      ) : currentData.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{activeTab === 'chat' ? '채팅 내역이 없습니다.' : '하트 내역이 없습니다.'}</Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          renderItem={({ item }) => <HistoryItem {...item} />}
          keyExtractor={(item) => item.id.toString()}
          style={styles.listStyle}
          contentContainerStyle={styles.listContentContainer}
          scrollEnabled={false}
        />
      )}

      {!loading && currentData.length > 0 && (
        <View style={styles.paginationContainer}>
            <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
            />
        </View>
      )}
    </View>
  );
}

const { height, width } = Dimensions.get("window");
const BANNER_HEIGHT_APPROX = height * 0.2;
const TAB_HEIGHT_APPROX = 45 + 20 + 20;
const HEADER_CONTENT_HEIGHT = BANNER_HEIGHT_APPROX + TAB_HEIGHT_APPROX;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topFixedContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: '#ffffff',
  },
  listStyle: {
    flexGrow: 0,
    marginTop: HEADER_CONTENT_HEIGHT,
  },
  listContentContainer: {
    paddingBottom: 60,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: HEADER_CONTENT_HEIGHT,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: height * 0.02,
    left: 0,
    right: 0,
    paddingBottom: 10,
    backgroundColor: 'red',
  },
});
